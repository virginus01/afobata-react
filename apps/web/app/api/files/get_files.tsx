import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { fetchDataWithConditions } from '@/database/mongodb';
import { getS3Url } from '@/app/helpers/getS3Url';

export async function get_files({ type, userId }: { type?: string; userId: string }) {
  try {
    let condictions: any = { userId: userId };

    if (type) {
      condictions.type = type;
    }

    const files = await fetchDataWithConditions('files', condictions);

    const modifiedFiles = [];

    if (files) {
      for (const file of files) {
        const imgUrl = getS3Url(file.path);
        modifiedFiles.push({
          ...file,
          publicUrl: imgUrl,
        });
      }
    }

    return api_response({ data: modifiedFiles, status: true });
  } catch (error) {
    console.error(error);
    return invalid_response('error geting files');
  }
}
