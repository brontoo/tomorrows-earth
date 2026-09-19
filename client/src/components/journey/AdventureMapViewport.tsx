import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState } from "react";
import BaseAdventureMap from "./BaseAdventureMap";
import JourneySvgOverlay from "./JourneySvgOverlay";
import type { JourneyMapNode } from "@/lib/journeyStatus";

/**
 * Composes the locked base artwork with the transparent interactive overlay,
 * and wraps everything in pinch/scroll/drag zoom-pan for mobile and desktop.
 */
export default function AdventureMapViewport({
  nodes,
  onSelect,
}: {
  nodes: JourneyMapNode[];
  onSelect: (node: JourneyMapNode) => void;
}) {
  const [, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  return (
    <TransformWrapper
      minScale={1}
      maxScale={4}
      initialScale={1}
      centerOnInit
      wheel={{ step: 0.15 }}
      doubleClick={{ mode: "toggle" }}
    >
      <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full">
        <div className="relative w-full">
          <BaseAdventureMap onNaturalSize={setNaturalSize} />
          <JourneySvgOverlay nodes={nodes} onSelect={onSelect} />
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
