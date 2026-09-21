import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  EARTH_JOURNEY_MISSIONS,
  getMissionStatus,
  type MapMission,
  type MissionStatus,
} from "@/data/earthJourneyMap";

export interface EarthJourneyProgress {
  /** All 15 missions with dynamic statuses applied. */
  missions: MapMission[];
  currentMission: MapMission | null;
  completedCount: number;
  totalCount: number;
  /** Verified Sustainability Points straight from the backend. */
  totalPoints: number;
  levelName: string;
  levelIcon: string;
  /** True when the signed-in user is a student. */
  studentView: boolean;
  isLoading: boolean;
}

/** Statuses that count as a teacher-approved completion on the map. */
const APPROVED_STATUSES = new Set(["completed", "verified"]);

/**
 * Derives the journey map state from real backend data — never from hardcoded
 * values. The backend stores one mission per sustainability zone; the map
 * presents those approved milestones as a 15-stage adventure. Stage `n` is
 * unlocked only when `n-1` real missions have been teacher-approved, so the
 * rule "previous mission approved → next mission unlocked" holds and nothing
 * is ever granted from the frontend.
 */
export function useEarthJourneyProgress(): EarthJourneyProgress {
  const { user } = useAuthContext();
  const isStudent = user?.role === "student";

  const completionsQuery = trpc.missionCompletions.getAllMine.useQuery(undefined, {
    enabled: isStudent,
  });
  const passportQuery = trpc.passport.getMine.useQuery(undefined, {
    enabled: isStudent,
  });

  return useMemo<EarthJourneyProgress>(() => {
    const totalCount = EARTH_JOURNEY_MISSIONS.length;

    const approvedCount = (completionsQuery.data ?? []).filter((completion) =>
      APPROVED_STATUSES.has(completion.status),
    ).length;
    const completedCount = Math.min(approvedCount, totalCount);
    const currentMissionId =
      completedCount >= totalCount ? totalCount : completedCount + 1;
    const completedMissionIds = EARTH_JOURNEY_MISSIONS.slice(0, completedCount).map((mission) => mission.id);

    const missions: MapMission[] = EARTH_JOURNEY_MISSIONS.map((mission) => ({
      ...mission,
      status: getMissionStatus(mission.id, completedMissionIds, currentMissionId),
    }));

    const totalPoints = passportQuery.data?.totalPoints ?? 0;
    const levelName = passportQuery.data?.currentLevel?.name ?? "Eco Scout";
    const levelIcon = passportQuery.data?.currentLevel?.icon ?? "🌍";

    return {
      missions,
      currentMission: missions.find((mission) => mission.status === "current") ?? null,
      completedCount,
      totalCount,
      totalPoints,
      levelName,
      levelIcon,
      studentView: isStudent,
      isLoading: completionsQuery.isLoading || passportQuery.isLoading,
    };
  }, [completionsQuery.data, passportQuery.data, isStudent, completionsQuery.isLoading, passportQuery.isLoading]);
}

export type { MissionStatus };