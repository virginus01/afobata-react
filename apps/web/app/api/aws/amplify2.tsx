import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/app/utils/aws";
import slugify from "slugify";
import sharp from "sharp"; // 🔹 Import Sharp for image optimization
import { cleanFileName } from "@/app/helpers/cleanFileName";
import { isNull } from "@/app/helpers/isNull";

import { api_response } from "@/app/helpers/api_response";
import { invalid_response } from "@/app/helpers/invalid_response";

import { bulkUpsert } from "@/database/mongodb";

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const UPLOAD_TIMEOUT = 30000; // 30 seconds
const CONCURRENT_UPLOADS = 3; // Number of concurrent uploads

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function optimizeImage(file: Buffer, mimeType: string) {
  try {
    let sharpImage = sharp(file).rotate();

    if (mimeType.includes("image/")) {
      // Resize image to max 1200px width while maintaining aspect ratio
      sharpImage = sharpImage.resize({ width: 1200, withoutEnlargement: true });

      // Convert to WebP if possible
      if (!mimeType.includes("gif")) {
        sharpImage = sharpImage.toFormat("webp", { quality: 80 });
      }
    }

    return await sharpImage.toBuffer();
  } catch (error) {
    console.error("Image optimization failed:", error);
    return file; // Return original file if optimization fails
  }
}

// Process files in batches
async function processBatch(
  files: File[],
  siteInfo: BrandType,
  user: UserTypes,
  bucketName: string
) {
  const results = [];
  const fileData: FileType[] = [];

  for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
    const batch = files.slice(i, i + CONCURRENT_UPLOADS);
    const uploadPromises = batch.map(async (file) => {
      try {
        let buffer: any = Buffer.from(await file.arrayBuffer());

        // 🔹 Optimize Image
        buffer = await optimizeImage(buffer, file.type);

        const slug = slugify(file.name, { lower: true, trim: true });
        const filePath = `${siteInfo.id}/${user?.id ?? "all"}/${slug}.webp`;

        const fileName = await uploadFileToS3(
          buffer,
          filePath,
          "image/webp", // 🔹 Store as WebP
          bucketName
        );

        if (fileName) {
          fileData.push({
            title: cleanFileName(file.name),
            slug: slugify(filePath, { lower: true, trim: true }),
            provider: "AWS-S3",
            brandId: siteInfo.id,
            userId: user.id,
            path: filePath,
            type: "image/webp",
            size: buffer.length,
          });
          return { success: true, path: fileName };
        }
        return { success: false, error: `Failed to upload ${file.name}` };
      } catch (error: any) {
        return {
          success: false,
          error: `Error processing ${file.name}: ${error.message}`,
        };
      }
    });

    const batchResults = await Promise.all(uploadPromises);
    results.push(...batchResults);
    if (i + CONCURRENT_UPLOADS < files.length) {
      await delay(500);
    }
  }

  return { results, fileData };
}

export async function uploadToAws(formData: any, siteInfo: BrandType) {
  try {
    const files = formData.getAll("file");
    let userData = formData.get("user");
    let user: UserTypes = {};

    if (!files || files.length === 0) {
      return invalid_response("file is required", 400);
    }

    if (userData) {
      user = JSON.parse(userData);
    }

    if (isNull(user)) {
      return invalid_response("User Data needed", 400);
    }

    const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET;
    if (!bucketName) {
      return invalid_response("AWS bucket not configured", 500);
    }

    const { results, fileData } = await processBatch(
      files,
      siteInfo,
      user,
      bucketName
    );

    const successfulUploads = results
      .filter((r) => r.success)
      .map((r) => r.path);
    const errors = results.filter((r) => !r.success).map((r) => r.error);

    if (successfulUploads.length === 0) {
      return invalid_response(
        `Failed to upload all files. Errors: ${errors.join("; ")}`,
        500
      );
    }

    if (fileData.length > 0) {
      await bulkUpsert(fileData, "files");
    }

    return api_response({
      success: true,
      data:
        successfulUploads.length === 1
          ? successfulUploads[0]
          : successfulUploads,
      msg:
        errors.length > 0
          ? `Partial success. Some files failed: ${errors.join("; ")}`
          : "success",
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
  bucketName: string
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
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Upload timeout")), UPLOAD_TIMEOUT);
      });

      await Promise.race([s3Client.send(command), timeoutPromise]);

      return filePath;
    } catch (error: any) {
      attempts++;
      console.error(
        `Attempt ${attempts} failed for ${filePath}:`,
        error.message || error
      );

      if (attempts === MAX_RETRIES) {
        console.error(`All retry attempts failed for ${filePath}`);
        return null;
      }

      await delay(RETRY_DELAY * attempts);
    }
  }

  return null;
}
