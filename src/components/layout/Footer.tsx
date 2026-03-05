import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 px-8 py-8 mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Left — About the project */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-100">
            A Work In Progress 🚧
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hi, I&apos;m <span className="text-amber-400 text-lg">Sayeda</span>{" "}
            — the creator of AISkillVita. This is a personal hobby project built
            to learn how to integrate AI into a real-world application. I&apos;m
            actively improving it and would love your feedback whether it&apos;s
            a bug, a suggestion, or just a thought on how to make it better.
          </p>
        </div>

        {/* Right — Get in touch */}
        <div className="space-y-3 sm:text-right">
          <h2 className="text-sm font-semibold text-gray-100">Get in touch</h2>
          <div className="flex flex-col gap-2 sm:items-end">
            <a
              href="https://www.linkedin.com/in/sayedac/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-gray-400  transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              Connect on LinkedIn
            </a>
            <a
              href="mailto:sayeda.b@gmail.com"
              className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-gray-400 transition-colors"
            >
              <Mail size={14} />
              Send an email
            </a>
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <p className="text-center text-xs text-gray-500 mt-8">
        Built to learn AI integration. Always improving. 🌱
      </p>
    </footer>
  );
}
