import { motion } from "framer-motion";
import type { MapMission } from "@/data/earthJourneyMap";

export interface CurrentMissionCardProps {
  mission: MapMission | null;
  onContinue: () => void;
}

/**
 * Small floating "CURRENT MISSION" panel. Compact by design so it never
 * covers important areas of the map artwork.
 */
export default function CurrentMissionCard({ mission, onContinue }: CurrentMissionCardProps) {
  if (!mission) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pointer-events-auto absolute bottom-3 left-3 z-20 w-64 max-w-[calc(100vw-24px)] rounded-2xl border border-white/15 bg-slate-950/80 p-3 shadow-2xl backdrop-blur-md sm:bottom-4 sm:left-4 sm:p-4"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Current Mission</p>
      <p className="mt-1 text-[15px] font-extrabold leading-snug text-white">
        Mission {mission.id} · {mission.title}
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="mt-3 w-full rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-amber-950 shadow transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Continue Mission →
      </button>
    </motion.div>
  );
}