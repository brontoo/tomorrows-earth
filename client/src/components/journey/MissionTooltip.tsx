import type { JourneyMapNode } from "@/lib/journeyStatus";

export default function MissionTooltip({ node }: { node: JourneyMapNode }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 mb-3 w-48 -translate-x-1/2 rounded-xl border border-border bg-popover px-3 py-2 text-left shadow-xl"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{node.emirate}</p>
      <p className="mt-0.5 text-sm font-bold text-popover-foreground">{node.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {node.status === "locked" ? "Locked" : `${node.points} points`}
      </p>
    </div>
  );
}
