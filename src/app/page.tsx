import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <span className="font-bold text-amber-400 text-lg">AISkillVita</span>
        <Link
          href="/profile"
          className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
        >
          My Profile →
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-bold leading-tight">
            Match your CV to any job —{" "}
            <span className="text-amber-400">instantly</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Upload your CV and paste a job posting URL. AI extracts your profile,
            scores how well you match, and rewrites your CV and cover letter for the role.
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
            <h3 className="font-semibold mb-1">AI Profile</h3>
            <p className="text-gray-400 text-sm">
              Upload a PDF and your profile — name, experience, education, and skills — is extracted automatically.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Skill Match</h3>
            <p className="text-gray-400 text-sm">
              Paste any job posting URL. Get a match score, matched skills, and gaps in seconds.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl mb-2">✍️</div>
            <h3 className="font-semibold mb-1">Tailored Documents</h3>
            <p className="text-gray-400 text-sm">
              Generate a tailored CV and cover letter for each job, editable and downloadable as PDF.
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
