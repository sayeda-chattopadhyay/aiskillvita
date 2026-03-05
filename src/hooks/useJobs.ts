import { useState, useEffect } from "react";
import { fetchJobAd, matchCandidate, tailorCv, createCoverLetter } from "@/actions";
import type { JobEntry } from "@/types";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";

const LS_JOB = "asv_job";

const emptyJob: JobEntry = {
  url: "",
  content: "",
  result: null,
  analyzing: false,
  error: null,
  tailoredCv: null,
  tailoringCv: false,
  coverLetter: null,
  generatingCoverLetter: false,
};

export function useJobs(cvFormData: FormData | null) {
  const [job, setJob] = useState<JobEntry>(emptyJob);
  const [jobUrl, setJobUrl] = useState("");
  const [rawJobText, setRawJobText] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const { cvGenerated, coverLetterGenerated, markCvUsed, markCoverLetterUsed } = useGenerationLimit();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_JOB);
    if (saved) {
      const d = JSON.parse(saved);
      setJob({ ...emptyJob, ...d });
      if (d.url) setJobUrl(d.url);
    }
    setHydrated(true);
  }, []);

  // Persist job (only serialisable fields)
  useEffect(() => {
    if (!hydrated) return;
    const { url, content, result, tailoredCv, coverLetter } = job;
    localStorage.setItem(LS_JOB, JSON.stringify({ url, content, result, tailoredCv, coverLetter }));
  }, [job, hydrated]);

  async function handleAnalyseMatch() {
    if (!cvFormData) return;
    const url = jobUrl.trim();
    const raw = rawJobText.trim();
    if (!url && !raw) return;

    setJob({ ...emptyJob, url, analyzing: true });

    let content = raw;

    // If URL is provided, fetch the job content first
    if (url) {
      try {
        content = await fetchJobAd(url);
      } catch {
        setJob((prev) => ({
          ...prev,
          analyzing: false,
          error: "Could not fetch this URL. Try pasting the job description below instead.",
        }));
        return;
      }
    }

    if (!content) {
      setJob((prev) => ({
        ...prev,
        analyzing: false,
        error: "Please enter a job URL or paste the job description.",
      }));
      return;
    }

    try {
      setJob((prev) => ({ ...prev, content, error: null }));
      const result = await matchCandidate(cvFormData, content);
      setJob((prev) => ({ ...prev, result, analyzing: false }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setJob((prev) => ({ ...prev, analyzing: false, error: `Analysis failed: ${msg}` }));
    }
  }

  async function handleTailorCv() {
    if (!cvFormData || cvGenerated) return;
    setJob((prev) => ({ ...prev, tailoringCv: true }));
    try {
      const tailoredCvText = await tailorCv(cvFormData, job.content);
      setJob((prev) => ({ ...prev, tailoredCv: tailoredCvText, tailoringCv: false }));
      markCvUsed();
    } catch {
      setJob((prev) => ({ ...prev, tailoringCv: false }));
    }
  }

  async function handleCreateCoverLetter() {
    if (!cvFormData || coverLetterGenerated) return;
    setJob((prev) => ({ ...prev, generatingCoverLetter: true }));
    try {
      const coverLetterText = await createCoverLetter(cvFormData, job.content);
      setJob((prev) => ({ ...prev, coverLetter: coverLetterText, generatingCoverLetter: false }));
      markCoverLetterUsed();
    } catch {
      setJob((prev) => ({ ...prev, generatingCoverLetter: false }));
    }
  }

  function handleUpdateTailoredCv(content: string) {
    setJob((prev) => ({ ...prev, tailoredCv: content }));
  }

  function handleUpdateCoverLetter(content: string) {
    setJob((prev) => ({ ...prev, coverLetter: content }));
  }

  function handleClearJob() {
    setJob(emptyJob);
    setJobUrl("");
    setRawJobText("");
  }

  return {
    job,
    jobUrl,
    setJobUrl,
    rawJobText,
    setRawJobText,
    cvGenerated,
    coverLetterGenerated,
    handleAnalyseMatch,
    handleTailorCv,
    handleCreateCoverLetter,
    handleUpdateTailoredCv,
    handleUpdateCoverLetter,
    handleClearJob,
  };
}
