import { BASE_MAP_IMAGE_SRC } from "@/data/earthJourneyMap";

/**
 * Layer 1 — the immutable base map, pinned to the bottom of the map container
 * (absolute inset-0, object-fit cover). This component MUST NOT redraw,
 * recreate, or approximate the artwork. Every layer above this one is a
 * transparent SVG/React overlay; the image itself is never modified.
 */
export default function BaseAdventureMap() {
  return (
    <img
      src={BASE_MAP_IMAGE_SRC}
      alt="Tomorrow's Earth UAE Adventure Map"
      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      draggable={false}
    />
  );
}