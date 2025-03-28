import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

export const openai = new OpenAI({
  apiKey,
  //organization: process.env.OPENAI_ORG_ID, // Optional
});
