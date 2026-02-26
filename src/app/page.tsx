"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  extractProfile,
  fetchJobAd,
  matchCandidate,
  tailorCv,
  createCoverLetter,
} from "./actions";
import type { ProfileData, MatchResult, JobEntry, View } from "@/types";

const VISIBLE_COUNT = 20;
const LS_VIEW = "asv_view";
const LS_CV = "asv_cv";
const LS_PHOTO = "asv_photo";
const LS_JOBS = "asv_jobs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function scoreColor(score: number) {
  if (score >= 75) return "bg-green-900/40 text-green-300";
  if (score >= 50) return "bg-amber-900/40 text-amber-300";
  return "bg-red-900/40 text-red-300";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function downloadPdf(filename: string, content: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const usableWidth = pageWidth - 2 * margin;
  const bottom = pageHeight - 15;

  // Strip any residual markdown artifacts
  const cleaned = content
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#+\s?/gm, "")
    .trim();

  const rawLines = cleaned.split("\n");

  let y = 22;
  let isFirstLine = true;

  const newPageIfNeeded = (needed: number) => {
    if (y + needed > bottom) {
      doc.addPage();
      y = 22;
    }
  };

  for (const rawLine of rawLines) {
    const line = rawLine.trimEnd();

    if (line === "") {
      y += 3;
      continue;
    }

    // First non-empty line = name or headline — large bold
    if (isFirstLine) {
      isFirstLine = false;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      const wrapped = doc.splitTextToSize(line, usableWidth);
      for (const wl of wrapped) {
        newPageIfNeeded(8);
        doc.text(wl, margin, y);
        y += 7.5;
      }
      y += 1;
      continue;
    }

    // ALL CAPS section header (e.g. EXPERIENCE, EDUCATION, SKILLS)
    const trimmed = line.trim();
    const isAllCaps =
      trimmed.length >= 3 &&
      trimmed === trimmed.toUpperCase() &&
      !/^\d/.test(trimmed) &&
      !trimmed.includes("@") &&
      !trimmed.includes("|") &&
      !trimmed.includes("–") &&
      !trimmed.includes("-");

    if (isAllCaps) {
      y += 4;
      newPageIfNeeded(9);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(trimmed, margin, y);
      y += 2;
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
      continue;
    }

    // Cover letter inline labels: "Motivation –", "Past experiences –", etc.
    const labelMatch = trimmed.match(/^([A-Za-z][A-Za-z\s–?]+?)\s*[–-]\s*(.+)/);
    const isCoverLabel =
      labelMatch &&
      labelMatch[1].split(" ").length <= 6 &&
      !trimmed.startsWith("-");

    if (isCoverLabel) {
      newPageIfNeeded(7);
      const labelText = labelMatch![1].trim() + " – ";
      const bodyText = labelMatch![2].trim();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      const labelWidth = doc.getTextWidth(labelText);
      doc.text(labelText, margin, y);
      doc.setFont("helvetica", "normal");
      const bodyWrapped = doc.splitTextToSize(bodyText, usableWidth - labelWidth);
      doc.text(bodyWrapped[0], margin + labelWidth, y);
      y += 5.5;
      for (let i = 1; i < bodyWrapped.length; i++) {
        newPageIfNeeded(6);
        doc.text(bodyWrapped[i], margin, y);
        y += 5.5;
      }
      continue;
    }

    // Bullet points: lines starting with "- "
    const isBullet = trimmed.startsWith("- ");
    if (isBullet) {
      const bulletText = trimmed.slice(2);
      const bulletIndent = margin + 4;
      const wrapped = doc.splitTextToSize(bulletText, usableWidth - 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      for (let i = 0; i < wrapped.length; i++) {
        newPageIfNeeded(6);
        if (i === 0) doc.text("–", margin + 1, y);
        doc.text(wrapped[i], bulletIndent, y);
        y += 5.5;
      }
      continue;
    }

    // Regular text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const wrapped = doc.splitTextToSize(line, usableWidth);
    for (const wl of wrapped) {
      newPageIfNeeded(6);
      doc.text(wl, margin, y);
      y += 5.5;
    }
  }

  doc.save(filename);
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={`font-bold px-3 py-1 rounded-full text-sm ${scoreColor(score)}`}>
      {score}%
    </span>
  );
}

// ─── Match Detail Panel ───────────────────────────────────────────────────────

function MatchDetail({ result }: { result: MatchResult }) {
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const items: { id: View; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "skill-match", label: "Skill Match", icon: "⚡" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-gray-900 border-r border-gray-800 flex flex-col p-4 z-10">
      <div className="font-bold text-base mb-8 px-2 text-amber-400">AISkillVita</div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
              view === item.id
                ? "bg-amber-900/30 text-amber-400"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  name,
  photo,
  size = 80,
}: {
  name: string;
  photo: string | null;
  size?: number;
}) {
  const style = { width: size, height: size, minWidth: size };
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={style}
        className="rounded-full object-cover"
      />
    );
  }
  return (
    <div
      style={style}
      className="rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-xl"
    >
      {initials(name)}
    </div>
  );
}

// ─── Profile View ─────────────────────────────────────────────────────────────

function ProfileView({
  cvName,
  profileData,
  profileLoading,
  profileError,
  profilePhoto,
  onUploadCv,
  onUploadPhoto,
}: {
  cvName: string | null;
  profileData: ProfileData | null;
  profileLoading: boolean;
  profileError: string | null;
  profilePhoto: string | null;
  onUploadCv: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  if (!profileData && !profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="text-5xl">📄</div>
        <h2 className="text-xl font-semibold">Build your profile</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Upload your CV and AI will extract your profile, skills, experience, and education automatically.
        </p>
        <label className="cursor-pointer bg-amber-400 text-black font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-amber-500 transition-colors">
          Upload CV (PDF)
          <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
        </label>
        {profileError && <p className="text-red-400 text-sm">{profileError}</p>}
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Extracting your profile…</p>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header row: replace CV */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Profile</h1>
        <label className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 underline">
          {cvName ? `CV: ${cvName} · Replace` : "Upload CV"}
          <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
        </label>
      </div>

      {/* Top row: Profile card + Skills card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile card */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900 flex gap-5 items-start">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <Avatar name={profileData.name} photo={profilePhoto} size={72} />
            <label className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 underline">
              {profilePhoto ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" onChange={onUploadPhoto} className="hidden" />
            </label>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{profileData.name}</h2>
            <p className="text-gray-300 text-sm mt-2 leading-relaxed">{profileData.summary}</p>
          </div>
        </div>

        {/* Skills card */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900">
          <h3 className="font-semibold mb-3">Strong Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((s) => (
              <span key={s} className="bg-amber-900/40 text-amber-300 px-3 py-1 rounded-full text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Experience + Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Experience */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900">
          <h3 className="font-semibold mb-4">Experience</h3>
          <div className="space-y-5">
            {profileData.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-amber-600 pl-4">
                <p className="font-medium text-sm">{exp.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {exp.company} · {exp.duration}
                </p>
                {exp.description && (
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900">
          <h3 className="font-semibold mb-4">Education</h3>
          <div className="space-y-4">
            {profileData.education.map((edu, i) => (
              <div key={i} className="border-l-2 border-gray-600 pl-4">
                <p className="font-medium text-sm">{edu.degree}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {edu.institution}
                  {edu.year ? ` · ${edu.year}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skill Match View ─────────────────────────────────────────────────────────

function SkillMatchView({
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("profile");

  // ── Shared CV state ──
  const [cvName, setCvName] = useState<string | null>(null);
  const [cvFormData, setCvFormData] = useState<FormData | null>(null);

  // ── Profile state ──
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // ── Skill Match state ──
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [newJobUrl, setNewJobUrl] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // ── Load from localStorage ──
  useEffect(() => {
    const savedView = localStorage.getItem(LS_VIEW) as View | null;
    if (savedView) setView(savedView);

    const savedCv = localStorage.getItem(LS_CV);
    if (savedCv) {
      const d = JSON.parse(savedCv);
      if (d.cvName) setCvName(d.cvName);
      if (d.profileData) setProfileData(d.profileData);
    }

    const savedPhoto = localStorage.getItem(LS_PHOTO);
    if (savedPhoto) setProfilePhoto(savedPhoto);

    const savedJobs = localStorage.getItem(LS_JOBS);
    if (savedJobs) {
      const d = JSON.parse(savedJobs);
      if (d.jobs) {
        setJobs(
          d.jobs.map((j: JobEntry) => ({
            ...j,
            analyzing: false,
            error: null,
            tailoringCv: false,
            generatingCoverLetter: false,
          }))
        );
      }
    }

    setHydrated(true);
  }, []);

  // ── Persist to localStorage ──
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_VIEW, view);
  }, [view, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_CV, JSON.stringify({ cvName, profileData }));
  }, [cvName, profileData, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (profilePhoto) localStorage.setItem(LS_PHOTO, profilePhoto);
    else localStorage.removeItem(LS_PHOTO);
  }, [profilePhoto, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      LS_JOBS,
      JSON.stringify({
        jobs: jobs.map(({ id, url, content, result, tailoredCv, coverLetter }) => ({
          id,
          url,
          content,
          result,
          tailoredCv,
          coverLetter,
        })),
      })
    );
  }, [jobs, hydrated]);

  // ─── CV upload (shared) ───────────────────────────────────────────────────

  async function handleUploadCv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("resume", file);
    setCvFormData(fd);
    setCvName(file.name);
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await extractProfile(fd);
      setProfileData(data);
    } catch (err) {
      setProfileError(`Could not extract profile: ${String(err)}`);
    } finally {
      setProfileLoading(false);
    }
  }

  // ─── Photo upload ─────────────────────────────────────────────────────────

  function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  // ─── Skill Match handlers ─────────────────────────────────────────────────

  async function handleAddJob() {
    const url = newJobUrl.trim();
    if (!url) return;
    setNewJobUrl("");
    const id = uid();
    setJobs((prev) => [
      ...prev,
      {
        id,
        url,
        content: "",
        result: null,
        analyzing: true,
        error: null,
        tailoredCv: null,
        tailoringCv: false,
        coverLetter: null,
        generatingCoverLetter: false,
      },
    ]);
    try {
      const content = await fetchJobAd(url);
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, content, analyzing: false } : j)));
    } catch {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, analyzing: false, error: "Could not fetch this URL." } : j))
      );
    }
  }

  async function handleAnalyzeJob(jobId: string) {
    if (!cvFormData) return;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, analyzing: true, error: null } : j)));
    try {
      const result = await matchCandidate(cvFormData, job.content);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, result, analyzing: false } : j)));
      setSelectedJobId(jobId);
    } catch {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, analyzing: false, error: "Analysis failed." } : j))
      );
    }
  }

  function handleDeleteJob(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJobId === jobId) setSelectedJobId(null);
  }

  async function handleTailorCv(jobId: string) {
    if (!cvFormData) return;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, tailoringCv: true } : j)));
    try {
      const tailoredCvText = await tailorCv(cvFormData, job.content);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, tailoredCv: tailoredCvText, tailoringCv: false } : j))
      );
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, tailoringCv: false } : j)));
    }
  }

  async function handleCreateCoverLetter(jobId: string) {
    if (!cvFormData) return;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, generatingCoverLetter: true } : j)));
    try {
      const coverLetterText = await createCoverLetter(cvFormData, job.content);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, coverLetter: coverLetterText, generatingCoverLetter: false } : j
        )
      );
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, generatingCoverLetter: false } : j)));
    }
  }

  function handleUpdateTailoredCv(jobId: string, content: string) {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, tailoredCv: content } : j)));
  }

  function handleUpdateCoverLetter(jobId: string, content: string) {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, coverLetter: content } : j)));
  }

  if (!hydrated) return null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar view={view} setView={setView} />
      <main className="ml-56 flex-1 p-8">
        {view === "profile" ? (
          <ProfileView
            cvName={cvName}
            profileData={profileData}
            profileLoading={profileLoading}
            profileError={profileError}
            profilePhoto={profilePhoto}
            onUploadCv={handleUploadCv}
            onUploadPhoto={handleUploadPhoto}
          />
        ) : (
          <SkillMatchView
            cvName={cvName}
            cvFormData={cvFormData}
            jobs={jobs}
            newJobUrl={newJobUrl}
            selectedJobId={selectedJobId}
            onUploadCv={handleUploadCv}
            onNewJobUrlChange={setNewJobUrl}
            onAddJob={handleAddJob}
            onAnalyzeJob={handleAnalyzeJob}
            onDeleteJob={handleDeleteJob}
            onSelectJob={setSelectedJobId}
            onTailorCv={handleTailorCv}
            onCreateCoverLetter={handleCreateCoverLetter}
            onUpdateTailoredCv={handleUpdateTailoredCv}
            onUpdateCoverLetter={handleUpdateCoverLetter}
          />
        )}
      </main>
    </div>
  );
}
