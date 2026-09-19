import { Link } from "wouter";
import { X } from "lucide-react";
import type { JourneyMapNode } from "@/lib/journeyStatus";

/**
 * Mission details surface: a right-side panel on desktop, a bottom sheet on mobile.
 * Same component handles both via responsive classes so there is a single source of truth.
 */
export default function MissionDetailPanel({ node, onClose }: { node: JourneyMapNode; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${node.title} mission details`}
        className="fixed inset-x-0 bottom-0 z-40 max-h-[75vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-96 md:rounded-t-none md:rounded-l-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close mission details"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{node.emirate} · {node.zoneName}</p>
        <h2 className="mt-2 text-2xl font-black text-foreground">{node.title}</h2>

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{node.points} points</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold capitalize text-muted-foreground">{node.status}</span>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          {node.status === "completed"
            ? "You've completed this mission. Great work protecting the planet!"
            : node.status === "current"
              ? "This is your next step on the journey. Open the mission to see full instructions and submit your evidence."
              : "Complete earlier missions on the map to unlock this one."}
        </p>

        {node.status !== "locked" && (
          <Link
            href={`/missions/${node.slug}`}

            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90"
          >
            {node.status === "completed" ? "View mission" : "Start mission"}
          </Link>
        )}
      </div>
    </>
  );
}
