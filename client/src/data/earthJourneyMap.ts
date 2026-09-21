/**
 * Earth Journey — mission configuration.
 *
 * Single source of truth for the 15 journey missions organised into 5 worlds:
 *
 *   World 1 — Waste Investigator        (missions 1–3)
 *   World 2 — Resource Detective        (missions 4–6)
 *   World 3 — Sustainability Researcher (missions 7–9)
 *   World 4 — Earth Communicator        (missions 10–12)
 *   World 5 — Young Changemaker         (missions 13–15)
 *
 * Presentation-only data (title, world, emirate, points, coordinates). Student
 * *state* is never stored here — statuses are derived at runtime from real
 * backend data (`trpc.missionCompletions.getAllMine` + `trpc.passport.getMine`)
 * via `getMissionStatus`, and points are only ever *displayed* from the
 * backend; no points are awarded from the frontend.
 */

import { MISSION_COORDINATES, JOURNEY_MAP_VIEWBOX } from "./missionCoordinates";

export type MissionStatus = "completed" | "current" | "locked";

export interface MapMission {
  id: number;
  title: string;
  /** World name, e.g. "Waste Investigator". */
  world: string;
  /** World ordinal, mirrors `JourneyWorld.id`. */
  worldId: number;
  /** Friendly emirate label, cosmetic geography only. */
  emirate: string;
  /** x in 1586×992 artwork space. */
  x: number;
  y: number;
  /** Sustainability Points the mission is worth (display only). */
  points: number;
  /** Human friendly estimate, e.g. "20–30 minutes". */
  estimatedMinutes: string;
  status: MissionStatus;
}

export interface JourneyWorld {
  id: number;
  name: string;
  icon: string;
  tagline: string;
  /** Ordered mission ids belonging to this world. */
  missionIds: number[];
}

export const JOURNEY_MAP_SIZE = JOURNEY_MAP_VIEWBOX;

/** The approved clean UAE adventure map artwork (1586×992 PNG, base layer). */
export const BASE_MAP_IMAGE_SRC = "/maps/uae-adventure-map.png";

export const MISSION_STATUS_LABEL: Record<MissionStatus, string> = {
  completed: "Completed",
  current: "Current Mission",
  locked: "Locked",
};

export const JOURNEY_WORLDS: JourneyWorld[] = [
  { id: 1, name: "Waste Investigator", icon: "♻️", tagline: "Examine what we throw away and how our bins work.", missionIds: [1, 2, 3] },
  { id: 2, name: "Resource Detective", icon: "💧", tagline: "Follow resources like water and energy from source to sink.", missionIds: [4, 5, 6] },
  { id: 3, name: "Sustainability Researcher", icon: "🔬", tagline: "Turn curiosity into evidence with your first investigations.", missionIds: [7, 8, 9] },
  { id: 4, name: "Earth Communicator", icon: "🗣️", tagline: "Share what you learned with real people and test your voice.", missionIds: [10, 11, 12] },
  { id: 5, name: "Young Changemaker", icon: "🌱", tagline: "Choose a real problem, find real help, and take a small action.", missionIds: [13, 14, 15] },
];

export const WORLD_BY_NAME = new Map(JOURNEY_WORLDS.map((world) => [world.name, world]));

interface MissionSeed {
  id: number;
  title: string;
  world: string;
  emirate: string;
  points: number;
  estimatedMinutes: string;
}

const MISSION_SEEDS: MissionSeed[] = [
  // World 1 — Waste Investigator (Abu Dhabi start)
  { id: 1, title: "Waste Audit", world: "Waste Investigator", emirate: "Abu Dhabi", points: 30, estimatedMinutes: "15–20 minutes" },
  { id: 2, title: "Recycling Survey", world: "Waste Investigator", emirate: "Abu Dhabi", points: 30, estimatedMinutes: "15–20 minutes" },
  { id: 3, title: "Improve Our Bin", world: "Waste Investigator", emirate: "Abu Dhabi", points: 40, estimatedMinutes: "20–30 minutes" },
  // World 2 — Resource Detective (Dubai → Sharjah)
  { id: 4, title: "Resource Detective", world: "Resource Detective", emirate: "Dubai", points: 40, estimatedMinutes: "20–30 minutes" },
  { id: 5, title: "Interview an Expert", world: "Resource Detective", emirate: "Dubai", points: 40, estimatedMinutes: "20–30 minutes" },
  { id: 6, title: "Saving Plan", world: "Resource Detective", emirate: "Sharjah", points: 40, estimatedMinutes: "20–30 minutes" },
  // World 3 — Sustainability Researcher (Sharjah / Ajman / Umm Al Quwain)
  { id: 7, title: "Community Survey", world: "Sustainability Researcher", emirate: "Sharjah", points: 40, estimatedMinutes: "20–30 minutes" },
  { id: 8, title: "Simple Research", world: "Sustainability Researcher", emirate: "Ajman", points: 40, estimatedMinutes: "20–30 minutes" },
  { id: 9, title: "What We Found", world: "Sustainability Researcher", emirate: "Umm Al Quwain", points: 40, estimatedMinutes: "20–30 minutes" },
  // World 4 — Earth Communicator (Umm Al Quwain / Ras Al Khaimah)
  { id: 10, title: "Interview 2 People", world: "Earth Communicator", emirate: "Umm Al Quwain", points: 40, estimatedMinutes: "20–30 minutes" },
  { id: 11, title: "Awareness Campaign", world: "Earth Communicator", emirate: "Ras Al Khaimah", points: 50, estimatedMinutes: "30–45 minutes" },
  { id: 12, title: "Test Your Message", world: "Earth Communicator", emirate: "Ras Al Khaimah", points: 50, estimatedMinutes: "30–45 minutes" },
  // World 5 — Young Changemaker (Fujairah, the eastern final chapter)
  { id: 13, title: "Choose a Real Problem", world: "Young Changemaker", emirate: "Fujairah", points: 50, estimatedMinutes: "20–30 minutes" },
  { id: 14, title: "Talk to Someone Who Can Help", world: "Young Changemaker", emirate: "Fujairah", points: 50, estimatedMinutes: "20–30 minutes" },
  { id: 15, title: "Small Action Challenge", world: "Young Changemaker", emirate: "Fujairah", points: 60, estimatedMinutes: "30–45 minutes" },
];

/** Base mission metadata with coordinates + world id resolved (status filled in later). */
export const EARTH_JOURNEY_MISSIONS: Omit<MapMission, "status">[] = MISSION_SEEDS.map((seed) => {
  const coordinate = MISSION_COORDINATES[seed.id];
  return {
    id: seed.id,
    title: seed.title,
    world: seed.world,
    worldId: WORLD_BY_NAME.get(seed.world)?.id ?? 0,
    emirate: seed.emirate,
    x: coordinate?.x ?? JOURNEY_MAP_VIEWBOX.width / 2,
    y: coordinate?.y ?? JOURNEY_MAP_VIEWBOX.height / 2,
    points: seed.points,
    estimatedMinutes: seed.estimatedMinutes,
  };
});

/**
 * The progression rule: a mission is `completed` if it sits inside the
 * completed ids, `current` when it is the explicit current mission, and
 * `locked` otherwise. Missions can only become completed through teacher
 * approval upstream — never from a frontend click.
 */
export const getMissionStatus = (
  missionId: number,
  completedMissionIds: number[],
  currentMissionId: number,
): MissionStatus => {
  if (completedMissionIds.includes(missionId)) return "completed";
  if (missionId === currentMissionId) return "current";
  return "locked";
};

export function resolveWorldName(worldName: string): JourneyWorld {
  return WORLD_BY_NAME.get(worldName) ?? { id: 0, name: worldName, icon: "🌍", tagline: "", missionIds: [] };
}

/** All missions belonging to a world id, in mission order. */
export function missionsForWorld(missions: MapMission[], worldId: number): MapMission[] {
  return missions.filter((mission) => mission.worldId === worldId);
}