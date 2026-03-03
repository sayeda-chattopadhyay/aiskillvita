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

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-4 text-center text-xs text-gray-600">
        AISkillVita — AI-powered CV & job matching
      </footer>
    </div>
  );
}
