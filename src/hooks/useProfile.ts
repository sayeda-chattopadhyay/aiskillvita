import { useState, useEffect } from "react";
import { extractProfile } from "@/actions/profile";
import type { ProfileData } from "@/types";

const LS_CV = "asv_cv";
const LS_PHOTO = "asv_photo";
const LS_CV_DATA = "asv_cv_data";

function dataUrlToFormData(dataUrl: string, fileName: string): FormData {
  const [header, base64] = dataUrl.split(",");
  const mimeType = header.match(/:(.*?);/)?.[1] ?? "application/pdf";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });
  const file = new File([blob], fileName, { type: mimeType });
  const fd = new FormData();
  fd.append("resume", file);
  return fd;
}

export function useProfile() {
  const [cvName, setCvName] = useState<string | null>(null);
  const [cvFormData, setCvFormData] = useState<FormData | null>(null);
  const [cvDataUrl, setCvDataUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount — auto-reconstruct cvFormData so user never needs to re-upload
  useEffect(() => {
    const savedCv = localStorage.getItem(LS_CV);
    let storedName: string | null = null;
    if (savedCv) {
      const d = JSON.parse(savedCv);
      if (d.cvName) { setCvName(d.cvName); storedName = d.cvName; }
      if (d.profileData) setProfileData(d.profileData);
    }
    const savedCvData = localStorage.getItem(LS_CV_DATA);
    if (savedCvData) {
      setCvDataUrl(savedCvData);
      // Reconstruct FormData from stored PDF so analysis works without re-uploading
      try {
        const fd = dataUrlToFormData(savedCvData, storedName ?? "cv.pdf");
        setCvFormData(fd);
      } catch {
        // If reconstruction fails, user will need to re-upload — handled gracefully in UI
      }
    }
    const savedPhoto = localStorage.getItem(LS_PHOTO);
    if (savedPhoto) setProfilePhoto(savedPhoto);
    setHydrated(true);
  }, []);

  // Persist CV + profile data
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_CV, JSON.stringify({ cvName, profileData }));
  }, [cvName, profileData, hydrated]);

  // Persist CV data URL (the raw PDF for preview)
  useEffect(() => {
    if (!hydrated) return;
    if (cvDataUrl) localStorage.setItem(LS_CV_DATA, cvDataUrl);
    else localStorage.removeItem(LS_CV_DATA);
  }, [cvDataUrl, hydrated]);

  // Persist photo
  useEffect(() => {
    if (!hydrated) return;
    if (profilePhoto) localStorage.setItem(LS_PHOTO, profilePhoto);
    else localStorage.removeItem(LS_PHOTO);
  }, [profilePhoto, hydrated]);

  async function handleUploadCv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("resume", file);
    setCvFormData(fd);
    setCvName(file.name);
    setProfileLoading(true);
    setProfileError(null);
    // Read PDF as data URL so we can preview it and reconstruct FormData later
    const reader = new FileReader();
    reader.onload = () => setCvDataUrl(reader.result as string);
    reader.readAsDataURL(file);
    try {
      const data = await extractProfile(fd);
      setProfileData(data);
    } catch (err) {
      setProfileError(`Could not extract profile: ${String(err)}`);
    } finally {
      setProfileLoading(false);
    }
  }

  function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  return {
    hydrated,
    cvName,
    cvFormData,
    cvDataUrl,
    profileData,
    profileLoading,
    profileError,
    profilePhoto,
    handleUploadCv,
    handleUploadPhoto,
  };
}
