/**
 * Journey route segments.
 *
 * Pure path helpers for the dynamic SVG progression line. Nothing here is
 * baked into the artwork — the clean UAE adventure map contains no route, so
 * every curve is drawn at runtime by `JourneyPath`.
 *
 * The full 15-stage route is rendered as ONE visually continuous line from
 * Abu Dhabi → Dubai → Sharjah/Ajman/UAQ → Ras Al Khaimah → Fujairah. Each
 * consecutive pair of missions becomes one segment, and each segment is built
 * as a smooth rounded polyline that passes through pre-verified LAND waypoints
 * (computed against the real artwork so the journey follows the coastline and
 * never floats across open sea). Every segment is styled independently by the
 * state of the mission it arrives at (completed / current / future).
 */

import { MISSION_COORDINATES, JOURNEY_ROUTE_PATH, type MapCoordinate } from "./missionCoordinates";
import type { JourneyWorld } from "./earthJourneyMap";

/**
 * Land-anchored waypoints per route segment, indexed by the STARTING mission id
 * (segment `N` runs from mission N to mission N+1). Waypoints sit between
 * consecutive missions and keep the line hugging the emirates corridor
 * (Abu Dhabi → Dubai → Sharjah → Ajman → Umm Al Quwain → Ras Al Khaimah →
 * Fujairah) rather than cutting diagonally across open water. Expressed in the
 * 1586×992 artwork pixel space, aligned with `MISSION_COORDINATES`.
 */
const ROUTE_WAYPOINTS: Record<number, ReadonlyArray<readonly [number, number]>> = {
  1: [[450, 735]],
  2: [[640, 665]],
  3: [[800, 585]],
  4: [[905, 520]],
  5: [[990, 462]],
  6: [[1078, 405]],
  7: [[1092, 352]],
  8: [[1075, 290]],
  9: [[1125, 238]],
  10: [[1166, 182]],
  11: [[1220, 132]],
  12: [[1275, 145], [1290, 205]],
  13: [[1342, 297]],
  14: [[1405, 375]],
};

/** Build an SVG polyline string through a list of coordinates. */
export function polylineOf(points: MapCoordinate[]): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

/**
 * One smooth route leg between `from` and `to`, passing through the verified
 * land waypoints of segment `segmentId`. Built as a chain of cubic-Bezier
 * chunks (control points offset along each sub-chord) so the whole leg reads
 * as a flowing curve that follows the artwork; zero-length hops are skipped.
 */
export function routeSegmentPath(
  from: MapCoordinate,
  to: MapCoordinate,
  segmentId: number,
): string {
  const waypoints = ROUTE_WAYPOINTS[segmentId] ?? [];
  const points: MapCoordinate[] = [from];
  for (const [x, y] of waypoints) {
    const last = points[points.length - 1];
    if (last.x !== x || last.y !== y) points.push({ x, y });
  }
  const last = points[points.length - 1];
  if (last.x !== to.x || last.y !== to.y) points.push(to);

  const path = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) continue;
    const ux = dx / len;
    const uy = dy / len;
    const k = len / 3;
    path.push(
      `C ${(p1.x + ux * k).toFixed(1)} ${(p1.y + uy * k).toFixed(1)} ` +
        `${(p2.x - ux * k).toFixed(1)} ${(p2.y - uy * k).toFixed(1)} ${p2.x} ${p2.y}`,
    );
  }
  return path.join(" ");
}

/** Polyline through an ordered list of mission ids. */
export function pathThroughMissionIds(missionIds: number[]): string {
  const points = missionIds
    .map((id) => MISSION_COORDINATES[id])
    .filter((point): point is MapCoordinate => Boolean(point));
  return polylineOf(points);
}

/** Polyline through every mission id in a given world. */
export function worldPath(world: JourneyWorld): string {
  return pathThroughMissionIds(world.missionIds);
}

/**
 * The full journey route (every mission in progression order). Used as the
 * faint "where the adventure goes" guidance underneath the active segment.
 */
export { JOURNEY_ROUTE_PATH };