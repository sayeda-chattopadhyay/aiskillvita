import { useState } from "react";
import { MatchDetail } from "@/components/ui/MatchDetail";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { downloadPdf, getPdfDataUri } from "@/lib/downloadPdf";
import type { JobEntry } from "@/types";

const DEMO_MSG =
  "This feature is available for registered users. In the demo version you can analyse one job posting once. Full access with saved history, unlimited analysis and re-analysis is coming soon.";

// Strip common job-site UI strings and leading blank lines from preview content
function cleanPreviewContent(raw: string): string {
  const uiPhrases = [
    "Gå til annonsen", "Gå til jobben", "Dele", "Del", "Del annonse",
    "Legg til som favoritt", "Favoritt", "Meld interesse", "Søk på jobb",
    "Søk her", "Send søknad", "Skriv søknad", "Logg inn", "Bli med",
    "Registrer deg", "Vis alle stillinger", "Se alle stillinger",
  ];
  const phrasePattern = new RegExp(
    `^(${uiPhrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*$`,
    "gim"
  );
  return raw
    .replace(phrasePattern, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function SkillMatchView({
  cvName,
  hasCv,
  job,
  jobUrl,
  rawJobText,
  cvGenerated,
  coverLetterGenerated,
  onJobUrlChange,
  onRawJobTextChange,
  onAnalyseMatch,
  onTailorCv,
  onCreateCoverLetter,
  onUploadCv,
  onGoToProfile,
}: {
  cvName: string | null;
  hasCv: boolean;
  job: JobEntry;
  jobUrl: string;
  rawJobText: string;
  cvGenerated: boolean;
  coverLetterGenerated: boolean;
  onJobUrlChange: (v: string) => void;
  onRawJobTextChange: (v: string) => void;
  onAnalyseMatch: () => void;
  onTailorCv: () => void;
  onCreateCoverLetter: () => void;
  onUploadCv: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGoToProfile: () => void;
}) {
  const [showJobPreview, setShowJobPreview] = useState(false);
  const [showAddNewJobMsg, setShowAddNewJobMsg] = useState(false);
  const [showReanalyseMsg, setShowReanalyseMsg] = useState(false);
  const [cvPdfUri, setCvPdfUri] = useState<string | null>(null);
  const [coverLetterPdfUri, setCoverLetterPdfUri] = useState<string | null>(null);

  const canAnalyse = hasCv && (jobUrl.trim().length > 0 || rawJobText.trim().length > 0);
  const hasResult = !!job.result;

  function handlePreviewCvPdf() {
    if (job.tailoredCv) setCvPdfUri(getPdfDataUri(job.tailoredCv));
  }

  function handlePreviewCoverLetterPdf() {
    if (job.coverLetter) setCoverLetterPdfUri(getPdfDataUri(job.coverLetter));
  }

  const cleanedJobContent = job.content ? cleanPreviewContent(job.content) : "";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Skill Match</h1>

      {/* Two-column grid — single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4">
          {/* CV status / upload */}
          {hasCv ? (
            <div className="flex items-center justify-between gap-3 text-sm flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓ CV loaded{cvName ? `: ${cvName}` : ""}</span>
                <label className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 underline">
                  Replace
                  <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
                </label>
              </div>
              <button
                onClick={onGoToProfile}
                className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                Go to Profile →
              </button>
            </div>
          ) : (
            <div className="border border-amber-700/40 rounded-xl p-4 bg-amber-900/10 space-y-3">
              <p className="text-sm text-gray-300 font-medium">Upload your CV to get started</p>
              <p className="text-xs text-gray-500">Upload your PDF CV once and your profile will be built automatically.</p>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-amber-400 text-black font-semibold px-5 py-2 rounded-lg text-sm hover:bg-amber-500 transition-colors">
                Upload CV (PDF)
                <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
              </label>
            </div>
          )}

          {/* Input card */}
          <div className="border border-gray-700 rounded-xl p-5 bg-gray-900 space-y-4">
            <h2 className="font-semibold text-sm text-gray-300">Add Job Posting</h2>

            {/* URL row */}
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
                  onClick={() => setShowJobPreview(true)}
                  className="shrink-0 border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 px-3 py-2 rounded text-sm"
                >
                  Preview
                </button>
              )}
            </div>

            {/* Raw text alternative */}
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

            {/* Analyse Match button (only before results) */}
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

            {!hasCv && (
              <p className="text-amber-400 text-xs">Upload your CV above before analysing.</p>
            )}
            {job.error && <p className="text-red-400 text-xs">{job.error}</p>}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        {hasResult && job.result && (
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

            {/* Demo restriction messages */}
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
                {/* Tailor My CV */}
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

                {/* Generate Cover Letter */}
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

            {/* Match detail */}
            <MatchDetail result={job.result} />

            {/* ── Generated documents — shown in-column so they're always visible ── */}

            {/* Tailored CV panel */}
            {(job.tailoredCv || job.tailoringCv) && (
              <div className="border border-gray-700 rounded-xl p-5 bg-gray-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Your Tailored CV</h3>
                  {job.tailoredCv && (
                    <div className="flex gap-2">
                      <button
                        onClick={handlePreviewCvPdf}
                        className="text-xs border border-gray-600 text-gray-300 px-3 py-1 rounded hover:bg-gray-700"
                      >
                        Preview PDF
                      </button>
                      <button
                        onClick={() => downloadPdf("tailored-cv.pdf", job.tailoredCv!)}
                        className="text-xs bg-amber-400 text-black px-3 py-1 rounded hover:bg-amber-500"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
                {job.tailoringCv ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
                    <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Rewriting your CV for this role…
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-4 max-h-130 overflow-y-auto">
                    <pre className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {job.tailoredCv}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Cover Letter panel */}
            {(job.coverLetter || job.generatingCoverLetter) && (
              <div className="border border-gray-700 rounded-xl p-5 bg-gray-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Your Cover Letter</h3>
                  {job.coverLetter && (
                    <div className="flex gap-2">
                      <button
                        onClick={handlePreviewCoverLetterPdf}
                        className="text-xs border border-gray-600 text-gray-300 px-3 py-1 rounded hover:bg-gray-700"
                      >
                        Preview PDF
                      </button>
                      <button
                        onClick={() => downloadPdf("cover-letter.pdf", job.coverLetter!)}
                        className="text-xs bg-amber-400 text-black px-3 py-1 rounded hover:bg-amber-500"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
                {job.generatingCoverLetter ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
                    <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Writing your cover letter…
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-4 max-h-130 overflow-y-auto">
                    <pre className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {job.coverLetter}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Job content preview modal ── */}
      {showJobPreview && cleanedJobContent && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setShowJobPreview(false)}
        >
          <div
            className="relative w-full max-w-3xl h-[85vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0 gap-3">
              {job.url && (
                <button
                  onClick={() => window.open(job.url, "_blank", "noopener,noreferrer")}
                  className="text-xs bg-amber-400 text-black font-medium px-3 py-1.5 rounded hover:bg-amber-500 shrink-0"
                >
                  Open job posting
                </button>
              )}
              <span className="text-xs text-gray-500 truncate flex-1">{job.url || "Job Description"}</span>
              <button
                onClick={() => setShowJobPreview(false)}
                className="text-gray-400 hover:text-white text-lg leading-none shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                {cleanedJobContent}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── Tailored CV PDF preview modal ── */}
      {cvPdfUri && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setCvPdfUri(null)}
        >
          <div
            className="relative w-full max-w-4xl h-[90vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 shrink-0">
              <span className="text-sm font-medium text-gray-300">Tailored CV Preview</span>
              <button
                onClick={() => setCvPdfUri(null)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <iframe src={cvPdfUri} className="w-full h-[calc(90vh-41px)]" title="Tailored CV PDF Preview" />
          </div>
        </div>
      )}

      {/* ── Cover Letter PDF preview modal ── */}
      {coverLetterPdfUri && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setCoverLetterPdfUri(null)}
        >
          <div
            className="relative w-full max-w-4xl h-[90vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 shrink-0">
              <span className="text-sm font-medium text-gray-300">Cover Letter Preview</span>
              <button
                onClick={() => setCoverLetterPdfUri(null)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <iframe src={coverLetterPdfUri} className="w-full h-[calc(90vh-41px)]" title="Cover Letter PDF Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
