import { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { useAuthContext } from "@/contexts/AuthContext";
import { buildJourneyMapNodes, type JourneyMapNode } from "@/lib/journeyStatus";
import AdventureMapViewport from "@/components/journey/AdventureMapViewport";
import JourneyHeader from "@/components/journey/JourneyHeader";
import MissionDetailPanel from "@/components/journey/MissionDetailPanel";

export default function EarthJourneyPage() {
  const { user } = useAuthContext();
  const isStudent = user?.role === "student";
  const [selected, setSelected] = useState<JourneyMapNode | null>(null);

  const zonesQuery = trpc.zones.getAll.useQuery();
  const missionsQuery = trpc.missions.getAll.useQuery();
  const completionsQuery = trpc.missionCompletions.getAllMine.useQuery(undefined, { enabled: isStudent });
  const passportQuery = trpc.passport.getMine.useQuery(undefined, { enabled: isStudent });

  const nodes = useMemo(() => {
    if (!zonesQuery.data || !missionsQuery.data) return [];
    return buildJourneyMapNodes(zonesQuery.data, missionsQuery.data, completionsQuery.data ?? []);
  }, [zonesQuery.data, missionsQuery.data, completionsQuery.data]);

  const isLoading = zonesQuery.isLoading || missionsQuery.isLoading;
  const passport = passportQuery.data;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container px-4 pb-16 pt-8 md:px-6 md:pt-12">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Earth Journey Map</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-5xl">Your adventure across the Emirates</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Follow the path, complete missions, and unlock every region on the way to becoming an Earth Champion.
          </p>
        </div>

        {isLoading && (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl border border-border bg-muted/30">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && (
          <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-border bg-slate-100 shadow-xl">
            <JourneyHeader
              totalPoints={passport?.totalPoints ?? 0}
              levelName={passport?.currentLevel?.name ?? "Guest"}
              levelIcon={passport?.currentLevel?.icon ?? "🌍"}
              completedCount={nodes.filter((node) => node.status === "completed").length}
              totalCount={nodes.length}
            />
            <AdventureMapViewport nodes={nodes} onSelect={setSelected} />
          </div>
        )}

        {!isStudent && (
          <p className="mt-4 text-sm text-muted-foreground">
            Sign in as a student to track your own progress, points, and level on the map.
          </p>
        )}
      </main>

      {selected && <MissionDetailPanel node={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
