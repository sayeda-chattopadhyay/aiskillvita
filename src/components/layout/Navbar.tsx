"use client";

import Link from "next/link";
//import { useState } from "react";

export function Navbar() {
  //const [lang, setLang] = useState<"en" | "no">("en");

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-20 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6">
      {/* Logo */}
      <Link
        href="/"
        className="font-bold text-amber-400 text-base tracking-tight"
      >
        AISkillVita
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-5">
        <Link
          href="/profile"
          className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
        >
          My Profile
        </Link>

        {/* Language toggle */}
        {/* <div className="flex items-center bg-gray-800 rounded-full p-0.5 text-xs font-medium">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-full transition-colors ${
              lang === "en" ? "bg-amber-400 text-black" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("no")}
            className={`px-3 py-1 rounded-full transition-colors ${
              lang === "no" ? "bg-amber-400 text-black" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            NO
          </button>
        </div> */}
      </div>
    </header>
  );
}
