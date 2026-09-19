import type { JourneyMapNode } from "@/lib/journeyStatus";

/** Thin dotted line connecting mission nodes in order — purely decorative. */
export default function JourneyPath({ nodes }: { nodes: JourneyMapNode[] }) {
  if (nodes.length < 2) return null;
  const points = nodes.map((node) => `${node.x},${node.y}`).join(" ");

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#d97706"
        strokeWidth={0.6}
        strokeDasharray="1.6 1.4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.75}
      />
    </svg>
  );
}
