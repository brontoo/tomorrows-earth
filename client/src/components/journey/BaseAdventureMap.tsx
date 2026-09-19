import { useState } from "react";
import { BASE_MAP_IMAGE_SRC } from "@/data/journeyMapLayout";

/**
 * Renders the locked, approved UAE adventure map artwork as the base visual layer.
 * This component MUST NOT redraw, recreate, or approximate the artwork — it only
 * displays the real image file. If the file is missing (e.g. in a fresh checkout
 * before the asset has been added), it shows an honest placeholder instructing
 * where to put it, instead of silently failing or faking a map.
 */
export default function BaseAdventureMap({ onNaturalSize }: { onNaturalSize?: (size: { width: number; height: number }) => void }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label="UAE adventure map placeholder — image asset missing"
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-muted/40 p-10 text-center"
      >
        <p className="text-lg font-bold text-foreground">Adventure map artwork not found</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Add the approved image file at <code className="rounded bg-muted px-1.5 py-0.5">client/public/maps/uae-adventure-map.png</code> to
          render the Earth Journey Map. This placeholder never substitutes for the real artwork.
        </p>
      </div>
    );
  }

  return (
    <img
      src={BASE_MAP_IMAGE_SRC}
      alt="Illustrated UAE adventure map showing the sustainability journey across the seven emirates"
      className="block w-full select-none"
      draggable={false}
      onError={() => setFailed(true)}
      onLoad={(event) => {
        const img = event.currentTarget;
        onNaturalSize?.({ width: img.naturalWidth, height: img.naturalHeight });
      }}
    />
  );
}
