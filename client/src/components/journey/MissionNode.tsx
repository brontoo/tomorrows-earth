import { useState } from "react";
import type { JourneyMapNode } from "@/lib/journeyStatus";
import CompletedMissionNode from "./CompletedMissionNode";
import CurrentMissionNode from "./CurrentMissionNode";
import LockedMissionNode from "./LockedMissionNode";
import MissionTooltip from "./MissionTooltip";

export default function MissionNode({ node, onSelect }: { node: JourneyMapNode; onSelect: (node: JourneyMapNode) => void }) {
  const [hovered, setHovered] = useState(false);
  const isInteractive = node.status !== "locked";

  return (
    <button
      type="button"
      className="group absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      aria-label={
        node.status === "locked"
          ? `${node.title} — locked, complete earlier missions first`
          : node.status === "current"
            ? `${node.title} — your current mission, ${node.points} points`
            : `${node.title} — completed`
      }
      aria-disabled={!isInteractive}
      onClick={() => isInteractive && onSelect(node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {node.status === "completed" && <CompletedMissionNode />}
      {node.status === "current" && <CurrentMissionNode />}
      {node.status === "locked" && <LockedMissionNode />}
      {hovered && <MissionTooltip node={node} />}
    </button>
  );
}
