import { scoreColor } from "@/lib/scoreColor";

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={`font-bold px-3 py-1 rounded-full text-sm ${scoreColor(score)}`}>
      {score}%
    </span>
  );
}
