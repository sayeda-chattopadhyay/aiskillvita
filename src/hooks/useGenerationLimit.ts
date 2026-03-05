"use client";

import { useState, useEffect } from "react";

const LS_KEY = "aiskillvita_used";

export function useGenerationLimit() {
  const [cvGenerated, setCvGenerated] = useState(false);
  const [coverLetterGenerated, setCoverLetterGenerated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCvGenerated(parsed.cvGenerated === true);
        setCoverLetterGenerated(parsed.coverLetterGenerated === true);
      }
    } catch {}
  }, []);

  function markCvUsed() {
    const stored = localStorage.getItem(LS_KEY);
    const existing = stored ? JSON.parse(stored) : {};
    localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, cvGenerated: true, cvGeneratedAt: new Date().toISOString() }));
    setCvGenerated(true);
  }

  function markCoverLetterUsed() {
    const stored = localStorage.getItem(LS_KEY);
    const existing = stored ? JSON.parse(stored) : {};
    localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, coverLetterGenerated: true, coverLetterGeneratedAt: new Date().toISOString() }));
    setCoverLetterGenerated(true);
  }

  return { cvGenerated, coverLetterGenerated, markCvUsed, markCoverLetterUsed };
}
