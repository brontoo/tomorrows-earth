/**
 * Earth Journey Map — visual layout config.
 *
 * This file holds ONLY presentation metadata (where a mission's marker sits on the
 * UAE adventure map artwork, and which emirate label it belongs to). It never invents
 * mission content, points, or status — all of that comes from real backend data
 * (`trpc.zones.getAll`, `trpc.missions.getAll`, `trpc.missionCompletions.getAllMine`).
 *
 * ⚠️ CALIBRATION REQUIRED: the x/y percentages below are placeholders. Once the
 * approved `uae-adventure-map` artwork is placed at `client/public/maps/uae-adventure-map.png`,
 * re-inspect the image and adjust each entry's `x`/`y` (0–100, percent of image width/height)
 * so markers land exactly on the intended spot on the artwork. Do not guess — measure
 * against the actual image pixels.
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

// Ordered west/south -> east/north to loosely follow the path drawn on the artwork.
export const JOURNEY_MAP_LAYOUT: JourneyMapPoint[] = [
  { zoneSlug: "water", emirate: "Abu Dhabi", x: 14, y: 80 },
  { zoneSlug: "energy", emirate: "Dubai", x: 28, y: 64 },
  { zoneSlug: "circular-economy-waste", emirate: "Dubai", x: 40, y: 53 },
  { zoneSlug: "biodiversity-nature", emirate: "Sharjah", x: 51, y: 45 },
  { zoneSlug: "climate", emirate: "Ajman", x: 60, y: 37 },
  { zoneSlug: "sustainable-cities", emirate: "Umm Al Quwain", x: 69, y: 29 },
  { zoneSlug: "sustainable-living", emirate: "Ras Al Khaimah", x: 79, y: 18 },
  { zoneSlug: "innovation", emirate: "Fujairah", x: 89, y: 25 },
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
