/**
 * Earth Journey Map — visual layout config.
 *
 * This file holds ONLY presentation metadata (where a mission's marker sits on the
 * UAE adventure map artwork, and which emirate label it belongs to). It never invents
 * mission content, points, or status — all of that comes from real backend data
 * (`trpc.zones.getAll`, `trpc.missions.getAll`, `trpc.missionCompletions.getAllMine`).
 *
 * Calibrated against the approved artwork at `client/public/maps/uae-adventure-map.png`
 * (1448×1086 px). Coordinates follow the gold dotted path already drawn on the image,
 * from the Abu Dhabi start flag through Dubai, Sharjah, Ajman, and up to Umm Al Quwain /
 * Ras Al Khaimah — matched in order to our 8 real zones by `sortOrder`. The artwork's
 * Fujairah checkpoint is left unassigned (reserved for a future 9th zone/mission).
 */

export interface JourneyMapPoint {
  /** Real zone slug from `sustainability_zones` (matches `trpc.zones.getAll`). */
  zoneSlug: string;
  /** Cosmetic geography label only — UAE emirates are real-world, invariant. */
  emirate: string;
  /** Percent position (0-100) relative to the base map image. */
  x: number;
  y: number;
}

// Ordered along the gold dotted path drawn on the artwork, Abu Dhabi -> Ras Al Khaimah.
export const JOURNEY_MAP_LAYOUT: JourneyMapPoint[] = [
  { zoneSlug: "water", emirate: "Abu Dhabi", x: 34, y: 68 },
  { zoneSlug: "energy", emirate: "Abu Dhabi", x: 48, y: 59 },
  { zoneSlug: "circular-economy-waste", emirate: "Dubai", x: 56, y: 51 },
  { zoneSlug: "biodiversity-nature", emirate: "Dubai", x: 62, y: 45 },
  { zoneSlug: "climate", emirate: "Sharjah", x: 71, y: 36 },
  { zoneSlug: "sustainable-cities", emirate: "Ajman", x: 65, y: 30 },
  { zoneSlug: "sustainable-living", emirate: "Umm Al Quwain", x: 62, y: 21 },
  { zoneSlug: "innovation", emirate: "Ras Al Khaimah", x: 80, y: 9 },
];

/**
 * Resolve a marker position for a given zone slug. Falls back to an even diagonal
 * spread so the map never crashes/omits a node if a new zone is added before this
 * config is updated by a developer.
 */
export function getMapPosition(zoneSlug: string, indexInOrder: number, total: number): { x: number; y: number; emirate: string } {
  const known = JOURNEY_MAP_LAYOUT.find((entry) => entry.zoneSlug === zoneSlug);
  if (known) return { x: known.x, y: known.y, emirate: known.emirate };
  const ratio = total > 1 ? indexInOrder / (total - 1) : 0;
  return { x: 12 + ratio * 76, y: 82 - ratio * 64, emirate: "Unmapped region" };
}

export const BASE_MAP_IMAGE_SRC = "/maps/uae-adventure-map.png";
