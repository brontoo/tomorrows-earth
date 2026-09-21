/**
 * Mission marker coordinates on the UAE adventure map artwork.
 *
 * The artwork is the approved clean UAE adventure map (`/maps/uae-adventure-map.png`,
 * source PNG `client/public/maps/ChatGPT Image.png`, 1586×992 px). These
 * coordinates are expressed in that exact pixel space so the SVG overlay can
 * use `viewBox="0 0 1586 992"` and line up perfectly with the image.
 *
 * The artwork is intentionally NEUTRAL — it contains NO route, NO checkmarks,
 * NO locks and NO "YOU ARE HERE". Every progression visual is rendered
 * dynamically in the React/SVG overlay (this overlay is the single source of
 * truth for all journey gameplay). Mission markers sit on the illustrated
 * geography:
 *
*   - Abu Dhabi south-west (missions 1–3)
 *   - Dubai (4–5)
 *   - Sharjah (6–7)
 *   - Ajman (8)
 *   - Umm Al Quwain (9–10)
 *   - Ras Al Khaimah north (11–12)
 *   - Fujairah east coast, the final chapter (13–15)
 *
 * Coordinates are anchored to the Emirates hitbox artwork (the 6609×4134
 * interactive SVG) which outlines the exact landmass of every emirate. Each
 * mission sits comfortably INSIDE its emirate's bounding region, so the
 * progression flows left → right and bottom → top, climbing the coast from
 * Abu Dhabi → Dubai → Sharjah → Ajman → Umm Al Quwain → Ras Al Khaimah and then
 * descending the far-east Fujairah coast to finish at the map's right edge.
 *
 * If a marker needs manual tweaking on a specific screen, adjust only this
 * file — no component reads coordinates directly.
 */

export interface MapCoordinate {
  x: number;
  y: number;
}

/** Pixel space of the artwork. The SVG overlay must mirror this. */
export const JOURNEY_MAP_VIEWBOX = { width: 1586, height: 992 } as const;

export const MISSION_COORDINATES: Record<number, MapCoordinate> = {
  // Abu Dhabi (missions 1–3): bottom-left → lower-middle, drifting east.
  1: { x: 360, y: 770 },
  2: { x: 540, y: 700 },
  3: { x: 740, y: 630 },
  // Dubai (4–5): centre of the map, near Burj Khalifa.
  4: { x: 860, y: 540 },
  5: { x: 950, y: 500 },
  // Sharjah (6–7): just above Dubai, slightly right.
  6: { x: 1030, y: 425 },
  7: { x: 1125, y: 385 },
  // Ajman (8): just above Sharjah.
  8: { x: 1060, y: 320 },
  // Umm Al Quwain (9–10): above Ajman, heading north.
  9: { x: 1090, y: 260 },
  10: { x: 1160, y: 215 },
  // Ras Al Khaimah (11–12): the top-right corner.
  11: { x: 1180, y: 150 },
  12: { x: 1260, y: 115 },
  // Fujairah (13–15): the far-right east-coast chapter, descending to the
  // bottom-right end of the adventure.
  13: { x: 1310, y: 260 },
  14: { x: 1375, y: 335 },
  15: { x: 1435, y: 415 },
};

/** Ordered polyline joining every mission marker in progression order. */
export const JOURNEY_ROUTE_PATH = Object.keys(MISSION_COORDINATES)
  .map((key) => MISSION_COORDINATES[Number(key)])
  .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
  .join(" ");