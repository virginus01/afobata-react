import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/app/utils/aws';
import slugify from 'slugify';
import { cleanFileName } from '@/app/helpers/cleanFileName';
import { isNull } from '@/app/helpers/isNull';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

import { bulkUpsert } from '@/database/mongodb';
import * as fs from 'fs';
import { getSeverSessionData } from '@/app/controller/auth_controller';

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const UPLOAD_TIMEOUT = 30000; // 30 seconds
const CONCURRENT_UPLOADS = 3; // Number of concurrent uploads

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Process files in batches
// Process files in batches - updated to accept formidable files
async function processBatch(
  files: any[], // Changed type from File[] to any[]
  siteInfo: BrandType,
  user: UserTypes,
  bucketName: string,
) {
  const results = [];
  const fileData: FileType[] = [];

  // Process files in chunks
  for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
    const batch = files.slice(i, i + CONCURRENT_UPLOADS);
    const uploadPromises = batch.map(async (file) => {
      try {
        // Read the file from disk instead of using arrayBuffer()
        const buffer = fs.readFileSync(file.filepath);

        const originalFilename = file.originalFilename || file.newFilename || 'unknown';
        const slug = slugify(originalFilename, { lower: true, trim: true });
        const filePath = `${siteInfo.id}/${!isNull(user) ? user.id : 'all'}/${slug}`;

        const fileName = await uploadFileToS3(buffer, filePath, file.mimetype, bucketName);

        if (fileName) {
          fileData.push({
            title: cleanFileName(originalFilename),
            slug: slugify(filePath, { lower: true, trim: true }),
            provider: 'AWS-S3',
            brandId: siteInfo.id,
            userId: user.id,
            path: filePath,
            type: file.mimetype,
            size: file.size,
          });
          return { success: true, path: fileName };
        }
        return { success: false, error: `Failed to upload ${originalFilename}` };
      } catch (error: any) {
        const filename = file.originalFilename || file.newFilename || 'unknown file';
        return {
          success: false,
          error: `Error processing ${filename}: ${error.message}`,
        };
      }
    });

    // Wait for current batch to complete before processing next batch
    const batchResults = await Promise.all(uploadPromises);
    results.push(...batchResults);

    // Small delay between batches to prevent overwhelming the connection
    if (i + CONCURRENT_UPLOADS < files.length) {
      await delay(500);
    }
  }

  return { results, fileData };
}

// Define an interface for formidable file structure
interface FormidableFile {
  filepath: string;
  originalFilename: string;
  newFilename?: string;
  mimetype: string;
  size: number;
  [key: string]: any;
}

// Define a function to convert formidable files to File-like objects with filepath
function convertFormidableToFile(formidableFile: FormidableFile): any {
  // Return a minimal object that preserves the filepath property
  return {
    filepath: formidableFile.filepath,
    originalFilename: formidableFile.originalFilename || formidableFile.newFilename || 'unknown',
    mimetype: formidableFile.mimetype,
    size: formidableFile.size,
  };
}

export async function uploadToAws(formData: any, filesData: any, siteInfo: BrandType) {
  try {
    // Don't convert the files, just pass them directly to processBatch
    const formidableFiles = Object.values(filesData).flat();

    const session = await getSeverSessionData();

    let user: UserTypes = { ...session, id: session?.userId };

    if (!formidableFiles || formidableFiles.length === 0) {
      return invalid_response('file is required', 400);
    }

    if (isNull(user)) {
      return invalid_response('User Data needed', 400);
    }

    const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET;
    if (!bucketName) {
      return invalid_response('AWS bucket not configured', 500);
    }

    const { results, fileData } = await processBatch(formidableFiles, siteInfo, user, bucketName);

    const successfulUploads = results.filter((r) => r.success).map((r) => r.path);
    const errors = results.filter((r) => !r.success).map((r) => r.error);

    if (successfulUploads.length === 0) {
      return invalid_response(`Failed to upload all files. Errors: ${errors.join('; ')}`, 500);
    }

    // Only insert successful uploads into database
    if (fileData.length > 0) {
      await bulkUpsert(fileData, 'files');
    }

    return api_response({
      success: true,
      data: successfulUploads.length === 1 ? successfulUploads[0] : successfulUploads,
      msg:
        errors.length > 0 ? `Partial success. Some files failed: ${errors.join('; ')}` : 'success',
    });
  } catch (error: any) {
    console.error(`Error uploading file(s): ${error.stack || error}`);
    return invalid_response(`Error uploading files: ${error.message}`, 500);
  }
}

export async function uploadFileToS3(
  file: Buffer,
  filePath: string,
  type: string,
  bucketName: string,
): Promise<string | null> {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const params = {
        Bucket: bucketName,
        Key: filePath,
        Body: file,
        ContentType: type,
      };

      const command = new PutObjectCommand(params);

      // Set up timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout')), UPLOAD_TIMEOUT);
      });

      // Race between the upload and the timeout
      await Promise.race([s3Client.send(command), timeoutPromise]);

      // If successful, break the loop and return
      return filePath;
    } catch (error: any) {
      attempts++;
      console.error(`Attempt ${attempts} failed for ${filePath}:`, error.message || error);

      if (attempts === MAX_RETRIES) {
        console.error(`All retry attempts failed for ${filePath}`);
        return null;
      }

      // Wait before retrying
      await delay(RETRY_DELAY * attempts);
    }
  }

  return null;
}
