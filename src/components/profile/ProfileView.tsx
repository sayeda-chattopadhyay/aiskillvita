import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import type { ProfileData } from "@/types";

export function ProfileView({
  cvName,
  cvDataUrl,
  profileData,
  profileLoading,
  profileError,
  profilePhoto,
  onUploadCv,
  onUploadPhoto,
}: {
  cvName: string | null;
  cvDataUrl: string | null;
  profileData: ProfileData | null;
  profileLoading: boolean;
  profileError: string | null;
  profilePhoto: string | null;
  onUploadCv: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  if (!profileData && !profileLoading) {
    const steps = [
      {
        icon: "📄",
        title: "Upload your CV",
        desc: "Drop in any PDF — AI handles the rest.",
      },
      {
        icon: "🧠",
        title: "AI reads your story",
        desc: "Skills, experience, education, and interests are pulled out automatically.",
      },
      {
        icon: "👤",
        title: "Your profile is built",
        desc: "See a clean summary of everything you bring to the table.",
      },
      {
        icon: "🚀",
        title: "Discover career opportunities",
        desc: "Get matched to roles and career paths that fit your unique background.",
      },
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8 max-w-md mx-auto">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Discover what your CV says about you</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Upload your CV once. AI builds your profile, surfaces your skills, and reveals career paths worth exploring.
          </p>
        </div>

        <div className="w-full space-y-3 text-left">
          {steps.map((item, i) => (
            <div key={i} className="flex items-start gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <label className="cursor-pointer bg-amber-400 text-black font-semibold px-8 py-3 rounded-lg text-base hover:bg-amber-500 transition-colors">
          Upload CV (PDF)
          <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
        </label>
        {profileError && <p className="text-red-400 text-sm mt-1">{profileError}</p>}
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
      {/* Header row: replace CV + preview */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="flex items-center gap-3">
          {cvDataUrl && (
            <button
              onClick={() => setShowPreview(true)}
              className="text-xs text-amber-400 hover:text-amber-300 underline"
            >
              Preview CV
            </button>
          )}
          <label className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 underline">
            {cvName ? `CV: ${cvName} · Replace` : "Upload CV"}
            <input type="file" accept=".pdf" onChange={onUploadCv} className="hidden" />
          </label>
        </div>
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

      {/* CV Preview Modal */}
      {showPreview && cvDataUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative w-full max-w-4xl h-[90vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <span className="text-sm font-medium text-gray-300">{cvName ?? "CV Preview"}</span>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <iframe
              src={cvDataUrl}
              className="w-full h-[calc(90vh-41px)]"
              title="CV Preview"
            />
          </div>
        </div>
      )}

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
