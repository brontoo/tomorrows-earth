import { MapPin } from "lucide-react";

/** Pulsing gold "YOU ARE HERE" node for the student's current mission. */
export default function CurrentMissionNode() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60" aria-hidden="true" />
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 shadow-lg shadow-amber-900/40 ring-2 ring-white">
        <MapPin className="h-5 w-5 text-amber-950" aria-hidden="true" />
      </span>
      <span className="absolute -bottom-6 whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-950 shadow">
        You are here
      </span>
    </div>
  );
}
