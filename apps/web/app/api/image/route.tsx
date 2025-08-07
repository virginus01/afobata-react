import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import { getS3Url } from '@/app/helpers/getS3Url';
import { isNull, isValidUrl } from '@/app/helpers/isNull';

export const runtime = 'nodejs'; // Ensure Node.js runtime

const apiModules = {
  mongodb: () => import('@/app/api/[tenant]/node/_mongodb'),
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const width = parseInt(searchParams.get('width') || '500', 10);
    const height = parseInt(searchParams.get('height') || '500', 10);
    const id = searchParams.get('id') || '';
    const ext = searchParams.get('ext') || 'webp';

    if (!id) return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    if (width <= 0 || height <= 0 || width > 4000 || height > 4000) {
      return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 });
    }
    const validFormats = ['webp', 'jpeg', 'png', 'jpg'];
    if (!validFormats.includes(ext.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    let imageBuffer: Buffer | null = null;

    try {
      const mdb = await apiModules.mongodb();
      const { data } = await mdb._fetchDataWithConditions('files', { $or: [{ id }, { path: id }] });
      const imgData = data[0];

      if (!isNull(imgData)) {
        if (imgData.provider === 'AWS-S3') {
          try {
            imageBuffer = await downloadImageWithRetry(getS3Url(imgData.path), 3, 1000);
          } catch (error: any) {
            console.error('Failed to download from S3:', error.code);
          }
        } else if (imgData.provider === 'local' && imgData.path) {
          const localImagePath = path.join(process.cwd(), 'public', imgData.path);
          if (fs.existsSync(localImagePath)) {
            imageBuffer = fs.readFileSync(localImagePath);
          }
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    if (!imageBuffer && isValidUrl(id)) {
      try {
        imageBuffer = await downloadImageWithRetry(id, 3, 1000);
      } catch (error) {
        console.error('Failed to download from URL:', error);
      }
    }

    if (!imageBuffer) {
      const localImagePath = path.join(process.cwd(), 'public', 'images', id);
      if (fs.existsSync(localImagePath)) {
        try {
          imageBuffer = fs.readFileSync(localImagePath);
        } catch (error) {
          console.error('Failed to read local file:', error);
        }
      }
    }

    if (!imageBuffer) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    let imageInfo;
    try {
      imageInfo = await sharp(imageBuffer).metadata();
    } catch (error) {
      console.error('Invalid image buffer:', error);
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    let processedImage = sharp(imageBuffer);
    if (imageInfo.width !== width || imageInfo.height !== height) {
      processedImage = processedImage.resize(width, height, {
        fit: 'cover',
        position: 'center',
      });
    }

    const targetFormat = ext.toLowerCase() === 'jpg' ? 'jpeg' : ext.toLowerCase();
    processedImage = processedImage.toFormat(targetFormat as any, {
      quality: 80,
      progressive: true,
    });

    const optimizedImage: any = await processedImage.toBuffer();
    const etag = `"${crypto.createHash('sha1').update(optimizedImage).digest('hex')}"`;

    // Handle If-None-Match for browser revalidation
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          ETag: etag,
        },
      });
    }

    return new NextResponse(optimizedImage, {
      status: 200,
      headers: {
        'Content-Type': `image/${targetFormat}`,
        'Content-Length': optimizedImage.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        ETag: etag,
      },
    });
  } catch (error: any) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

async function downloadImageWithRetry(
  url: string,
  retries: number = 3,
  delay: number = 1000,
): Promise<Buffer> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        httpsAgent: new https.Agent({ keepAlive: true }),
        timeout: 30000,
        maxContentLength: 50 * 1024 * 1024,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageProcessor/1.0)',
        },
      });

      if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers['content-type'];
      if (!contentType?.startsWith('image/')) throw new Error(`Invalid MIME: ${contentType}`);

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error(`Download attempt ${attempt + 1} failed:`, error.code || error.message);
      if (attempt === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, delay * (attempt + 1)));
    }
  }
  throw new Error('Failed to download image after retries');
}
