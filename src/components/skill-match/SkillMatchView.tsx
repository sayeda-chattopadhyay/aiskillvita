import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { MatchDetail } from "@/components/ui/MatchDetail";
import { downloadPdf } from "@/lib/downloadPdf";
import type { JobEntry } from "@/types";

export function SkillMatchView({
  cvName,
  cvFormData,
  jobs,
  newJobUrl,
  selectedJobId,
  onUploadCv,
  onNewJobUrlChange,
  onAddJob,
  onAnalyzeJob,
  onDeleteJob,
  onSelectJob,
  onTailorCv,
  onCreateCoverLetter,
  onUpdateTailoredCv,
  onUpdateCoverLetter,
}: {
  cvName: string | null;
  cvFormData: FormData | null;
  jobs: JobEntry[];
  newJobUrl: string;
  selectedJobId: string | null;
  onUploadCv: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewJobUrlChange: (v: string) => void;
  onAddJob: () => void;
  onAnalyzeJob: (id: string) => void;
  onDeleteJob: (id: string) => void;
  onSelectJob: (id: string) => void;
  onTailorCv: (id: string) => void;
  onCreateCoverLetter: (id: string) => void;
  onUpdateTailoredCv: (id: string, content: string) => void;
  onUpdateCoverLetter: (id: string, content: string) => void;
}) {
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-xl font-bold">Skill Match</h1>

      {/* CV section */}
      <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
        <h2 className="font-semibold mb-3">Your CV</h2>
        {cvName && cvFormData ? (
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-sm">✓ {cvName}</span>
            <label className="text-xs text-gray-500 hover:text-gray-300 underline cursor-pointer">
              Replace
              <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 border border-gray-600 bg-gray-800 text-gray-200 rounded px-4 py-2 text-sm hover:bg-gray-700">
              Upload PDF
              <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
            </label>
            {cvName && !cvFormData && (
              <span className="text-amber-400 text-xs">Re-upload required — CV not in memory</span>
            )}
          </div>
        )}
      </div>

      {/* Add job URL */}
      <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
        <h2 className="font-semibold mb-3">Add Job Posting</h2>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://www.finn.no/job/..."
            value={newJobUrl}
            onChange={(e) => onNewJobUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddJob()}
            className="border border-gray-600 bg-gray-800 text-gray-100 placeholder:text-gray-500 rounded px-3 py-2 text-sm flex-1"
          />
          <button
            onClick={onAddJob}
            disabled={!newJobUrl.trim()}
            className="bg-amber-400 text-black px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Jobs table */}
      {jobs.length > 0 && (
        <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left p-3 font-medium text-gray-300">Job URL</th>
                <th className="text-center p-3 font-medium w-24 text-gray-300">Score</th>
                <th className="text-center p-3 font-medium w-40 text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => job.result && onSelectJob(job.id)}
                  className={`border-b border-gray-700 last:border-0 transition-colors ${
                    job.result ? "cursor-pointer hover:bg-gray-800" : ""
                  } ${selectedJobId === job.id ? "bg-amber-900/20" : ""}`}
                >
                  <td className="p-3 text-gray-300 truncate max-w-xs">{job.url}</td>
                  <td className="p-3 text-center">
                    {job.analyzing ? (
                      <span className="text-gray-500 text-xs">…</span>
                    ) : job.result ? (
                      <ScoreBadge score={job.result.score} />
                    ) : job.error ? (
                      <span className="text-red-400 text-xs">Error</span>
                    ) : (
                      <span className="text-gray-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-2 justify-center">
                      {!job.analyzing && !job.error && job.content && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onAnalyzeJob(job.id); }}
                          disabled={!cvFormData}
                          className="text-xs bg-amber-400 text-black px-3 py-1 rounded disabled:opacity-40"
                        >
                          {job.result ? "Re-analyse" : "Analyse"}
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id); }}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                    {job.error && <p className="text-xs text-red-400 mt-1">{job.error}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected job result */}
      {selectedJob?.result && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 truncate">{selectedJob.url}</p>
          <MatchDetail result={selectedJob.result} />

          {/* Document generation buttons */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => onTailorCv(selectedJob.id)}
              disabled={!cvFormData || selectedJob.tailoringCv}
              className="flex items-center gap-2 bg-gray-800 border border-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {selectedJob.tailoringCv ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Tailoring CV…
                </>
              ) : (
                "Tailor CV"
              )}
            </button>
            <button
              onClick={() => onCreateCoverLetter(selectedJob.id)}
              disabled={!cvFormData || selectedJob.generatingCoverLetter}
              className="flex items-center gap-2 bg-gray-800 border border-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {selectedJob.generatingCoverLetter ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                "Create Cover Letter"
              )}
            </button>
            {!cvFormData && (
              <span className="text-amber-400 text-xs">Upload CV to generate documents</span>
            )}
          </div>

          {/* Tailored CV panel */}
          {(selectedJob.tailoredCv || selectedJob.tailoringCv) && (
            <div className="border border-gray-700 rounded-xl p-5 bg-gray-900 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Tailored CV</h3>
                {selectedJob.tailoredCv && (
                  <button
                    onClick={() => downloadPdf("tailored-cv.pdf", selectedJob.tailoredCv!)}
                    className="text-xs bg-amber-400 text-black px-3 py-1 rounded hover:bg-amber-500"
                  >
                    Download PDF
                  </button>
                )}
              </div>
              {selectedJob.tailoringCv ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Rewriting your CV for this role…
                </div>
              ) : (
                <textarea
                  value={selectedJob.tailoredCv ?? ""}
                  onChange={(e) => onUpdateTailoredCv(selectedJob.id, e.target.value)}
                  rows={22}
                  className="w-full bg-gray-800 border border-gray-600 text-gray-100 text-xs font-mono rounded p-3 resize-y leading-relaxed"
                />
              )}
            </div>
          )}

          {/* Cover Letter panel */}
          {(selectedJob.coverLetter || selectedJob.generatingCoverLetter) && (
            <div className="border border-gray-700 rounded-xl p-5 bg-gray-900 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Cover Letter</h3>
                {selectedJob.coverLetter && (
                  <button
                    onClick={() => downloadPdf("cover-letter.pdf", selectedJob.coverLetter!)}
                    className="text-xs bg-amber-400 text-black px-3 py-1 rounded hover:bg-amber-500"
                  >
                    Download PDF
                  </button>
                )}
              </div>
              {selectedJob.generatingCoverLetter ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Writing your cover letter…
                </div>
              ) : (
                <textarea
                  value={selectedJob.coverLetter ?? ""}
                  onChange={(e) => onUpdateCoverLetter(selectedJob.id, e.target.value)}
                  rows={16}
                  className="w-full bg-gray-800 border border-gray-600 text-gray-100 text-xs font-mono rounded p-3 resize-y leading-relaxed"
                />
              )}
            </div>
          )}
        </div>
      )}

      {!cvFormData && jobs.some((j) => j.result) && (
        <p className="text-amber-400 text-sm">
          Re-upload your CV to run new analyses. Past results are still shown above.
        </p>
      )}
    </div>
  );
}
