"use server";

import { generateText } from "ai";
import { google } from "./ai";

export async function tailorCv(
  formData: FormData,
  jobContent: string
): Promise<string> {
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
            text: `You are a professional CV writer. Rewrite the attached CV to be optimally tailored for this job posting.

Job Posting:
${jobContent}

Output format rules (follow exactly):
- First line: the candidate's full name only
- Second line: contact details on one line separated by | (email | phone | location | LinkedIn if present)
- Leave one blank line, then use ALL CAPS section headers: PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS
- Under EXPERIENCE: each role on its own line as "Job Title | Company | Date – Date", followed by bullet points using "- " prefix
- Under SKILLS: comma-separated list on one line
- Do NOT use asterisks (*), hash symbols (#), bold markers (**), or any markdown formatting
- Keep all factual information (dates, companies, degrees) accurate
- Rewrite descriptions and the summary to highlight relevance to the job posting
- Add keywords from the job posting naturally`,
          },
          { type: "file", data: buffer, mediaType: "application/pdf" },
        ],
      },
    ],
  });

  return text;
}

export async function createCoverLetter(
  formData: FormData,
  jobContent: string
): Promise<string> {
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
            text: `Write a concise one-page cover letter for this job application using the exact structure below.

Job Posting:
${jobContent}

Use this exact structure and labels (copy the labels exactly as shown):

[Line 1 — Headline]: One confident sentence stating one or two personal strengths and the position. Example: "Professional and results-driven engineer applying for the position of Senior Developer."

[Blank line]

As agreed, I am sending my application and CV for the [job title] position at [company name].

[Blank line]

Motivation – [1–2 sentences: the specific reason you are applying to this company and role. Be concrete.]

[Blank line]

Past experiences – [2–3 sentences: the most relevant experience or education from the CV that matches this role.]

[Blank line]

Future – What am I offering? [2–3 sentences: specific skills, achievements and contributions you will bring to this position.]

[Blank line]

Why should you hire me? [2–3 sentences: personal qualities combined with professional competence that make you the right fit.]

[Blank line]

I appreciate the opportunity to present myself better in an interview and look forward to hearing from you. I can most easily be reached at [phone or email from CV].

Please find enclosed my CV.

Rules:
- Do NOT use asterisks (*), hash (#), or any markdown formatting
- Write in first person
- Keep each section to 1–3 sentences — one page total
- Use details from the CV to make it specific to the job`,
          },
          { type: "file", data: buffer, mediaType: "application/pdf" },
        ],
      },
    ],
  });

  return text;
}
