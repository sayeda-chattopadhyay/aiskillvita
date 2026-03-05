import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Shared Google AI client used by all server actions.
// Created once here so the API key setup is never duplicated.
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});


export const model = google("gemini-2.5-flash-lite");