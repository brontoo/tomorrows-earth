import type { JourneyMapNode } from "@/lib/journeyStatus";
import MissionNode from "./MissionNode";
import JourneyPath from "./JourneyPath";

export default function JourneySvgOverlay({
  nodes,
  onSelect,
}: {
  nodes: JourneyMapNode[];
  onSelect: (node: JourneyMapNode) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <JourneyPath nodes={nodes} />
      <div className="pointer-events-auto absolute inset-0">
        {nodes.map((node) => (
          <MissionNode key={node.missionId} node={node} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
