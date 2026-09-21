import { JOURNEY_WORLDS } from "@/data/earthJourneyMap";

/**
 * Small, elegant world-transition labels. Instead of locked-gate overlays, the
 * five Worlds are sign-posted beside their regions as compact two-line pills
 * in calm, verified-clear areas of the artwork (1586×992 coordinate space).
 *
 * Placement rule: each label sits adjacent to its mission cluster so it reads
 * as belonging to that region — World 1 hugs the Abu Dhabi coast, World 2 the
 * Dubai coast, World 3 the Sharjah/Ajman/UAQ shore, World 4 on land between
 * the Umm Al Quwain and Ras Al Khaimah missions (never floating in the sea),
 * and World 5 just off the Fujairah coast beside the final rally.
 */
const WORLD_LABEL_ANCHORS: Record<number, { x: number; y: number }> = {
  1: { x: 210, y: 770 },
  2: { x: 750, y: 470 },
  3: { x: 900, y: 290 },
  4: { x: 1082, y: 240 },
  5: { x: 1340, y: 345 },
};

interface WorldLabelMarkersProps {
  /** Optionally hide behind a specific layer order; default renders on top of the route. */
  zIndexOrder?: "behind-missions" | "above-missions";
}

export default function WorldLabelMarkers({ zIndexOrder = "above-missions" }: WorldLabelMarkersProps) {
  const groupClass = zIndexOrder === "behind-missions" ? "journey-world-labels" : "journey-world-labels";
  return (
    <g pointerEvents="none" aria-hidden="true" className={groupClass}>
      {JOURNEY_WORLDS.map((world) => {
        const anchor = WORLD_LABEL_ANCHORS[world.id];
        if (!anchor) return null;
        return <WorldLabel key={world.id} worldId={world.id} name={world.name} icon={world.icon} x={anchor.x} y={anchor.y} />;
      })}
    </g>
  );
}

interface WorldLabelProps {
  worldId: number;
  name: string;
  icon: string;
  x: number;
  y: number;
}

function WorldLabel({ worldId, name, icon, x, y }: WorldLabelProps) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-92" y="-31" width="184" height="62" rx="16" fill="#0b1526" opacity="0.74" />
      <rect x="-92" y="-31" width="184" height="62" rx="16" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" />
      <text y="-11" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="3" fill="#FFD54A">
        WORLD {worldId}
      </text>
      <text y="14" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f1f5f9">
        {icon} {name}
      </text>
    </g>
  );
}