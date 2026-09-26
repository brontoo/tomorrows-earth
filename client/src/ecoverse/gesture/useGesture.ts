import { useEffect, useState } from "react";
import { gestureStore, type GestureSnapshot } from "./store";

/** Subscribe a component to the gesture store. */
export function useGestureState(): GestureSnapshot {
  const [state, setState] = useState<GestureSnapshot>(() => gestureStore.getState());
  useEffect(() => gestureStore.subscribe(setState), []);
  return state;
}

/** True when the gesture cursor is currently over the element with this id. */
export function useGestureHover(id: string): boolean {
  const { hoverId, active } = useGestureState();
  return active && hoverId === id;
}

/**
 * Spread onto any element that should respond to a gesture pinch.
 * Pinch dispatches a real `click`, so the element's own onClick runs — one
 * code path shared with mouse, touch and keyboard.
 */
export function gestureTargetProps(id: string) {
  return { "data-gesture-target": id } as const;
}
