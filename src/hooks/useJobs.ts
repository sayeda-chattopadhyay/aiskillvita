import { useState, useEffect } from "react";
import { fetchJobAd, matchCandidate, tailorCv, createCoverLetter } from "@/actions";
import type { JobEntry } from "@/types";
import { uid } from "@/lib/uid";

const LS_JOBS = "asv_jobs";

export function useJobs(cvFormData: FormData | null) {
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [newJobUrl, setNewJobUrl] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem(LS_JOBS);
    if (savedJobs) {
      const d = JSON.parse(savedJobs);//
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

  // Persist jobs (only serialisable fields)
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

  return {
    jobs,
    newJobUrl,
    setNewJobUrl,
    selectedJobId,
    setSelectedJobId,
    handleAddJob,
    handleAnalyzeJob,
    handleDeleteJob,
    handleTailorCv,
    handleCreateCoverLetter,
    handleUpdateTailoredCv,
    handleUpdateCoverLetter,
  };
}
