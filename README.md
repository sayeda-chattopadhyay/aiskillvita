# AI-skillVita
AI Skill-Role Match & CV Tailoring Platform

## Overview

A fullstack AI-powered web application built with Next.js (App Router) and @google/generative-ai, allowing users to:

- Upload a master CV

- Paste a job URL

- Generate a skill-role match analysis

- Automatically tailor CVs

- Generate customized cover letters

- Save and manage generated documents

- The system uses AI to extract skills, compare them with job requirements, and generate personalized application documents.


## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router, Server Actions)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Vercel AI SDK](https://sdk.vercel.ai) with Google Gemini (`gemini-2.5-flash`)

## Getting Started

### Prerequisites

You need a Google Gemini API key. Get one at [Google AI Studio](https://aistudio.google.com).

### Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root with your API key:

```env
GEMINI_API_KEY=your_api_key_here
```

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. The user uploads a PDF CV via the file input.
2. The PDF is previewed in an `<iframe>` on the left side of the page.
3. On form submission, the PDF is sent to a Next.js Server Action (`extractSkills`).
4. The Server Action passes the raw PDF bytes directly to Gemini 2.5 Flash as a multimodal prompt.
5. Gemini returns a JSON array of skill strings, which are rendered as amber-coloured tags.

## Project Structure

```
src/
  app/
    actions.ts   # Server Action: sends PDF to Gemini and parses the response
    page.tsx     # Client component: file upload, PDF preview, skills display
    layout.tsx   # Root layout
    globals.css  # Global styles (Tailwind)
```

## Environment Variables

| Variable        | Description              |
|-----------------|--------------------------|
| `GEMINI_API_KEY` | Google Gemini API key   |

## Deployment

Deploy with [Vercel](https://vercel.com) — just add `GEMINI_API_KEY` in your project environment variables.

```bash
vercel deploy
```
