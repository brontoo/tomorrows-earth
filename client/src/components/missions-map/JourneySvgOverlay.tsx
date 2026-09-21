import type { MapMission } from "@/data/earthJourneyMap";
import { JOURNEY_MAP_VIEWBOX } from "@/data/missionCoordinates";
import JourneyPath from "./JourneyPath";
import WorldLabelMarkers from "./WorldLabelMarkers";
import YouAreHereLabel from "./YouAreHereLabel";

interface JourneySvgOverlayProps {
  missions: MapMission[];
}

/**
 * Layer 3 — the decorative SVG overlay (pure visuals, never the hit targets).
 *
 * A full-size SVG aligned 1:1 with the base artwork (same viewBox). It owns
 * ALL progression visuals that do NOT need DOM positioning:
 *
 *   - the ONE continuous UAE adventure route (all 15 missions)
 *   - subtle world-transition labels beside each region
 *   - a SINGLE "YOU ARE HERE" caret+pill for the current mission
 *
 * Interactive mission markers are rendered on top as floating DOM nodes
 * (FloatingMissionNode) so this overlay can stay `pointer-events-none` and let
 * hover events reach the Emirates hitbox layer beneath.
 */
export default function JourneySvgOverlay({ missions }: JourneySvgOverlayProps) {
  const currentMission = missions.find((mission) => mission.status === "current") ?? null;

  return (
    <svg
      viewBox={`0 0 ${JOURNEY_MAP_VIEWBOX.width} ${JOURNEY_MAP_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-label="Interactive mission overlay on the UAE adventure map"
    >
      <JourneyPath missions={missions} />
      <WorldLabelMarkers />

      {currentMission && <YouAreHereLabel x={currentMission.x} y={currentMission.y} />}
    </svg>
  );
}