import { useState } from "react";
import { MatchDetail } from "@/components/ui/MatchDetail";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import type { JobEntry } from "@/types";

const DEMO_MSG =
  "This feature is available for registered users. In the demo version you can analyse one job posting once. Full access with saved history, unlimited analysis and re-analysis is coming soon.";

export function MatchResultPanel({
  hasCv,
  job,
  cvGenerated,
  coverLetterGenerated,
  onTailorCv,
  onCreateCoverLetter,
}: {
  hasCv: boolean;
  job: JobEntry;
  cvGenerated: boolean;
  coverLetterGenerated: boolean;
  onTailorCv: () => void;
  onCreateCoverLetter: () => void;
}) {
  const [showReanalyseMsg, setShowReanalyseMsg] = useState(false);
  const [showAddNewJobMsg, setShowAddNewJobMsg] = useState(false);

  if (!job.result) return null;

  return (
    <div className="space-y-4">
      {/* Score + action row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <ScoreBadge score={job.result.score} />
        <div className="flex gap-2">
          <button
            onClick={() => { setShowReanalyseMsg(true); setShowAddNewJobMsg(false); }}
            className="text-xs border border-gray-600 text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded"
          >
            Re-analyse
          </button>
          <button
            onClick={() => { setShowAddNewJobMsg(true); setShowReanalyseMsg(false); }}
            className="text-xs border border-gray-600 text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded"
          >
            Add New Job
          </button>
        </div>
      </div>

      {showReanalyseMsg && (
        <div className="border border-gray-700 rounded-lg px-4 py-3 bg-gray-900/60 text-xs text-gray-400">
          {DEMO_MSG}
        </div>
      )}
      {showAddNewJobMsg && (
        <div className="border border-gray-700 rounded-lg px-4 py-3 bg-gray-900/60 text-xs text-gray-400">
          {DEMO_MSG}
        </div>
      )}

      {/* Demo notice + generation buttons */}
      <div className="border border-gray-700 rounded-xl p-4 bg-gray-900 space-y-3">
        <p className="text-xs text-gray-500">
          Demo version — you can only perform skill analysis, CV tailoring, and cover letter generation once per visit.
        </p>
        <div className="flex flex-wrap gap-2">
          {cvGenerated ? (
            <span className="text-xs text-gray-500 border border-gray-700 rounded px-3 py-1.5">
              {job.tailoredCv ? "Tailored CV ready ↓" : "Tailored CV already generated"}
            </span>
          ) : (
            <button
              onClick={onTailorCv}
              disabled={!hasCv || job.tailoringCv}
              className="flex items-center gap-2 bg-amber-400 text-black font-medium px-4 py-1.5 rounded text-sm hover:bg-amber-500 disabled:opacity-40 transition-colors"
            >
              {job.tailoringCv ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  Tailoring…
                </>
              ) : (
                "Tailor My CV"
              )}
            </button>
          )}

          {coverLetterGenerated ? (
            <span className="text-xs text-gray-500 border border-gray-700 rounded px-3 py-1.5">
              {job.coverLetter ? "Cover letter ready ↓" : "Cover letter already generated"}
            </span>
          ) : (
            <button
              onClick={onCreateCoverLetter}
              disabled={!hasCv || job.generatingCoverLetter}
              className="flex items-center gap-2 bg-gray-800 border border-gray-600 text-gray-200 px-4 py-1.5 rounded text-sm hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {job.generatingCoverLetter ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate Cover Letter"
              )}
            </button>
          )}
        </div>
      </div>

      <MatchDetail result={job.result} />
    </div>
  );
}
