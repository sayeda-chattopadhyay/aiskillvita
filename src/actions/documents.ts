"use server";

import { generateText } from "ai";
import { model } from "./ai";

export async function tailorCv(
  formData: FormData,
  jobContent: string,
): Promise<string> {
  const file = formData.get("resume") as File;
  const buffer = await file.arrayBuffer();

  const { text } = await generateText({
    model: model,
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
  jobContent: string,
): Promise<string> {
  const file = formData.get("resume") as File;
  const buffer = await file.arrayBuffer();

  const { text } = await generateText({
    model: model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Write a professional, natural-sounding cover letter for this job application. Read the candidate's CV and the job posting carefully, then write in a warm but confident first-person voice.

Job Posting:
${jobContent}

Structure the letter as follows — write flowing prose, no section headings, no labels, no bullet points:

1. Salutation: "Dear Hiring Manager," on its own line.

2. Opening paragraph (2–3 sentences): Open with a genuine, specific hook — why this role at this company excites the candidate. Reference something real about the company or role. Avoid generic openers like "I am writing to apply for…".

3. Experience paragraph (3–4 sentences): Draw a clear line between the candidate's past experience and what this role demands. Mention specific roles, projects, or achievements from the CV that directly align to the job requirements. Make it feel like the CV was written for this job.

4. Value paragraph (2–3 sentences): Describe what the candidate will concretely bring to the team — not just skills, but impact. Focus on outcomes and contributions, not just competencies.

5. Personal qualities paragraph (2–3 sentences): Highlight 1–2 genuine personal traits (e.g., curiosity, ownership, collaboration) that complement the professional background and fit the company culture implied by the posting. Keep it grounded and specific, not generic.

6. Closing paragraph (2–3 sentences): Express enthusiasm for a conversation. End with a confident but warm closing. Sign off with the candidate's name from the CV.

Rules:
- Write entirely in plain text — no asterisks (*), no hash (#), no bold markers (**), no markdown of any kind
- Do not include any bracket labels or section titles in the output
- Write in first person throughout
- Keep the total length to one page — concise and purposeful
- Every detail must come from the CV or the job posting — nothing invented`,
          },
          { type: "file", data: buffer, mediaType: "application/pdf" },
        ],
      },
    ],
  });

  return text;
}
