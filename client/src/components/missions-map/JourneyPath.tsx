import { motion } from "framer-motion";
import type { MapMission } from "@/data/earthJourneyMap";
import { routeSegmentPath } from "@/data/journeyPaths";

export interface JourneyPathProps {
  missions: MapMission[];
}

/**
 * The ONE continuous UAE adventure route — a single smooth line through all 15
 * missions (Abu Dhabi → Dubai → Sharjah/Ajman/UAQ → Ras Al Khaimah → Fujairah),
 * drawn with Catmull-Rom curves so it flows with the artwork rather than as
 * straight lines.
 *
 * The whole route is always visible; the segment approaching the CURRENT
 * mission glows gold and animates, the route already earned turns green, and
 * the route ahead stays visible but subdued. The artwork is neutral; this
 * overlay is the single source of truth for the journey line.
 */
export default function JourneyPath({ missions }: JourneyPathProps) {
  const ordered = [...missions].sort((a, b) => a.id - b.id);

  // Seam-free base line for the whole route so it reads as one continuous
  // adventure regardless of how segments are styled above it.
  const fullRoute = ordered
    .slice(0, -1)
    .map((mission, index) => routeSegmentPath(mission, ordered[index + 1], mission.id))
    .join(" ");

  return (
    <g pointerEvents="none" aria-hidden="true">
      {/* Base guidance — the complete route, warm and faint but always present */}
      {fullRoute && (
        <>
          <path d={fullRoute} fill="none" stroke="#ffd586" strokeWidth={17} strokeLinecap="round" opacity={0.12} />
          <path d={fullRoute} fill="none" stroke="#ffeeba" strokeWidth={7} strokeLinecap="round" opacity={0.35} />
        </>
      )}

      {ordered.slice(0, -1).map((mission, index) => {
        const target = ordered[index + 1];
        const d = routeSegmentPath(mission, target, mission.id);

        if (target.status === "completed") {
          return (
            <g key={target.id}>
              {/* soft outer glow */}
              <path d={d} fill="none" stroke="#059669" strokeWidth={20} strokeLinecap="round" opacity={0.35} />
              {/* main earned segment — bright green-gold, thicker than before */}
              <path d={d} fill="none" stroke="#34d399" strokeWidth={8} strokeLinecap="round" opacity={1} />
              {/* inner shine for a premium finish */}
              <path d={d} fill="none" stroke="#ecfdf5" strokeWidth={3.5} strokeLinecap="round" opacity={0.9} />
            </g>
          );
        }

        if (target.status === "current") {
          return (
            <g key={target.id}>
              {/* intense warm glow, gently pulsing */}
              <motion.path
                d={d}
                fill="none"
                stroke="#FFC839"
                strokeWidth={24}
                strokeLinecap="round"
                opacity={0.5}
                animate={{ opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* strongest solid highlight — the active leg stands out most */}
              <path d={d} fill="none" stroke="#FFC839" strokeWidth={9} strokeLinecap="round" opacity={1} />
              {/* marching dashes sweep along the active path */}
              <motion.path
                d={d}
                fill="none"
                stroke="#fff8e1"
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray="9 20"
                animate={{ strokeDashoffset: [0, -58] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
            </g>
          );
        }

        // Future — the road ahead stays clearly visible so the student can see
        // the whole adventure, but softer than the completed/active legs.
        return (
          <g key={target.id}>
            <path d={d} fill="none" stroke="#cfe0f2" strokeWidth={16} strokeLinecap="round" opacity={0.12} />
            <path
              d={d}
              fill="none"
              stroke="#e2ecf8"
              strokeWidth={5.5}
              strokeLinecap="round"
              strokeDasharray="3 13"
              opacity={0.6}
            />
          </g>
        );
      })}
    </g>
  );
}