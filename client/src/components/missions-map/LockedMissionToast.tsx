import { AnimatePresence, motion } from "framer-motion";
import { LockKeyhole } from "lucide-react";

export interface LockedMissionToastProps {
  missionTitle: string;
  /** Title of the mission that must be completed first. */
  requiredMissionTitle: string;
  requiredMissionId: number;
  visible: boolean;
}

/**
 * Warm, encouraging feedback when a student taps a locked mission. Rendered as
 * a slim floating toast near the bottom of the map so the artwork stays the
 * hero. Never uses harsh error styling.
 */
export default function LockedMissionToast({
  missionTitle,
  requiredMissionTitle,
  requiredMissionId,
  visible,
}: LockedMissionToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/85 px-4 py-3 shadow-2xl backdrop-blur-md">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10">
              <LockKeyhole className="h-4 w-4 text-amber-300" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-white">Mission locked</p>
              <p className="text-xs text-slate-300">
                Complete{" "}
                <span className="font-bold text-amber-300">
                  Mission {requiredMissionId} · {requiredMissionTitle}
                </span>{" "}
                first to unlock <span className="font-bold text-white">{missionTitle}</span>.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}