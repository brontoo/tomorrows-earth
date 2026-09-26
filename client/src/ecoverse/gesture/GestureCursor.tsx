import { useGestureState } from "./useGesture";

/**
 * Soft circular reticle driven by the hand-tracking store. Purely decorative
 * — it never intercepts pointer events, so mouse control is never blocked.
 */
export default function GestureCursor() {
  const { active, handDetected, cursorX, cursorY, isPinching, hoverId } = useGestureState();
  if (!active) return null;

  return (
    <div
      className="ev-gesture-cursor"
      data-pinch={isPinching}
      data-target={Boolean(hoverId)}
      style={{ transform: `translate3d(${cursorX}px, ${cursorY}px, 0)` }}
      aria-hidden="true"
    >
      <span className="ev-gesture-cursor__core" />
    </div>
  );
}
