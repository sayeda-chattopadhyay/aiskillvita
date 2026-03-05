// Re-export ProfileData so components only need one import point
export type { ProfileData } from "@/actions/profile";

export type MatchResult = {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  summary: string;
};

export type JobEntry = {
  url: string;
  content: string;
  result: MatchResult | null;
  analyzing: boolean;
  error: string | null;
  tailoredCv: string | null;
  tailoringCv: boolean;
  coverLetter: string | null;
  generatingCoverLetter: boolean;
};

export type View = "profile" | "skill-match";
