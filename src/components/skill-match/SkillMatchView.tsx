import { useState } from "react";
import { getPdfDataUri } from "@/lib/downloadPdf";
import type { JobEntry } from "@/types";
import { CvStatus } from "./CvStatus";
import { JobInputCard } from "./JobInputCard";
import { MatchResultPanel } from "./MatchResultPanel";
import { DocumentPanel } from "./DocumentPanel";
import { PreviewModal } from "./PreviewModal";

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
  return raw.replace(phrasePattern, "").replace(/\n{3,}/g, "\n\n").trim();
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
}) {
  const [showJobPreview, setShowJobPreview] = useState(false);
  const [cvPdfUri, setCvPdfUri] = useState<string | null>(null);
  const [coverLetterPdfUri, setCoverLetterPdfUri] = useState<string | null>(null);
  const [cvPanelVisible, setCvPanelVisible] = useState(true);
  const [coverLetterPanelVisible, setCoverLetterPanelVisible] = useState(true);

  const canAnalyse = hasCv && (jobUrl.trim().length > 0 || rawJobText.trim().length > 0);
  const hasResult = !!job.result;
  const cleanedJobContent = job.content ? cleanPreviewContent(job.content) : "";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Skill Match</h1>

      {/* Section 1: Job input (left) + Score result (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col gap-4">
          <CvStatus hasCv={hasCv} cvName={cvName} onUploadCv={onUploadCv} />
          <JobInputCard
            hasCv={hasCv}
            job={job}
            jobUrl={jobUrl}
            rawJobText={rawJobText}
            hasResult={hasResult}
            canAnalyse={canAnalyse}
            onJobUrlChange={onJobUrlChange}
            onRawJobTextChange={onRawJobTextChange}
            onAnalyseMatch={onAnalyseMatch}
            onShowJobPreview={() => setShowJobPreview(true)}
          />
        </div>

        {hasResult && (
          <MatchResultPanel
            hasCv={hasCv}
            job={job}
            cvGenerated={cvGenerated}
            coverLetterGenerated={coverLetterGenerated}
            onTailorCv={onTailorCv}
            onCreateCoverLetter={onCreateCoverLetter}
          />
        )}
      </div>

      {/* Section 2: Generated CV (left) + Cover Letter (right) */}
      {(job.tailoredCv || job.tailoringCv || job.coverLetter || job.generatingCoverLetter) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {(job.tailoredCv || job.tailoringCv) && cvPanelVisible && (
            <DocumentPanel
              title="Your Tailored CV"
              content={job.tailoredCv ?? null}
              isLoading={!!job.tailoringCv}
              loadingText="Rewriting your CV for this role…"
              downloadFilename="tailored-cv.pdf"
              onPreview={() => job.tailoredCv && setCvPdfUri(getPdfDataUri(job.tailoredCv))}
              onDismiss={() => setCvPanelVisible(false)}
            />
          )}
          {(job.coverLetter || job.generatingCoverLetter) && coverLetterPanelVisible && (
            <DocumentPanel
              title="Your Cover Letter"
              content={job.coverLetter ?? null}
              isLoading={!!job.generatingCoverLetter}
              loadingText="Writing your cover letter…"
              downloadFilename="cover-letter.pdf"
              onPreview={() => job.coverLetter && setCoverLetterPdfUri(getPdfDataUri(job.coverLetter))}
              onDismiss={() => setCoverLetterPanelVisible(false)}
            />
          )}
        </div>
      )}

      {/* Job content preview modal */}
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

      {/* Tailored CV PDF modal */}
      {cvPdfUri && (
        <PreviewModal title="Tailored CV Preview" onClose={() => setCvPdfUri(null)}>
          <iframe src={cvPdfUri} className="w-full h-full" title="Tailored CV PDF Preview" />
        </PreviewModal>
      )}

      {/* Cover Letter PDF modal */}
      {coverLetterPdfUri && (
        <PreviewModal title="Cover Letter Preview" onClose={() => setCoverLetterPdfUri(null)}>
          <iframe src={coverLetterPdfUri} className="w-full h-full" title="Cover Letter PDF Preview" />
        </PreviewModal>
      )}
    </div>
  );
}
