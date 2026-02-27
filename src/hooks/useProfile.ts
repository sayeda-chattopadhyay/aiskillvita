import { useState, useEffect } from "react";
import { extractProfile } from "@/actions/profile";
import type { ProfileData } from "@/types";

const LS_CV = "asv_cv";
const LS_PHOTO = "asv_photo";

export function useProfile() {
  const [cvName, setCvName] = useState<string | null>(null);
  const [cvFormData, setCvFormData] = useState<FormData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCv = localStorage.getItem(LS_CV);
    if (savedCv) {
      const d = JSON.parse(savedCv);
      if (d.cvName) setCvName(d.cvName);
      if (d.profileData) setProfileData(d.profileData);
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
    profileData,
    profileLoading,
    profileError,
    profilePhoto,
    handleUploadCv,
    handleUploadPhoto,
  };
}
