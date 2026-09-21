import { useState, type KeyboardEvent, type ReactElement } from "react";
import { motion } from "framer-motion";
import type { MapMission } from "@/data/earthJourneyMap";
import { MISSION_STATUS_LABEL } from "@/data/earthJourneyMap";
import { JOURNEY_MAP_VIEWBOX } from "@/data/missionCoordinates";
import CompletedMissionNode from "./CompletedMissionNode";
import CurrentMissionNode from "./CurrentMissionNode";
import LockedMissionNode from "./LockedMissionNode";

export interface FloatingMissionNodeProps {
  mission: MapMission;
  onSelect: (mission: MapMission) => void;
  onLocked: (mission: MapMission) => void;
}

const STATUS_COLOR: Record<MapMission["status"], string> = {
  completed: "#34d399",
  current: "#FFD54A",
  locked: "#94a3b8",
};

const STATUS_GLYPH: Record<MapMission["status"], string> = {
  completed: "✓ ",
  current: "● ",
  locked: "🔒 ",
};

/** Map-space coordinate -> percentage of the artwork box. */
const toPercent = (value: number, span: number) => (value / span) * 100;

/**
 * One interactive mission hotspot rendered as an absolutely-positioned DOM
 * node on top of the map layers. The visible marker is the same state SVG the
 * old overlay used, scaled into a small centered viewBox; the whole node bobs
 * with the `floatAnimation` keyframe.
 *
 * Placeholder positioning: coordinates are the calibrated mission points from
 * `missionCoordinates.ts` expressed as percentages — adjust these later in the
 * `style` below without touching the fixed viewBox-based art marker.
 */
export default function FloatingMissionNode({ mission, onSelect, onLocked }: FloatingMissionNodeProps) {
  const [hovered, setHovered] = useState(false);
  const isLocked = mission.status === "locked";

  const activate = () => {
    if (isLocked) onLocked(mission);
    else onSelect(mission);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  const renderStateNode = (): ReactElement => {
    switch (mission.status) {
      case "completed":
        return <CompletedMissionNode x={0} y={0} number={mission.id} />;
      case "current":
        return <CurrentMissionNode x={0} y={0} number={mission.id} />;
      case "locked":
        return <LockedMissionNode x={0} y={0} number={mission.id} />;
    }
  };

  const { x, y } = mission;
  // Keep the tooltip inside the map: show it below markers that sit high up.
  const tooltipAbove = y > 200;

  return (
    <div
      className="absolute z-30"
      style={{
        left: `${toPercent(x, JOURNEY_MAP_VIEWBOX.width)}%`,
        top: `${toPercent(y, JOURNEY_MAP_VIEWBOX.height)}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Mission ${mission.id}: ${mission.title}, ${MISSION_STATUS_LABEL[mission.status]}`}
        className="floating-mission-node relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full focus:outline-none"
        style={{ outline: "none" }}
        onClick={activate}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <svg
          viewBox="-60 -60 120 120"
          width="64"
          height="64"
          className="overflow-visible select-none"
          aria-hidden="true"
        >
          {/* Mission 15 is the grand finale — a soft, slowly breathing golden halo
              beneath its state marker marks it as the end of the whole adventure. */}
          {mission.id === 15 && (
            <g pointerEvents="none" aria-hidden="true">
              <circle r={30} fill="#FFD54A" opacity={0.1} />
              <motion.circle
                fill="none"
                stroke="#FFD54A"
                strokeWidth={2.5}
                animate={{ r: [34, 44, 34], opacity: [0.55, 0.2, 0.55] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
          )}
          {renderStateNode()}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute left-1/2 z-40 w-[268px] -translate-x-1/2 rounded-2xl border border-white/20 bg-[#070c18]/95 px-4 py-3 text-left shadow-xl"
            style={tooltipAbove ? { bottom: "calc(100% + 14px)" } : { top: "calc(100% + 14px)" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-300">
              Mission {mission.id}
            </p>
            <p className="mt-1 text-[15px] font-extrabold leading-tight text-white">{mission.title}</p>
            <p className="mt-1 text-xs font-semibold text-slate-300">
              World {mission.worldId} — {mission.world}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                {mission.points > 0 ? `+${mission.points} Sustainability Points` : "Sustainability Points"}
              </span>
              <span className="shrink-0 font-extrabold" style={{ color: STATUS_COLOR[mission.status] }}>
                {`${STATUS_GLYPH[mission.status]}${MISSION_STATUS_LABEL[mission.status]}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}