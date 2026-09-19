import type { Mission, SustainabilityZone, MissionCompletion } from "@shared/types";
import { getMapPosition } from "@/data/journeyMapLayout";

export type MissionMapStatus = "completed" | "current" | "locked";

export interface JourneyMapNode {
  missionId: number;
  slug: string;
  title: string;
  points: number;
  zoneId: number;
  zoneName: string;
  zoneIcon: string | null;
  emirate: string;
  x: number;
  y: number;
  status: MissionMapStatus;
  completion: MissionCompletion | null;
}

/**
 * Derives ordered journey-map nodes from real backend data. Order follows the
 * zone's `sortOrder` (authoritative, DB-driven) — never hardcoded. A mission is
 * "completed" if its completion status is "completed" or "verified". The first
 * mission after the last completed one is "current" (you-are-here); everything
 * after that is "locked" for map presentation only (the mission itself always
 * stays reachable directly via /missions/:slug).
 */
export function buildJourneyMapNodes(
  zones: SustainabilityZone[],
  missions: Mission[],
  completions: MissionCompletion[],
): JourneyMapNode[] {
  const orderedZones = [...zones].sort((a, b) => a.sortOrder - b.sortOrder);
  const missionsByZoneId = new Map(missions.map((mission) => [mission.zoneId, mission]));
  const completionByMissionId = new Map(completions.map((completion) => [completion.missionId, completion]));

  const ordered = orderedZones
    .map((zone) => ({ zone, mission: missionsByZoneId.get(zone.id) }))
    .filter((entry): entry is { zone: SustainabilityZone; mission: Mission } => Boolean(entry.mission));

  let currentAssigned = false;
  return ordered.map(({ zone, mission }, index) => {
    const completion = completionByMissionId.get(mission.id) ?? null;
    const isCompleted = completion?.status === "completed" || completion?.status === "verified";
    let status: MissionMapStatus;
    if (isCompleted) {
      status = "completed";
    } else if (!currentAssigned) {
      status = "current";
      currentAssigned = true;
    } else {
      status = "locked";
    }
    const position = getMapPosition(zone.slug, index, ordered.length);
    return {
      missionId: mission.id,
      slug: mission.slug,
      title: mission.title,
      points: mission.pointsAvailable,
      zoneId: zone.id,
      zoneName: zone.name,
      zoneIcon: zone.icon,
      emirate: position.emirate,
      x: position.x,
      y: position.y,
      status,
      completion,
    };
  });
}
