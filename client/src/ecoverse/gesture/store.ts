/**
 * Gesture state store — deliberately framework-agnostic.
 *
 * Components never import the hand-tracking library and never talk to
 * MediaPipe. They read from this store (or via `useGesture*` hooks) so the
 * tracking implementation can be swapped or removed without touching the UI.
 */

export type GestureStatus =
  | "idle"
  | "requesting"
  | "loading"
  | "tracking"
  | "unsupported"
  | "denied"
  | "error";

export type GestureSnapshot = {
  /** Gesture Mode engaged by the student. */
  active: boolean;
  status: GestureStatus;
  error: string | null;
  /** A hand is currently visible in frame. */
  handDetected: boolean;
  /** Viewport pixel coordinates of the gesture cursor. */
  cursorX: number;
  cursorY: number;
  /** Normalised 0–1 coordinates, independent of viewport size. */
  normalizedX: number;
  normalizedY: number;
  isPinching: boolean;
  openPalm: boolean;
  /** Index finger only — used for the "point to highlight" affordance. */
  pointing: boolean;
  confidence: number;
  fps: number;
  /** Developer-only landmark overlay. */
  showLandmarks: boolean;
  /** `data-gesture-id` of the element under the cursor, if any. */
  hoverId: string | null;
  /**
   * Raw hand landmarks. Only ever populated while `showLandmarks` is on
   * (developer debug mode) — this is the single place landmark data exists.
   */
  landmarks: { x: number; y: number }[];
};

const initial: GestureSnapshot = {
  active: false,
  status: "idle",
  error: null,
  handDetected: false,
  cursorX: 0,
  cursorY: 0,
  normalizedX: 0.5,
  normalizedY: 0.5,
  isPinching: false,
  openPalm: false,
  pointing: false,
  confidence: 0,
  fps: 0,
  showLandmarks: false,
  hoverId: null,
  landmarks: [],
};

let snapshot: GestureSnapshot = initial;
const listeners = new Set<(s: GestureSnapshot) => void>();

function emit() {
  listeners.forEach((listener) => listener(snapshot));
}

export const gestureStore = {
  getState: (): GestureSnapshot => snapshot,
  setState(patch: Partial<GestureSnapshot>) {
    const next = { ...snapshot, ...patch };
    // Skip no-op writes so we don't thrash subscribers at 60fps.
    const changed = (Object.keys(patch) as (keyof GestureSnapshot)[]).some(
      (key) => next[key] !== snapshot[key],
    );
    if (!changed) return;
    snapshot = next;
    emit();
  },
  reset() {
    snapshot = { ...initial, showLandmarks: snapshot.showLandmarks };
    emit();
  },
  subscribe(listener: (s: GestureSnapshot) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** True when the browser can plausibly provide a camera stream. */
export function isGestureSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  return window.isSecureContext || window.location.hostname === "localhost";
}
