"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { google } from "./ai";

const matchSchema = z.object({
  score: z.number().min(0).max(100),
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  summary: z.string(),
});

export async function fetchJobAd(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "nb-NO,nb;q=0.9,no;q=0.8,en-US;q=0.6,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "no-cache",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
  const html = await res.text();

  return html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(?:p|div|br|li|h[1-6]|section|article|main|ul|ol|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#[0-9]+;/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function matchCandidate(
  formData: FormData,
  jobContent: string
): Promise<{ score: number; matched_skills: string[]; missing_skills: string[]; summary: string }> {
  const file = formData.get("resume") as File;
  const buffer = await file.arrayBuffer();

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: matchSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a recruitment assistant. The CV and job posting may be in different languages (e.g. CV in English, job ad in Norwegian) — analyse them across languages and return results in English.

Job Posting Content:
${jobContent}

Analyse how well the attached CV matches this job posting. Return:
- score: number 0-100 (overall match percentage)
- matched_skills: skills/experience in CV that match job requirements
- missing_skills: job requirements not found in CV
- summary: 2-3 sentence written assessment of fit, in English`,
          },
          { type: "file", data: buffer, mediaType: "application/pdf" },
        ],
      },
    ],
  });

  return object;
}
