"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { google } from "./ai";

export type ProfileData = {
  name: string;
  summary: string;
  experience: { title: string; company: string; duration: string; description: string }[];
  education: { degree: string; institution: string; year: string }[];
  skills: string[];
};

const profileSchema = z.object({
  name: z.string(),
  summary: z.string(),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      duration: z.string(),
      description: z.string(),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string(),
    })
  ),
  skills: z.array(z.string()),
});

export async function extractProfile(formData: FormData): Promise<ProfileData> {
  const file = formData.get("resume") as File;
  const buffer = await file.arrayBuffer();

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: profileSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract profile data from this CV. Return JSON with:
- name: full name
- summary: 2–3 sentence professional summary in English
- experience: array of jobs (most recent first), each with title, company, duration, description
- education: array of degrees, each with degree, institution, year
- skills: top 10–15 strongest skills as strings`,
          },
          { type: "file", data: buffer, mediaType: "application/pdf" },
        ],
      },
    ],
  });

  return object;
}
