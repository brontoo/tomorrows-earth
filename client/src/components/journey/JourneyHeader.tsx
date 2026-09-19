import { Award, Target } from "lucide-react";

export default function JourneyHeader({
  totalPoints,
  levelName,
  levelIcon,
  completedCount,
  totalCount,
}: {
  totalPoints: number;
  levelName: string;
  levelIcon: string;
  completedCount: number;
  totalCount: number;
}) {
  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-20 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/90 px-4 py-2.5 shadow-lg backdrop-blur">
      <span className="text-xl" aria-hidden="true">{levelIcon}</span>
      <div className="leading-tight">
        <p className="text-xs font-semibold text-muted-foreground">{levelName}</p>
        <p className="text-sm font-black text-foreground">{totalPoints} pts</p>
      </div>
      <div className="h-8 w-px bg-border" aria-hidden="true" />
      <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
        <Target className="h-4 w-4 text-primary" aria-hidden="true" />
        {completedCount}/{totalCount}
      </div>
    </div>
  );
}
