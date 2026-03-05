# AISkillVita

**AI-powered job application assistant — match your CV to any role, then generate a tailored CV and cover letter in seconds.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aiskillvita.vercel.app-amber?style=flat-square)](https://aiskillvita.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white)

---

## About

AISkillVita is a personal learning project built to explore practical AI integration in a real product. Upload your CV, paste a job posting URL or description, and the app analyses how well you match the role — then rewrites your CV and writes a cover letter tailored specifically to that job.

The problem it solves: most job seekers send the same CV to every employer. Personalising each application manually is time-consuming. AISkillVita removes that friction by letting the AI handle the heavy lifting.

No account required. No data stored on any server. Everything stays in your browser.

---

## Features

- **CV upload and AI parsing** — Upload a PDF once. Gemini reads it and extracts your name, experience, education, and skills into a structured profile.
- **Skill match analysis** — Paste a job posting URL or description. The app gives you a 0–100 match score, a list of your matching skills, and the gaps you need to address.
- **Tailored CV generation** — Generates a rewritten version of your CV with language and keywords aligned to the specific job posting.
- **Cover letter generation** — Writes a professional, personalised cover letter in your voice based on your CV and the job posting.
- **PDF preview and download** — Preview any generated document before downloading as a properly formatted A4 PDF.
- **Persistent state** — Your profile and results survive page refreshes — no need to re-upload your CV on every visit.
- **Demo rate limiting** — The demo version allows one CV tailoring and one cover letter per visitor, enforced via localStorage.
- **Zero server-side user data** — All your data lives in your browser. Nothing is stored on any server.

---

## Tech Stack

| Technology                                  | Role                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Next.js 15** (App Router)                 | Framework — routing, server-side logic, production build                                       |
| **TypeScript**                              | Type safety across the entire codebase                                                         |
| **Tailwind CSS v4**                         | All styling — layout, colour, responsive design                                                |
| **Google Gemini** (`gemini-2.5-flash-lite`) | AI model — CV parsing, match analysis, CV rewriting, cover letter generation                   |
| **Vercel AI SDK** (`ai`, `@ai-sdk/google`)  | SDK for calling Gemini with structured output support                                          |
| **Next.js Server Actions**                  | Secure server-side API calls — keeps the Gemini API key out of the browser                     |
| **Zod**                                     | Schema validation for structured AI responses                                                  |
| **jsPDF**                                   | PDF generation in the browser — converts plain text to formatted A4 documents                  |
| **localStorage**                            | Client-side persistence — profile, job results, and generated documents survive page refreshes |

---

## How It Works

```
Upload PDF CV
     ↓
Gemini reads the PDF → extracts name, experience, education, skills
     ↓
Profile page built automatically
     ↓
Paste job posting URL or description
     ↓
Gemini analyses CV vs job → returns match score, matched skills, missing skills
     ↓
Click "Tailor My CV" → Gemini rewrites CV for this specific role
Click "Generate Cover Letter" → Gemini writes a personalised cover letter
     ↓
Preview in browser → Download as PDF
```

All AI calls happen server-side via Next.js Server Actions. The browser never touches the API key.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key — get one free at [Google AI Studio](https://aistudio.google.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/aiskillvita.git
cd aiskillvita

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> This variable is server-side only. Do not prefix it with `NEXT_PUBLIC_`.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — Navbar, fonts
│   ├── page.tsx            # Homepage
│   └── profile/
│       └── page.tsx        # Main app — wires hooks and views together
│
├── actions/                # Server Actions — all AI calls happen here
│   ├── ai.ts               # Shared Gemini model (single source of truth)
│   ├── profile.ts          # CV parsing → structured profile data
│   ├── jobs.ts             # Job fetching + match analysis
│   ├── documents.ts        # CV tailoring + cover letter generation
│   └── index.ts            # Barrel export
│
├── components/
│   ├── layout/             # Navbar, Sidebar
│   ├── profile/            # Profile page UI
│   ├── skill-match/        # Skill Match page (split into focused components)
│   └── ui/                 # ScoreBadge, MatchDetail, Avatar
│
├── hooks/
│   ├── useProfile.ts       # CV upload, profile state, localStorage
│   ├── useJobs.ts          # Job analysis, CV tailoring, cover letter
│   └── useGenerationLimit.ts # Demo usage cap
│
├── lib/
│   ├── downloadPdf.ts      # jsPDF — builds and downloads/previews PDFs
│   └── scoreColor.ts       # Colour helper for match score badge
│
└── types/
    └── index.ts            # Shared TypeScript types
```

---

## Demo Version Limitations

This is a demo. To keep API costs manageable:

- **One tailored CV and one cover letter per visitor** — tracked via localStorage. Clearing your browser storage resets the limit.
- **No user accounts or saved history** — data is stored in your browser only and cleared when you delete your profile or clear localStorage.

**Planned for a full version:**

- User accounts (Supabase)
- Unlimited generations for registered users
- Saved job application history
- Pro plan via Stripe

---

## Security

- **Gemini API key is server-side only** — stored in `.env.local`, never committed to git, never included in the browser bundle. All AI calls go through Next.js Server Actions.
- **No `NEXT_PUBLIC_` prefix** — deliberately avoided to prevent the key appearing in client-side JavaScript.
- **No user data on any server** — CV content, profile data, and generated documents are stored in the user's browser (localStorage) only.

---

## What I Learned

- **Prompt engineering for structured output** — using Zod schemas with `generateObject` to guarantee Gemini returns exactly the shape the app expects.
- **Securing API keys in Next.js** — Server Actions as a clean pattern for keeping secrets server-side without building a separate API layer.
- **Multimodal AI inputs** — sending raw PDF bytes directly to Gemini rather than extracting text first, letting the model read the document natively.
- **Client-side persistence without a database** — storing FormData as base64 in localStorage and reconstructing it on mount, so users never need to re-upload their CV.

---

## Planned Improvements

- [ ] User authentication (Supabase)
- [ ] Unlimited generations for registered users
- [ ] Stripe payments for a pro plan
- [ ] Saved job application history
- [ ] ATS (Applicant Tracking System) score simulation
- [ ] Streaming AI responses for faster perceived performance
- [ ] Multi-language support (English and Norwegian)

---

## Author

**Sayeda Chattopadhyay**

- Portfolio: [sayedachattopadhyay.com](https://sayedachattopadhyay.com)
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/sayedac/)
- GitHub: [Github](https://github.com/sayeda-chattopadhyay)
