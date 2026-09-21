import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useEarthJourneyProgress } from "@/lib/useEarthJourneyProgress";
import type { MapMission } from "@/data/earthJourneyMap";
import AdventureMapViewport from "@/components/missions-map/AdventureMapViewport";
import CurrentMissionCard from "@/components/missions-map/CurrentMissionCard";
import JourneyHeader from "@/components/missions-map/JourneyHeader";
import LockedMissionToast from "@/components/missions-map/LockedMissionToast";
import MissionDetailPanel from "@/components/missions-map/MissionDetailPanel";

/**
 * Missions — Earth Journey map.
 *
 * A gamified, full-screen mission map built from the original UAE adventure
 * artwork. The artwork is layer 1 (unchanged image); everything interactive
 * (nodes, route, world labels) lives in transparent SVG overlays. Student
 * progress, points, and levels all come from the existing tRPC data layer.
 * Replaces the old missions list as the main missions hub; the real mission
 * cards remain available at /missions/list. Route: /missions.
 */
export default function MissionsMapPage() {
  const {
    missions,
    currentMission,
    totalPoints,
    studentView,
    isLoading,
  } = useEarthJourneyProgress();

  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<MapMission | null>(null);
  const [locked, setLocked] = useState<{ mission: MapMission; required: MapMission } | null>(null);

  useEffect(() => {
    if (!locked) return;
    const timer = window.setTimeout(() => setLocked(null), 3200);
    return () => window.clearTimeout(timer);
  }, [locked]);

  const handleSelect = (mission: MapMission) => setSelected(mission);

  const handleLocked = (mission: MapMission) => {
    const index = missions.findIndex((entry) => entry.id === mission.id);
    const required = missions[Math.max(0, index - 1)];
    if (required && required.id !== mission.id) {
      setLocked({ mission, required });
    }
  };

  const handleContinue = () => navigate("/missions/list");

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-slate-950">
      {/* The hero: adventure map + interactive overlay */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
          </div>
        ) : (
          <>
            <AdventureMapViewport missions={missions} onSelect={handleSelect} onLocked={handleLocked} />
            <JourneyHeader totalPoints={totalPoints} studentView={studentView} />
            {currentMission && (
              <CurrentMissionCard
                mission={currentMission}
                onContinue={handleContinue}
              />
            )}
            {locked && (
              <LockedMissionToast
                missionTitle={locked.mission.title}
                requiredMissionTitle={locked.required.title}
                requiredMissionId={locked.required.id}
                visible
              />
            )}
          </>
        )}
      </div>

      {selected && <MissionDetailPanel mission={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}