import { Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 px-8 py-5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        {/* Left */}
        <p>AISkillVita — hobby project by Sayeda Chattopadhyay</p>

        {/* Right */}
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-xs">Have feedback? Get in touch:</span>
          <a
            href="https://www.linkedin.com/in/YOUR_LINKEDIN_URL"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 hover:text-amber-400 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={15} />
            LinkedIn
          </a>
          <a
            href="mailto:YOUR_EMAIL"
            className="flex items-center gap-1.5 text-gray-400 hover:text-amber-400 transition-colors"
            aria-label="Email"
          >
            <Mail size={15} />
            Email
          </a>
        </div>
      </div>

      {/* Bottom line */}
      <p className="text-center text-xs text-gray-700 mt-3">
        Built to learn AI integration. Always improving. 🌱
      </p>
    </footer>
  );
}
