import { getOpenAIResponse } from '@/app/actions';

// Lazy load OpenAI client only when needed
let openaiClient: any = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openaiClient;
};

export async function queryOpenAI({ body }: { body?: any }) {
  try {
    const prompt = body.prompt;
    let model = body.model || 'gpt-3.5-turbo-1106';

    return await getOpenAIResponse({ model, prompt });
  } catch (error) {
    console.error(
      'Error querying OpenAI:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return { data: '' };
  }
}

// export async function oploadOpenAiFiles({
//   filePath = "opeonaidata-e.jsonl",
// }: {
//   filePath?: string;
// }) {
//   try {
//     // Lazy load fs and path only when this function is called
//     const fs = require("fs");
//     const path = require("path");

//     // Get absolute path to the file in public directory
//     const absolutePath = path.join(process.cwd(), "public", filePath);

//     const openai = getOpenAIClient();
//     const file = await openai.files.create({
//       file: fs.createReadStream(absolutePath),
//       purpose: "fine-tune",
//     });

//     return {
//       data: file,
//     };
//   } catch (error) {
//     console.error(
//       "Error querying OpenAI:",
//       error instanceof Error ? error.message : "Unknown error"
//     );
//     return { data: "" };
//   }
// }

// export async function createFineTuningJob({
//   trainingFileId,
//   model,
//   beta = 0.1,
//   type = "supervised",
// }: {
//   trainingFileId?: string;
//   model?: string;
//   beta?: number;
//   type?: "supervised" | "dpo";
// }) {
//   if (!trainingFileId || !model) {
//     return {
//       success: false,
//       error: "some requirements missing",
//       data: null,
//     };
//   }

//   let finalType = type;
//   let dpoTypes = ["gpt-4o-2024-08-06"];
//   if (type === "dpo" && dpoTypes.includes(model)) {
//     finalType = "dpo";
//   } else {
//     finalType = "supervised";
//   }

//   try {
//     const openai = getOpenAIClient();
//     const job = await openai.fineTuning.jobs.create({
//       training_file: trainingFileId,
//       model: model,
//       method: {
//         type: finalType,
//         ...(finalType === "dpo" && {
//           dpo: {
//             hyperparameters: { beta },
//           },
//         }),
//       },
//     });
//     return {
//       success: true,
//       data: job,
//     };
//   } catch (error) {
//     console.error(
//       "Error creating fine-tuning job:",
//       error instanceof Error ? error.message : "Unknown error"
//     );
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//       data: null,
//     };
//   }
// }
