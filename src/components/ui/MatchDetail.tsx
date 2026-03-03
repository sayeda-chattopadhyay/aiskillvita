import { useState } from "react";
import { scoreColor } from "@/lib/scoreColor";
import type { MatchResult } from "@/types";

const VISIBLE_COUNT = 20;

export function MatchDetail({ result }: { result: MatchResult }) {
  const [showAllMatched, setShowAllMatched] = useState(false);
  const [showAllMissing, setShowAllMissing] = useState(false);

  const visibleMatched = showAllMatched
    ? result.matched_skills
    : result.matched_skills.slice(0, VISIBLE_COUNT);
  const visibleMissing = showAllMissing
    ? result.missing_skills
    : result.missing_skills.slice(0, VISIBLE_COUNT);

  return (
    <div className="border border-gray-700 rounded-lg p-5 space-y-4 bg-gray-900">
      <div className="flex items-center gap-3">
        <span className="font-semibold">Match Score</span>
        <span className={`text-2xl font-bold px-4 py-1 rounded-full ${scoreColor(result.score)}`}>
          {result.score}%
        </span>
      </div>

      <div>
        <h4 className="font-semibold mb-1">Summary</h4>
        <p className="text-gray-300 text-sm">{result.summary}</p>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Matched Skills ({result.matched_skills.length})</h4>
        <div className="flex flex-wrap gap-2">
          {visibleMatched.map((s) => (
            <span key={s} className="bg-green-900/40 text-green-300 px-3 py-1 rounded-full text-xs">
              {s}
            </span>
          ))}
        </div>
        {result.matched_skills.length > VISIBLE_COUNT && (
          <button
            onClick={() => setShowAllMatched((p) => !p)}
            className="mt-2 text-xs text-green-400 underline"
          >
            {showAllMatched ? "See less" : `See more (${result.matched_skills.length - VISIBLE_COUNT} more)`}
          </button>
        )}
      </div>

      <div>
        <h4 className="font-semibold mb-2">Missing Skills ({result.missing_skills.length})</h4>
        <div className="flex flex-wrap gap-2">
          {visibleMissing.map((s) => (
            <span key={s} className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs">
              {s}
            </span>
          ))}
        </div>
        {result.missing_skills.length > VISIBLE_COUNT && (
          <button
            onClick={() => setShowAllMissing((p) => !p)}
            className="mt-2 text-xs text-red-400 underline"
          >
            {showAllMissing ? "See less" : `See more (${result.missing_skills.length - VISIBLE_COUNT} more)`}
          </button>
        )}
      </div>
    </div>
  );
}
