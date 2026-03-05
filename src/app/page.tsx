import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-bold leading-tight">
            Stop sending generic CVs.{" "}
            <span className="text-amber-400">Get tailored for every job.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            AISkillVita reads your CV, analyzes the job posting, and tells you
            exactly how well you match — then rewrites your CV and cover letter
            to fit the role. No more one-size-fits-all applications.
          </p>
        </div>

        <Link
          href="/profile"
          className="bg-amber-400 text-black font-semibold px-8 py-3 rounded-lg text-base hover:bg-amber-500 transition-colors"
        >
          Get Started
        </Link>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mt-4 text-left">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl mb-2">📄</div>
            <h3 className="font-semibold mb-1">Instant CV Parsing</h3>
            <p className="text-gray-400 text-sm">
              Upload your PDF once. AI extracts your name, experience,
              education, and skills into a structured profile ready to use.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Match Score & Gap Analysis</h3>
            <p className="text-gray-400 text-sm">
              Paste a job posting URL and see your fit score, which skills you
              already have, and what&apos;s missing — so you know where you
              stand.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl mb-2">✍️</div>
            <h3 className="font-semibold mb-1">Tailored CV & Cover Letter</h3>
            <p className="text-gray-400 text-sm">
              Generate a role-specific CV and cover letter for each application.
              Edit them in-browser and download as PDF when ready.
            </p>
          </div>
        </div>
      </main>

      {/* About This Project */}
      <section className="px-6 py-10 max-w-3xl mx-auto w-full">
        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900/60 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">A Work In Progress 🚧</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            This is a personal hobby project built to learn how to integrate AI into a real-world
            application. I&apos;m actively improving it and would love your feedback — whether
            it&apos;s a bug, a suggestion, or just a thought on how to make it better.
          </p>
          <div className="flex flex-wrap gap-4 pt-1">
            <a
              href="https://www.linkedin.com/in/YOUR_LINKEDIN_URL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              Connect on LinkedIn
            </a>
            <a
              href="mailto:YOUR_EMAIL"
              className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Send an email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
