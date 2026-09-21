import { Link } from "wouter";
import { Home } from "lucide-react";

export interface JourneyHeaderProps {
  totalPoints: number;
  studentView: boolean;
}

/**
 * Compact floating header. Brand left, key stats right — deliberately light
 * so the adventure map stays the hero of the page.
 */
export default function JourneyHeader({ totalPoints, studentView }: JourneyHeaderProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-4">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-950/70 px-3 py-2 shadow-xl backdrop-blur-md sm:pr-4">
        <Link
          href="/"
          aria-label="Back to Tomorrow's Earth home"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="leading-tight">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
            Tomorrow's Earth
          </p>
          <p className="text-[11px] font-medium text-slate-300">UAE Adventure Map</p>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-white/15 bg-slate-950/70 px-2.5 py-2 shadow-xl backdrop-blur-md sm:gap-2 sm:px-3">
        <span
          title="Sustainability Points"
          className="whitespace-nowrap rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-black text-emerald-300"
        >
          {totalPoints.toLocaleString()} SP
        </span>
        {!studentView && (
          <span className="whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-200">
            Sign in as a student to track progress
          </span>
        )}
      </div>
    </header>
  );
}