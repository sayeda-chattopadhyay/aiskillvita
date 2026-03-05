import type { JobEntry } from "@/types";

export function JobInputCard({
  hasCv,
  job,
  jobUrl,
  rawJobText,
  hasResult,
  canAnalyse,
  onJobUrlChange,
  onRawJobTextChange,
  onAnalyseMatch,
  onShowJobPreview,
}: {
  hasCv: boolean;
  job: JobEntry;
  jobUrl: string;
  rawJobText: string;
  hasResult: boolean;
  canAnalyse: boolean;
  onJobUrlChange: (v: string) => void;
  onRawJobTextChange: (v: string) => void;
  onAnalyseMatch: () => void;
  onShowJobPreview: () => void;
}) {
  return (
    <div className="border border-gray-700 rounded-xl p-5 bg-gray-900 space-y-4 flex-1">
      <h2 className="font-semibold text-sm text-gray-300">Add Job Posting</h2>

      <div className="flex gap-2">
        <input
          type="url"
          placeholder="Paste job posting URL here"
          value={jobUrl}
          onChange={(e) => onJobUrlChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canAnalyse && !job.analyzing && onAnalyseMatch()}
          className="border border-gray-600 bg-gray-800 text-gray-100 placeholder:text-gray-500 rounded px-3 py-2 text-sm flex-1 min-w-0"
        />
        {job.content && (
          <button
            onClick={onShowJobPreview}
            className="shrink-0 border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 px-3 py-2 rounded text-sm"
          >
            Preview
          </button>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1.5">Or paste the job description directly:</p>
        <textarea
          placeholder="Paste job description text here…"
          value={rawJobText}
          onChange={(e) => onRawJobTextChange(e.target.value)}
          rows={5}
          className="w-full border border-gray-600 bg-gray-800 text-gray-100 placeholder:text-gray-500 rounded px-3 py-2 text-sm resize-y"
        />
      </div>

      {!hasResult && (
        <button
          onClick={onAnalyseMatch}
          disabled={!canAnalyse || job.analyzing}
          className="w-full bg-amber-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 hover:bg-amber-500 transition-colors"
        >
          {job.analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              Analysing…
            </span>
          ) : (
            "Analyse Match"
          )}
        </button>
      )}

      {!hasCv && <p className="text-amber-400 text-xs">Upload your CV above before analysing.</p>}
      {job.error && <p className="text-red-400 text-xs">{job.error}</p>}
    </div>
  );
}
