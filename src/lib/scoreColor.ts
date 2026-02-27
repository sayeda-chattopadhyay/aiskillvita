export function scoreColor(score: number): string {
  if (score >= 75) return "bg-green-900/40 text-green-300";
  if (score >= 50) return "bg-amber-900/40 text-amber-300";
  return "bg-red-900/40 text-red-300";
}
