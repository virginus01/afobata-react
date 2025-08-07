import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { queryOpenAI } from '@/api/openai/query';
import { isNull } from '@/app/helpers/isNull';

export async function server_query_ai({
  body,
  provider = 'openai',
}: {
  body?: any;
  provider?: string;
}) {
  try {
    if (isNull(body.prompt)) {
      return invalid_response("prompt can't be null", 200);
    }

    let data = {};
    switch (provider) {
      case 'openai':
        const result = await queryOpenAI({ body });
        data = result.data;
        break;

      default:
        break;
    }
    return api_response({ data, status: true });
  } catch (error) {
    console.error(error);
    return invalid_response('error fetching products');
  }
}

// export async function server_upload_fine_tune_ai_data({
//   body,
//   provider = "openai",
// }: {
//   body?: any;
//   provider?: string;
// }) {
//   try {
//     let data = {};
//     switch (provider) {
//       case "openai":
//         const result = await oploadOpenAiFiles({
//           filePath: body.TrainingfilePath,
//         });
//         data = result.data;
//         break;

//       default:
//         break;
//     }
//     return api_response({ data, status: true });
//   } catch (error) {
//     console.error(error);
//     return invalid_response("error fetching products");
//   }
// }
// export async function server_fine_tune({
//   body,
//   provider = "openai",
// }: {
//   body?: any;
//   provider?: string;
// }) {
//   try {
//     if (!body) {
//       return invalid_response("Request body is missing", 200);
//     }

//     // Check if at least one of TrainingfilePath or trainingFileId is provided
//     if (!body.TrainingfilePath && !body.trainingFileId) {
//       return invalid_response(
//         "Either TrainingfilePath or trainingFileId must be provided",
//         200
//       );
//     }

//     let data: any = {};
//     let trainingFileId = body.trainingFileId;
//     const TrainingfilePath = body.TrainingfilePath;
//     const model = body.model ?? "gpt-3.5-turbo-1106";
//     const beta = body.beta ?? 0.1;
//     const type = body.type ?? "supervised";

//     switch (provider) {
//       case "openai":
//         // If no trainingFileId is provided, upload the file first
//         if (!trainingFileId && TrainingfilePath) {
//           const upload: any = await oploadOpenAiFiles({
//             filePath: TrainingfilePath,
//           });

//           if (!upload.data?.id) {
//             return invalid_response(
//               "Failed to upload training file: " +
//                 (upload.error || "Unknown error"),
//               200
//             );
//           }

//           trainingFileId = upload.data.id;
//         }

//         // Validate trainingFileId before creating fine-tuning job
//         if (!trainingFileId) {
//           return invalid_response(
//             "Failed to obtain valid training file ID",
//             200
//           );
//         }

//         const result = await createFineTuningJob({
//           trainingFileId,
//           model,
//           beta,
//           type,
//         });

//         if (!result.success) {
//           return invalid_response(
//             result.error || "Fine tuning job creation failed",
//             200
//           );
//         }

//         data = result.data;
//         break;

//       default:
//         return invalid_response(`Unsupported provider: ${provider}`, 200);
//     }

//     return api_response({ data, status: true });
//   } catch (error) {
//     console.error(error);
//     return invalid_response(
//       `Error creating fine-tuning job: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }`,
//       200
//     );
//   }
// }
