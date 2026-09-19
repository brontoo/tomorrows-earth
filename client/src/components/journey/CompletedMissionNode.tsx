import { CheckCircle2 } from "lucide-react";

/** Green checkmark node for a completed mission — matches spec's completed-state rendering. */
export default function CompletedMissionNode() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-900/30 ring-2 ring-white">
      <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
    </div>
  );
}
