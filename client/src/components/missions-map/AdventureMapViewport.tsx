import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { MapMission } from "@/data/earthJourneyMap";
import { JOURNEY_MAP_VIEWBOX } from "@/data/missionCoordinates";
import BaseAdventureMap from "./BaseAdventureMap";
import EmiratesHitboxOverlay from "./EmiratesHitboxOverlay";
import FloatingMissionNode from "./FloatingMissionNode";
import JourneySvgOverlay from "./JourneySvgOverlay";

export interface AdventureMapViewportProps {
  missions: MapMission[];
  onSelect: (mission: MapMission) => void;
  onLocked: (mission: MapMission) => void;
}

interface InitialView {
  scale: number;
  x: number;
  y: number;
  centered: boolean;
}

/**
 * Layered, pinch-to-zoom mission map (mobile and desktop).
 *
 * Layer stack (bottom → top), all sized to the artwork's aspect ratio:
 *   1. BaseAdventureMap      — the clean base artwork (absolute, object-cover)
 *   2. EmiratesHitboxOverlay — inline SVG paths per emirate (hover/glow)
 *   3. JourneySvgOverlay     — route line + world labels + "YOU ARE HERE"
 *   4. FloatingMissionNode   — interactive mission markers (absolute DOM nodes)
 *
 * The base artwork keeps its exact aspect ratio and is sized to fill the
 * viewport's height (never shrunk into a tiny letterboxed image), so it stays
 * readable while every overlay shares the same coordinate space and all four
 * layers move as one.
 *
 * On desktop the whole map is shown (scale 1, centered). On mobile the view
 * starts zoomed in on the CURRENT mission (or the Abu Dhabi start for guests)
 * so players begin at the action, then pan/pinch to inspect the rest of the
 * UAE.
 */
export default function AdventureMapViewport({
  missions,
  onSelect,
  onLocked,
}: AdventureMapViewportProps) {
  const aspect = JOURNEY_MAP_VIEWBOX.width / JOURNEY_MAP_VIEWBOX.height;
  // Height-first sizing: the map always fills the viewport height (never a tiny
  // letterboxed image). On desktop the artwork happens to fit the width too and
  // centres; on mobile it pans at a readable, full-height size.
  const mapWidth = `calc(100dvh * ${aspect})`;
  const currentMission = missions.find((mission) => mission.status === "current") ?? null;

  const [initialView, setInitialView] = useState<InitialView | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768) {
      setInitialView({ scale: 1, x: 0, y: 0, centered: true });
      return;
    }
    // Mobile: zoom into the current mission's location so the map is readable.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mapHeightPx = vh;
    const mapWidthPx = mapHeightPx * aspect;
    const pixelsPerUnit = mapWidthPx / JOURNEY_MAP_VIEWBOX.width;
    const anchor = currentMission ?? missions[0];
    const targetX = anchor ? anchor.x * pixelsPerUnit : mapWidthPx / 2;
    const targetY = anchor ? anchor.y * pixelsPerUnit : mapHeightPx / 2;
    setInitialView({
      scale: 1.5,
      // Keep a little breathing room under the floating header/cards.
      x: vw / 2 - targetX,
      y: (vh - 96) / 2 - targetY,
      centered: false,
    });
  }, [currentMission?.id, missions, aspect]);

  if (!initialView) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <TransformWrapper
        initialScale={initialView.scale}
        initialPositionX={initialView.x}
        initialPositionY={initialView.y}
        centerOnInit={initialView.centered}
        minScale={1}
        maxScale={3}
        limitToBounds
        boundToElement
        panning={{ velocityDisabled: true }}
        wheel={{ step: 0.18 }}
        pinch={{ step: 6 }}
        doubleClick={{ mode: "toggle" }}
      >
        <TransformComponent
          wrapperClass="!h-full !w-full"
          contentClass="!h-full !w-full"
        >
          <div className="flex h-full w-full items-center justify-center">
            <div
              className="relative overflow-hidden"
              style={{
                width: mapWidth,
                aspectRatio: `${JOURNEY_MAP_VIEWBOX.width} / ${JOURNEY_MAP_VIEWBOX.height}`,
              }}
            >
              <BaseAdventureMap />
              <EmiratesHitboxOverlay />
              <JourneySvgOverlay missions={missions} />
              {missions.map((mission) => (
                <FloatingMissionNode
                  key={mission.id}
                  mission={mission}
                  onSelect={onSelect}
                  onLocked={onLocked}
                />
              ))}
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}