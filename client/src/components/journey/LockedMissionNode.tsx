import { LockKeyhole } from "lucide-react";

/** Muted lock icon for a mission the student hasn't reached yet. */
export default function LockedMissionNode() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400/80 shadow ring-2 ring-white/70">
      <LockKeyhole className="h-4 w-4 text-white" aria-hidden="true" />
    </div>
  );
}
