"use client";

import { useState, useEffect } from "react";
import type { View } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import { useJobs } from "@/hooks/useJobs";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProfileView } from "@/components/profile/ProfileView";
import { SkillMatchView } from "@/components/skill-match/SkillMatchView";

const LS_VIEW = "asv_view";

export default function ProfileApp() {
  const [view, setView] = useState<View>("profile");
  const [hydrated, setHydrated] = useState(false);

  const {
    hydrated: profileHydrated,
    cvName,
    cvFormData,
    cvDataUrl,
    profileData,
    profileLoading,
    profileError,
    profilePhoto,
    handleUploadCv,
    handleUploadPhoto,
  } = useProfile();

  const {
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
  } = useJobs(cvFormData);

  // Persist the active view tab
  useEffect(() => {
    const saved = localStorage.getItem(LS_VIEW) as View | null;
    if (saved) setView(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_VIEW, view);
  }, [view, hydrated]);

  function handleDeleteProfile() {
    if (!window.confirm("Delete your profile? This removes your CV, photo, and all job entries. This cannot be undone.")) return;
    ["asv_cv", "asv_cv_data", "asv_photo", "asv_job", "asv_view", "aiskillvita_used"].forEach((k) =>
      localStorage.removeItem(k)
    );
    window.location.reload();
  }

  if (!hydrated || !profileHydrated) return null;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar view={view} setView={setView} onDeleteProfile={handleDeleteProfile} />
      <main className="ml-56 flex-1 p-8">
        {view === "profile" ? (
          <ProfileView
            cvName={cvName}
            cvDataUrl={cvDataUrl}
            profileData={profileData}
            profileLoading={profileLoading}
            profileError={profileError}
            profilePhoto={profilePhoto}
            onUploadCv={handleUploadCv}
            onUploadPhoto={handleUploadPhoto}
            onGoToSkillMatch={() => setView("skill-match")}
          />
        ) : (
          <SkillMatchView
            cvName={cvName}
            hasCv={!!cvFormData}
            job={job}
            jobUrl={jobUrl}
            rawJobText={rawJobText}
            cvGenerated={cvGenerated}
            coverLetterGenerated={coverLetterGenerated}
            onJobUrlChange={setJobUrl}
            onRawJobTextChange={setRawJobText}
            onAnalyseMatch={handleAnalyseMatch}
            onClearJob={handleClearJob}
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
