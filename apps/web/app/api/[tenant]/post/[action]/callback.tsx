import { bulkUpsert, fetchDataWithConditions, updateData } from '@/app/api/database/mongodb';
import { sendMail, validateEmail } from '@/app/api/mail/send_mail';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { isNull } from '@/app/helpers/isNull';
import axios from 'axios';
import slugify from 'slugify';

export async function post_callback({ body }: { body: any }) {
  let res: any = {};

  if (body && body.buildType) {
    return await MobileBuildcallback({ body });
  }

  return api_response({ status: res.status, data: res });
}

export async function MobileBuildcallback({ body }: { body: any }) {
  try {
    // Fetch brand data based on tenantId
    const [brand] = await fetchDataWithConditions('brands', {
      id: body.tenantId,
    });

    if (isNull(brand)) {
      return invalid_response(`Brand: ${body.tenantId} not found`, 500);
    }

    let newFiles: any = brand.mobileAppsData ?? {};
    let fileData: FileType[] = [];

    if (body?.downloadUrls?.apk) {
      newFiles.apk = {
        ...body,
        buildTime: convertDateTime(body.buildTime),
        publicUrl: unmaskUrl(body.downloadUrls.apk),
        type: 'apk',
      };

      fileData.push({
        title: `APK File ${Date.now()}`,
        slug: slugify(body?.s3Paths?.apk ?? `AAB File ${Date.now()}`, { lower: true, trim: true }),
        provider: 'AWS-S3',
        brandId: brand?.id,
        userId: brand?.userId,
        path: body?.s3Paths?.apk,
        type: 'apk',
        size: body?.fileSizes?.apk ?? 1000000,
      });
    }

    if (body?.downloadUrls?.aab) {
      newFiles.aab = {
        ...body,
        buildTime: convertDateTime(body.buildTime),
        publicUrl: unmaskUrl(body.downloadUrls.aab),
        type: 'aab',
      };
      fileData.push({
        title: `AAB File ${Date.now()}`,
        slug: slugify(body?.s3Paths?.aab ?? `AAB File ${Date.now()}`, { lower: true, trim: true }),
        provider: 'AWS-S3',
        brandId: brand?.id,
        userId: brand?.userId,
        path: body?.s3Paths?.aab,
        type: 'aab',
        size: body?.fileSizes?.aab ?? 1000000,
      });
    }

    if (body?.downloadUrls?.ios) {
      newFiles.ios = {
        ...body,
        buildTime: convertDateTime(body.buildTime),
        publicUrl: unmaskUrl(body.downloadUrls.ios),
        type: 'ios',
      };
      fileData.push({
        title: `IOS File ${Date.now()}`,
        slug: slugify(body?.s3Paths?.ios ?? `AAB File ${Date.now()}`, { lower: true, trim: true }),
        provider: 'AWS-S3',
        brandId: brand?.id,
        userId: brand?.userId,
        path: body?.s3Paths?.ios ?? '',
        type: 'ios',
        size: body?.fileSizes?.ios ?? 1000000,
      });
    }

    if (fileData.length > 0) {
      await bulkUpsert(fileData, 'files');
    }

    // Assuming updateData is a function that updates the brand
    const res = await updateData({
      data: { mobileAppsData: newFiles },
      table: 'brands',
      id: brand.id,
    });

    if (res.status) {
      const [user] = await fetchDataWithConditions('users', {
        id: brand.userId,
      });

      let isValid = user.emailVerified;

      if (!isValid) {
        isValid = await validateEmail(user.email ?? '');
      }

      if (isValid) {
        const sendData: SendMailData = {
          to: [user.email ?? '', 'afobata@gmail.com'],
          from: `${brand.name} <no-reply@afobata.com>`,
          subject: `${brand.name} Mobile App(s) is ready 🎉`,
          brand,
          body: { data: { apps: newFiles, brand, user }, templateId: 'mobileAppsReady' },
        };

        const send = await sendMail({
          data: sendData,
        });

        if (!send.success) {
          console.error(send.msg);
        }
      }

      return api_response({ data: newFiles, status: res.status });
    }

    return invalid_response('error saving  files');
  } catch (error: any) {
    console.error('Error in MobileBuildcallback:', error);
    return invalid_response(`Error in MobileBuildcallback ${error.statusText}`);
  }
}

export function unmaskUrl(maskedUrl: string) {
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const bucket = process.env.NEXT_PUBLIC_AWS_BUCKET;

  const fmaskedUrl = maskedUrl.replace(
    /https:\/\/s3\.\*\*\*\.amazonaws\.com\/\*\*\*\//,
    `https://s3.${region}.amazonaws.com/${bucket}/`,
  );

  return fmaskedUrl;
}

const fetchFileFromUrl = async (url: string): Promise<Buffer> => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('Failed to fetch file from URL:', error.message);
    throw new Error('Unable to download file from provided URL.');
  }
};
