import { Link } from "wouter";
import { X } from "lucide-react";
import type { MapMission } from "@/data/earthJourneyMap";
import { JOURNEY_WORLDS, MISSION_STATUS_LABEL } from "@/data/earthJourneyMap";

export interface MissionDetailPanelProps {
  mission: MapMission;
  onClose: () => void;
}

const STATUS_MESSAGE: Record<string, string> = {
  completed:
    "You've completed this mission. Excellent work protecting the planet — the next region on the map is waiting for you.",
  current:
    "This is your next step on the journey. Follow the mission instructions, collect evidence, and a teacher will approve your progress.",
  locked:
    "Complete the previous mission to unlock this one. Every finished mission lights up the next part of the route.",
};

/**
 * Mission details: a right-side panel on desktop, a bottom sheet on mobile.
 * One component handles both via responsive classes — the map itself stays
 * visible and interactive behind it.
 */
export default function MissionDetailPanel({ mission, onClose }: MissionDetailPanelProps) {
  const world = JOURNEY_WORLDS.find((entry) => entry.id === mission.worldId);
  const worldId = mission.worldId;

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/35 md:bg-black/20" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Mission ${mission.id}: ${mission.title}`}
        className="fixed inset-x-0 bottom-0 z-40 max-h-[78vh] overflow-y-auto rounded-t-3xl border border-white/15 bg-slate-950/95 p-6 text-white shadow-2xl backdrop-blur-md md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[22rem] md:rounded-t-none md:rounded-l-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close mission details"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-300 hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-8">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
            {worldId > 0 && `World ${worldId} — `}
            {mission.world}
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight">
            Mission {mission.id}
            <span className="mt-1 block text-lg font-extrabold normal-case text-slate-200">{mission.title}</span>
          </h2>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
            +{mission.points} SP
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
            Estimated time: {mission.estimatedMinutes}
          </span>
          <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-bold text-sky-200">
            {MISSION_STATUS_LABEL[mission.status]}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
          <span aria-hidden="true">📍</span>
          <span>{mission.emirate}</span>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-300">{STATUS_MESSAGE[mission.status]}</p>

        {mission.status !== "locked" && (
          <Link
            href="/missions/list"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-amber-950 shadow transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {mission.status === "completed" ? "View mission" : "Continue Mission"}
          </Link>
        )}

        {mission.status === "locked" && (
          <p className="mt-8 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
            🔒 Complete the previous mission first to unlock <span className="font-bold text-white">{mission.title}</span>.
          </p>
        )}
      </div>
    </>
  );
}