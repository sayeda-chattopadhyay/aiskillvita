"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { model } from "./ai";

export type ProfileData = {
  name: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: { degree: string; institution: string; year: string }[];
  skills: string[];
  extras?: { section: string; items: string[] }[];
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
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string(),
    }),
  ),
  skills: z.array(z.string()),
  extras: z
    .array(
      z.object({
        section: z.string(),
        items: z.array(z.string()),
      }),
    )
    .optional(),
});

export async function extractProfile(formData: FormData): Promise<ProfileData> {
  const file = formData.get("resume") as File;
  const buffer = await file.arrayBuffer();

  const { object } = await generateObject({
    model: model,
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
- skills: top 10–15 strongest skills as strings
- extras: any additional sections found in the CV (e.g. Languages, Certifications, Projects, Awards, Volunteer Work, Publications). Each entry has a "section" title and an "items" array of strings. Omit this field if no additional sections exist.`,
          },
          { type: "file", data: buffer, mediaType: "application/pdf" },
        ],
      },
    ],
  });

  return object;
}
