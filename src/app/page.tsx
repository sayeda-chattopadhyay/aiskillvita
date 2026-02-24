"use client";

import { useState, useEffect } from "react";
import { extractSkills } from "./actions";

const VISIBLE_COUNT = 20;

export default function Home() {
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setSkills([]);
    setShowAll(false);
    setError(null);
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const extracted = await extractSkills(formData);
      setSkills(extracted);
      setShowAll(false);
    } catch {
      setError("Failed to extract skills. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const visibleSkills = showAll ? skills : skills.slice(0, VISIBLE_COUNT);
  const hiddenCount = skills.length - VISIBLE_COUNT;

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">AI Skill Extractor</h1>

      <form onSubmit={handleUpload} className="flex flex-col gap-4 mb-8">
        <label htmlFor="resume" className="font-medium">
          Upload CV (PDF)
        </label>
        <input
          id="resume"
          type="file"
          name="resume"
          accept=".pdf"
          required
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading || !fileUrl}
          className="bg-amber-400 text-black p-2 rounded disabled:opacity-50"
        >
          {loading ? "Extracting..." : "Extract Skills"}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {fileUrl && (
        <div className="flex gap-6 items-start">
          {/* PDF preview - takes remaining space */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold mb-2 truncate">{fileName}</h2>
            <iframe
              src={fileUrl}
              className="w-full border rounded"
              style={{ height: "calc(100vh - 200px)" }}
              title="Uploaded CV"
            />
          </div>

          {/* Skills panel - fixed width, scrollable */}
          {skills.length > 0 && (
            <div className="w-72 shrink-0 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">
                Extracted Skills ({skills.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {visibleSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {skills.length > VISIBLE_COUNT && (
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className="mt-4 text-sm text-amber-700 underline"
                >
                  {showAll
                    ? "See less"
                    : `See more (${hiddenCount} more skills)`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
