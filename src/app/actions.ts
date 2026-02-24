"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

import { generateText } from "ai";

export async function extractSkills(formData: FormData) {
  const file = formData.get("resume") as File;

  const buffer = await file.arrayBuffer();

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: 'Extract all professional skills from this CV. Return ONLY a valid JSON array of strings, no markdown, no explanation. Example: ["JavaScript", "React"]',
          },
          { type: "file", data: buffer, mediaType: "application/pdf" },
        ],
      },
    ],
  });

  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as string[];
}
