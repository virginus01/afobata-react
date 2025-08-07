import { uploadFileToS3 } from '@/app/api/aws/aws_upload';
import { api_response } from '@/app/helpers/api_response';
import { baseUrl } from '@/app/helpers/baseUrl';
import { response } from '@/app/helpers/response';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import sharp from 'sharp';
import axios from 'axios';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { isNull } from '@/app/helpers/isNull';
import { isTooRecent, getRemainingTime } from '@/app/helpers/isTooRecentAndTime';
import { Brand } from '@/app/models/Brand';
import { getCookie, setCookie } from '@/app/actions';

// ============================
// CONFIGURATION CONSTANTS
// ============================
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const AWS_S3_BUCKET = process.env.NEXT_PUBLIC_AWS_BUCKET!;
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION!;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const REPO_OWNER = 'virginus01';
const REPO_NAME = 'next_afo_web';
const BASE_BRANCH = 'main';
const WORKFLOW_FILE_PATH = '.github/workflows/mobile-build.yml';
const KEYSTORE_PATH = 'android/.secure/androidKey.jks';
const KEYSTORE_S3_KEY = 'androidKey.jks';
const OFFLINE_URL = '/offline.html';

// ============================
// INTERFACES
// ============================
interface IconConfig {
  size: number;
  path: string;
  density?: string; // For Android
  scale?: string; // For iOS
}

// ============================
// ASSETS CONFIGURATION
// ============================
// Define standard icon sizes for Android

const capacitorIcons: IconConfig[] = [
  { size: 1024, path: 'assets/icon-only.png', density: 'icon-only' },
  { size: 1024, path: 'assets/icon-foreground.png', density: 'icon-foreground' },
];

const capacitorSplashScreens = [
  { size: 2732, path: 'assets/splash.png', density: 'splash' },
  { size: 2732, path: 'assets/splash-dark.png', density: 'splash-dark' },
];

const bgs = [{ size: 1024, path: 'assets/icon-background.png', density: 'icon-background.png' }];

const FILE_PATHS = ['android/app/src/main/res/values/strings.xml', 'android/app/build.gradle'];

// ============================
// UTILITY FUNCTIONS
// ============================
// Stream to string utility function
const streamToString = async (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () =>
      resolve(Buffer.concat(chunks.map((chunk) => new Uint8Array(chunk))).toString('utf-8')),
    );
    stream.on('error', reject);
  });
};

// S3 client initialization
const getS3Client = () => {
  return new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
};

// GitHub client initialization
const getGitHubClient = () => {
  return new Octokit({ auth: GITHUB_TOKEN });
};

// Helper to convert hex color to RGB
const hexToRgb = (hex: any): { r: number; g: number; b: number } => {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Default to black if parse failed
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return { r: 0, g: 0, b: 0 };
  }

  return { r, g, b };
};

// ============================
// GITHUB REPOSITORY FUNCTIONS
// ============================
// Fetch content from GitHub repository
const getRepoFileContent = async (octokit: Octokit, path: string, ref: string): Promise<string> => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      ref,
    });

    if ('content' in data) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    throw new Error(`${path} is not a file`);
  } catch (error: any) {
    console.error(`Error fetching ${path}:`, error.message);
    throw new Error(`Failed to fetch ${path}: ${error.message}`);
  }
};

// Handle branch management
const manageBranch = async (octokit: Octokit, branchName: string): Promise<string> => {
  try {
    // Check if branch exists and delete if it does
    try {
      await octokit.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/${branchName}`,
      });

      // Branch exists, delete it
      await octokit.git.deleteRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/${branchName}`,
      });
    } catch (error: any) {
      // If error is not 404 (branch not found), then something else went wrong
      if (error.status !== 404) {
        console.error('Error checking branch:', error.message);
      }
    }

    // Fetch the latest commit SHA from the base branch
    const { data } = await octokit.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${BASE_BRANCH}`,
    });

    const latestCommitSha = data.object.sha;

    // Create new branch
    await octokit.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: latestCommitSha,
    });

    console.info(`Created new branch: ${branchName} from ${BASE_BRANCH} (${latestCommitSha})`);
    return latestCommitSha;
  } catch (error: any) {
    console.error('Error managing branch:', error.message);
    throw new Error(`Branch management failed: ${error.message}`);
  }
};

// Update or create file in repository
const updateRepoFile = async (
  octokit: Octokit,
  path: string,
  content: string,
  message: string,
  branch: string,
  isBinary: boolean = false,
): Promise<void> => {
  try {
    // Check if file exists to get SHA
    let fileSha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path,
        ref: branch,
      });

      if ('sha' in data) {
        fileSha = data.sha;
      }
    } catch (error) {
      // File doesn't exist yet, which is fine
    }

    // For binary files, content is already base64
    const encodedContent = isBinary ? content : Buffer.from(content).toString('base64');

    // Create or update file
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message,
      content: encodedContent,
      branch,
      ...(fileSha && { sha: fileSha }),
    });

    console.info(`File ${path} updated successfully.`);
    return;
  } catch (error: any) {
    console.error(`Error updating file ${path}:`, error.message);
    throw new Error(`Failed to update ${path}: ${error.message}`);
  }
};

// ============================
// S3 & ASSET FUNCTIONS
// ============================
// Fetch keystore from S3
const fetchKeystoreFromS3 = async (): Promise<string> => {
  const s3Client = getS3Client();

  try {
    const keystoreCommand = new GetObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: KEYSTORE_S3_KEY,
    });

    const keystoreResponse = await s3Client.send(keystoreCommand);

    if (!keystoreResponse.Body) {
      throw new Error('Keystore file is empty');
    }

    return await streamToString(keystoreResponse.Body as Readable);
  } catch (error: any) {
    console.error('Error fetching keystore from S3:', error.message);
    throw new Error(`Failed to fetch keystore: ${error.message}`);
  }
};

// Get image from S3 bucket
const getImageFromS3 = async (key: string): Promise<Buffer> => {
  const s3Client = getS3Client();
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    });

    const response = await s3Client.send(command);
    if (!response.Body) {
      throw new Error(`Image ${key} is empty`);
    }

    // Convert the stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks.map((chunk) => new Uint8Array(chunk)));
  } catch (error: any) {
    console.error(`Error fetching image ${key} from S3:`, error.message);
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
};

// Upload keystore to S3 if needed
async function uploadKeystore(): Promise<boolean> {
  try {
    // Use process.cwd() to get the root of the Next.js project
    const filePath = path.join(process.cwd(), 'android', '.secure', 'androidKey.jks');

    // Check if the file exists before reading it
    if (!fs.existsSync(filePath)) {
      console.error('Keystore file does not exist at the given path');
      return false;
    }

    // Read the file into a Buffer
    const file = fs.readFileSync(filePath);
    const type = 'application/octet-stream'; // Set the MIME type

    const result = await uploadFileToS3(file, KEYSTORE_S3_KEY, type, AWS_S3_BUCKET);
    return !!result;
  } catch (error: any) {
    console.error('Error uploading keystore:', error.message);
    return false;
  }
}

// Upload icon to S3
export async function uploadIconToS3(
  file: Buffer,
  tenantId: string,
  type: string = 'image/png',
): Promise<boolean> {
  try {
    const s3Client = getS3Client();
    const key = `tenants/${tenantId}/icon.png`;

    // Process image with sharp to ensure it's a valid PNG
    const processedImage = await sharp(file)
      .resize({ width: 1024, height: 1024, fit: 'inside' })
      .png()
      .toBuffer();

    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: processedImage,
      ContentType: type,
    });

    await s3Client.send(command);

    return true;
  } catch (error: any) {
    console.error('Error uploading icon to S3:', error.message);
    return false;
  }
}

// API handler for icon uploads
export async function uploadTenantIcon({ tenantId, file }: { tenantId: string; file: Buffer }) {
  try {
    if (!tenantId || !file) {
      return response({
        status: false,

        msg: 'Missing tenant ID or icon file',
      });
    }

    const success = await uploadIconToS3(file, tenantId);

    if (success) {
      return api_response({
        status: true,
        msg: 'Icon uploaded successfully',
        data: {
          tenantId,
          iconPath: `tenants/${tenantId}/icon.png`,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      return response({
        status: false,

        msg: 'Failed to upload icon',
      });
    }
  } catch (error: any) {
    return response({
      status: false,

      msg: 'Icon upload failed',
      data: error.message,
    });
  }
}

// ============================
// IMAGE PROCESSING FUNCTIONS
// ============================
// Resize image for different icon and splash sizes
const resizeImage = async (
  imageBuffer: Buffer,
  size: number,
  options: { fit?: 'cover' | 'contain' } = { fit: 'contain' },
): Promise<Buffer> => {
  try {
    return await sharp(imageBuffer)
      .resize({
        width: size,
        height: size,
        fit: options.fit,
      })
      .png()
      .toBuffer();
  } catch (error: any) {
    console.error(`Error resizing image to ${size}:`, error.message);
    throw new Error(`Image resizing failed: ${error.message}`);
  }
};

// Create splash screen image with logo in center
const createSplashScreen = async (
  logoBuffer: Buffer,
  backgroundColor: string,
  width: number,
  height: number = width,
): Promise<Buffer> => {
  try {
    // Resize logo to be 1/3 of the width
    const logoSize = Math.round(width / 3);
    const resizedLogo = await sharp(logoBuffer)
      .resize({
        width: logoSize,
        height: logoSize,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .toBuffer();

    // Create background with specified color
    const { r, g, b } = hexToRgb(backgroundColor);

    // Create a new image with the logo centered
    return await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r, g, b, alpha: 1 },
      },
    })
      .composite([
        {
          input: resizedLogo,
          gravity: 'center',
        },
      ])
      .png()
      .toBuffer();
  } catch (error: any) {
    console.error(`Error creating splash screen:`, error.message);
    throw new Error(`Splash screen creation failed: ${error.message}`);
  }
};

const processAndroidAssets = async (
  octokit: Octokit,
  branchName: string,
  formData: Brand,
  iconBuffer: Buffer,
  logoBuffer: Buffer,
  bgBuffer: Buffer,
): Promise<void> => {
  const splashBackgroundColor = formData?.mobileConfig?.primaryColor || '#FFFFFF';

  // Temporary array to store file changes
  const filesToCommit: Array<{ path: string; content: string; message: string }> = [];

  // Process Capacitor Icons
  for (const icon of capacitorIcons) {
    const resizedIcon = await resizeImage(iconBuffer, icon.size);
    filesToCommit.push({
      path: icon.path,
      content: resizedIcon.toString('base64'),
      message: `Add Capacitor ${icon.density} icon for ${formData.id}`,
    });
  }

  // Process Background Images
  for (const bg of bgs) {
    const resizedIcon = await resizeImage(bgBuffer, bg.size);
    filesToCommit.push({
      path: bg.path,
      content: resizedIcon.toString('base64'),
      message: `Add Capacitor ${bg.density} icon for ${formData.id}`,
    });
  }

  // Process Splash Screens
  for (const splash of capacitorSplashScreens) {
    const splashImage = await createSplashScreen(
      logoBuffer,
      splashBackgroundColor,
      splash.size,
      splash.size,
    );
    filesToCommit.push({
      path: splash.path,
      content: splashImage.toString('base64'),
      message: `Add Capacitor ${splash.density} splash screen for ${formData.id}`,
    });
  }

  // Commit all changes in a single operation
  for (const file of filesToCommit) {
    await updateRepoFile(octokit, file.path, file.content, file.message, branchName, true);
  }

  console.info(`Processed Capacitor assets for ${formData.id}`);
};

// ============================
// CAPACITOR CONFIG GENERATION
// ============================
// Generate capacitor config based on brand settings
const generateCapacitorConfig = (formData: Brand): string => {
  if (!formData?.mobileConfig?.bundleId || !formData?.mobileConfig?.appName) {
    throw new Error('Missing required mobile configuration: bundleId or appName');
  }

  const jsonData = generateCapacitorConfigJson(formData); // still a string here

  return `
import type { CapacitorConfig } from '@capacitor/cli';
import { Style } from '@capacitor/status-bar';

const config: CapacitorConfig = ${jsonData};

export default config;
`;
};

const generateCapacitorConfigJson = (formData: Brand): string => {
  if (!formData?.mobileConfig?.bundleId || !formData?.mobileConfig?.appName) {
    throw new Error('Missing required mobile configuration: bundleId or appName');
  }

  let url = `https://${formData?.id}.afobata.com/${
    formData.id ?? formData.id ?? formData.slug
  }/dashboard?plateform=app`;

  let hostname = `${formData?.id}.afobata.com`;

  if (!isNull(formData?.domain)) {
    url = `https://${formData.domain}/${formData.id ?? formData.id ?? formData.slug}/dashboard?plateform=app`;
    hostname = formData?.domain ?? '';
  }

  const errorPathValue =
    formData?.mobileConfig?.platform === 'android'
      ? 'offline-android.html'
      : 'capacitor://offline-android.html';

  const primaryColor = formData?.mobileConfig?.primaryColor || '#000000';
  const splashColor = formData?.mobileConfig?.primaryColor || '#FFFFFF';

  return JSON.stringify(
    {
      appId: formData?.mobileConfig?.bundleId,
      appName: formData?.mobileConfig?.appName,
      webDir: 'public',
      resolveServiceWorkerRequests: false,
      server: {
        androidScheme: 'http',
        url: url,
        cleartext: true,
        errorPath: errorPathValue,
      },

      plugins: {
        StatusBar: {
          backgroundColor: primaryColor,
          style: 'LIGHT',
          overlaysWebView: true,
        },
        SplashScreen: {
          launchShowDuration: 10000,
          launchAutoHide: true,
          backgroundColor: splashColor,
          androidSplashResourceName: 'splash',
          androidScaleType: 'CENTER_CROP',
          showSpinner: false,
          splashFullScreen: true,
          splashImmersive: true,
          CapacitorHttp: {
            enabled: true,
          },
        },
      },
      android: {
        backgroundColor: primaryColor,
        allowMixedContent: true,
        buildOptions: {
          keystorePath: 'android/.secure/androidKey.jks',
          keystoreAlias: 'afobata',
        },
      },
      bundledWebRuntime: false,
    },
    null,
    2,
  );
};

// ============================
// MAIN BUILD FUNCTIONS
// ============================
// Main function to trigger GitHub Actions with icon and splash support
const triggerGitHubActions = async (
  formData: Brand,
  iconBuffer: Buffer,
  logoBuffer: Buffer,
  bgBuffer: Buffer,
): Promise<{ msg: string; branchId: string; data?: any; status: boolean }> => {
  if (!formData || !formData.id) {
    return { msg: 'Invalid brand data provided', branchId: '', data: {}, status: false };
  }

  if (isNull(iconBuffer) || isNull(logoBuffer) || isNull(bgBuffer)) {
    return { msg: 'Icon or logo or bg not provided', branchId: '', status: false };
  }

  const octokit = getGitHubClient();
  const branchName = `temp-branch-${formData.id}-${Date.now()}`;

  try {
    // Step 1: Manage branch (create new or replace existing)
    await manageBranch(octokit, branchName);

    // Step 2: Update capacitor config
    const capacitorConfig = generateCapacitorConfig(formData);
    await updateRepoFile(
      octokit,
      'capacitor.config.ts',
      capacitorConfig,
      `Update capacitor config for ${formData.name || formData.id}`,
      branchName,
    );

    const capacitorConfigJson = generateCapacitorConfigJson(formData);
    await updateRepoFile(
      octokit,
      'capacitor.config.json',
      capacitorConfigJson,
      `Update capacitor config json for ${formData.name || formData.id}`,
      branchName,
    );

    // Step 3: Fetch and upload keystore
    const keystoreContent = await fetchKeystoreFromS3();
    await updateRepoFile(
      octokit,
      KEYSTORE_PATH,
      keystoreContent,
      `Add keystore for tenant ${formData.id}`,
      branchName,
    );

    // Step 4: Process and add icon and splash screens
    await processAndroidAssets(octokit, branchName, formData, iconBuffer, logoBuffer, bgBuffer);

    // Step 5: Get workflow file content and update it
    let workflowContent;

    try {
      workflowContent = await getRepoFileContent(octokit, 'mobile-build.yml', 'heads/main');
    } catch (innerError) {
      return { msg: 'Workflow file not found in either location', status: false, branchId: '' };
    }

    // Add workflow file
    await updateRepoFile(
      octokit,
      WORKFLOW_FILE_PATH,
      workflowContent,
      `${formData.name || formData.id} mobile app build`,
      branchName,
    );

    //trigger here if not dispatched automatically

    return {
      data: {
        msg: "App Building Successfully Started. We're building your app(s) right now and this will take between 3-5 minutes to complete. We will notify you via email once ready. Don't hesitate to contact us after 5 minutes if you don't see your app(s) in the download section or haven't received an email containing the download links.",
      },
      branchId: branchName,
      msg: 'Building, Awaiting Completion',
      status: true,
    };
  } catch (error: any) {
    console.error('Error in GitHub Actions trigger:', error);
    return { msg: `Build process failed: ${error.message}`, branchId: '', status: false };
  }
};

// Function to ensure keystore exists in S3 before building
export async function ensureKeystoreExists(): Promise<boolean> {
  try {
    const s3Client = getS3Client();
    const keystoreCommand = new GetObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: KEYSTORE_S3_KEY,
    });

    try {
      await s3Client.send(keystoreCommand);
      return true; // Keystore exists
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404) {
        // Keystore doesn't exist, upload it
        return uploadKeystore();
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error checking keystore:', error.message);
    return false;
  }
}

const fetchIconFromUrl = async (url: string): Promise<Buffer> => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('Failed to fetch icon from URL:', error.message);
    throw new Error('Unable to download icon from provided URL.');
  }
};

// ============================
// PUBLIC API FUNCTIONS
// ============================
// Main server function to trigger build
export async function server_trigger_build({ formData }: { formData?: Brand }) {
  try {
    if (!formData) {
      return response({
        status: false,
        msg: 'Missing brand data',
      });
    }

    const lastBuild = await getCookie(`_build_${formData?.mobileConfig?.platform}`);
    let remainingTime = null;

    if (!isNull(formData?.mobileAppsData) || lastBuild) {
      const { apk, aab, ios } = formData?.mobileAppsData as any;
      const androidBlocked =
        (apk?.buildTime && isTooRecent(apk?.buildTime)) ||
        (aab?.buildTime && isTooRecent(aab?.buildTime)) ||
        (lastBuild && isTooRecent(lastBuild));

      remainingTime = getRemainingTime(apk?.buildTime ?? aab?.buildTime ?? lastBuild);

      if (formData?.mobileConfig?.platform === 'android' && androidBlocked) {
        return response({
          status: false,
          msg: `try again after ${remainingTime}`,
          data: "Your started a build in the last 24 hours so you can't start again now",
        });
      }
    }

    // Validate required fields
    if (!formData.id || !formData.mobileConfig?.bundleId || !formData.mobileConfig?.appName) {
      return response({
        status: false,
        msg: 'Missing required mobile configuration',
      });
    }

    if (formData.mobileConfig.platform === 'ios') {
      return response({
        status: false,
        msg: 'ios app building currently not available, use PWA',
      });
    }

    if (isNull(formData.logo)) {
      return response({
        status: false,
        msg: 'add a logo and try again',
      });
    }

    if (isNull(formData.icon)) {
      return response({
        status: false,
        msg: 'add an icon and try again',
      });
    }

    const missing = findMissingFields({
      appName: formData.mobileConfig.bundleId,
      bundleId: formData.mobileConfig.bundleId,
    });

    if (missing) {
      return response({
        status: false,
        msg: `${missing} missing`,
        data: `${missing}: missing`,
      });
    }

    // Make sure keystore exists
    const keystoreExists = await ensureKeystoreExists();
    if (!keystoreExists) {
      return response({
        status: false,

        msg: 'Failed to ensure keystore exists',
      });
    }

    const bg = await baseUrl('/api/image?id=icon-background.png&width=1024&height=1024&ext=png');

    const iconBuffer = await fetchIconFromUrl(formData?.mobileConfig?.icon ?? '');
    const logoBuffer = await fetchIconFromUrl(formData?.mobileConfig?.logo ?? '');
    const bgBuffer = await fetchIconFromUrl(bg);
    // Trigger GitHub Actions
    const actionResult: any = await triggerGitHubActions(
      formData,
      iconBuffer,
      logoBuffer,
      bgBuffer,
    );

    // Return appropriate response
    if (
      actionResult?.msg?.includes('failed') ||
      actionResult?.msg?.includes('error') ||
      !actionResult.status
    ) {
      return response({
        data: actionResult,
        status: false,
        msg: actionResult.msg,
      });
    }

    await setCookie(convertDateTime(), `_build_${formData?.mobileConfig?.platform}`);

    return response({
      data: {
        branchId: actionResult.branchId,
        timestamp: new Date().toISOString(),
        brand: formData.name || formData.id,
        msg: actionResult.msg,
      },
      status: true,
      msg: actionResult.msg,
    });
  } catch (error: any) {
    console.error('Server trigger build error');
    throw error;
  }
}

// types
type WorkflowRun = {
  status: string; // "completed", "in_progress", etc.
  conclusion: string | null; // "success", "failure", etc.
  html_url: string;
};

export async function server_check_action_status({ branchId }: { branchId: string }) {
  try {
    if (1 === 1) {
      return api_response({ status: true });
    }
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${encodeURIComponent(
      'Mobile App Build',
    )}/runs?branch=${branchId}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const latestRun: WorkflowRun | undefined = data.workflow_runs?.[0];

    if (!latestRun) {
      return api_response({
        status: false,
        msg: 'No workflow runs found for the branch.',
        data: {},
      });
    }

    return api_response({
      status: true,
      msg: '',
      data: {
        status: latestRun.status,
        conclusion: latestRun.conclusion,
        runUrl: latestRun.html_url,
      },
    });
  } catch (error: any) {
    console.error('Server check action status error:', error);
    return api_response({
      status: false,
      msg: `Build status check failed: ${error.message}`,
      data: {},
    });
  }
}
