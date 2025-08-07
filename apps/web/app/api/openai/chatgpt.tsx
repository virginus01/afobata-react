import { api_response } from "@/app/helpers/api_response";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI,
});

export async function generateR() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [{ role: "user", content: "write a haiku about AI" }],
  });

  return api_response({ haiku: completion.choices[0].message.content });
}
