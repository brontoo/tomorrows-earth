import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { GestureController } from "./controller";
import { isGestureSupported } from "./store";
import { useGestureState } from "./useGesture";

const TUTORIAL_KEY = "ecoverse.gesture.tutorial";

type GestureContextValue = {
  start: () => Promise<boolean>;
  stop: () => void;
  supported: boolean;
  /**
   * Hands the controller the mounted <video>. The camera preview only exists
   * while tracking is active, so this has to be called from the preview itself
   * on mount — asking the provider for the ref during `start()` always yields
   * null, because the element is created by the state change `start()` causes.
   */
  attachVideo: (video: HTMLVideoElement) => void;
  /** False the very first time — drives the 3-step onboarding. */
  needsTutorial: boolean;
  completeTutorial: (skipped: boolean) => void;
  practiceDone: boolean;
  setPracticeDone: (done: boolean) => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Open-palm rising edge subscription. */
  onPalm: (listener: () => void) => () => void;
};

const GestureContext = createContext<GestureContextValue | null>(null);

export function EcoGestureProvider({ children }: { children: ReactNode }) {
  const controllerRef = useRef<GestureController | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsTutorial, setNeedsTutorial] = useState(false);
  const [practiceDone, setPracticeDone] = useState(false);
  const state = useGestureState();
  const supported = useMemo(() => isGestureSupported(), []);

  useEffect(() => {
    controllerRef.current = new GestureController();
    let seen = false;
    try {
      seen = window.localStorage.getItem(TUTORIAL_KEY) === "done";
    } catch {
      /* ignore */
    }
    setNeedsTutorial(!seen);
    return () => {
      controllerRef.current?.stop();
    };
  }, []);

  const start = useCallback(async () => {
    const controller = controllerRef.current;
    if (!controller) return false;
    // Fast path: if a preview is already mounted (re-entry), hand it over now.
    const video = videoRef.current;
    if (video) controller.attachVideo(video);
    return controller.start();
  }, []);

  const attachVideo = useCallback((video: HTMLVideoElement) => {
    controllerRef.current?.attachVideo(video);
  }, []);

  const stop = useCallback(() => {
    controllerRef.current?.stop();
  }, []);

  const completeTutorial = useCallback((skipped: boolean) => {
    try {
      window.localStorage.setItem(TUTORIAL_KEY, "done");
    } catch {
      /* ignore */
    }
    setNeedsTutorial(false);
    if (skipped) stop();
  }, [stop]);

  const onPalm = useCallback((listener: () => void) => {
    return controllerRef.current?.onPalm(listener) ?? (() => {});
  }, []);

  // The camera indicator drives a body attribute so any stylesheet can react.
  useEffect(() => {
    const root = document.getElementById("ecoverse-root");
    if (!root) return;
    if (state.active) root.setAttribute("data-gesture", "active");
    else root.removeAttribute("data-gesture");
  }, [state.active]);

  const value = useMemo<GestureContextValue>(
    () => ({ start, stop, attachVideo, supported, needsTutorial, completeTutorial, practiceDone, setPracticeDone, videoRef, onPalm }),
    [attachVideo, completeTutorial, needsTutorial, onPalm, practiceDone, start, stop, supported],
  );

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>;
}

export function useEcoGesture(): GestureContextValue {
  const ctx = useContext(GestureContext);
  if (!ctx) throw new Error("useEcoGesture must be used inside EcoGestureProvider");
  return ctx;
}
