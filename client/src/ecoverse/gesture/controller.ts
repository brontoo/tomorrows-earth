import { gestureStore, isGestureSupported, type GestureStatus } from "./store";

/**
 * Hand tracking engine.
 *
 * Privacy contract:
 *  - The camera is only ever requested from `start()`, which is only called
 *    from an explicit student action.
 *  - Frames are analysed in-page. Nothing is recorded, buffered or uploaded.
 *  - The wasm runtime and the model are both self-hosted (`/mediapipe/…`),
 *    so tracking works with no third-party network calls at all.
 *  - `stop()` halts every media track immediately.
 */

const WASM_PATH = "/mediapipe/wasm";
const MODEL_PATH = "/mediapipe/hand_landmarker.task";

/** Pinch closes below this palm-relative distance and opens above the release gap. */
const PINCH_ON = 0.42;
const PINCH_OFF = 0.56;

type Landmark = { x: number; y: number; z: number };
type HandLandmarkerLike = {
  detectForVideo(video: HTMLVideoElement, timestamp: number): {
    landmarks?: Landmark[][];
    handedness?: { categoryName?: string; score?: number }[][];
  };
  close(): void;
};

function distance(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class GestureController {
  private video: HTMLVideoElement | null = null;
  private landmarker: HandLandmarkerLike | null = null;
  private stream: MediaStream | null = null;
  private frame = 0;
  private running = false;
  private frameTimes: number[] = [];

  /** Latest resolved target, re-evaluated on every frame. */
  private hoverId: string | null = null;

  attachVideo(video: HTMLVideoElement) {
    this.video = video;
    if (this.stream) video.srcObject = this.stream;
  }

  private setStatus(status: GestureStatus, error: string | null = null) {
    gestureStore.setState({ status, error });
  }

  async start(): Promise<boolean> {
    if (this.running) return true;

    if (!isGestureSupported()) {
      this.setStatus("unsupported");
      return false;
    }

    this.setStatus("requesting");
    gestureStore.setState({ active: true, handDetected: false, isPinching: false, openPalm: false, confidence: 0, hoverId: null });

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      this.setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
      gestureStore.setState({ active: false });
      return false;
    }

    if (this.video) this.video.srcObject = this.stream;

    this.setStatus("loading");
    try {
      const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      this.landmarker = (await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      })) as unknown as HandLandmarkerLike;
    } catch {
      this.stop();
      this.setStatus("error");
      return false;
    }

    this.running = true;
    this.setStatus("tracking");
    this.loop();
    return true;
  }

  stop() {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;

    // Release the camera immediately.
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.video) this.video.srcObject = null;

    this.landmarker?.close();
    this.landmarker = null;

    this.prevPinch = false;
    this.prevPalm = false;
    this.hoverId = null;
    gestureStore.setState({
      active: false,
      status: "idle",
      error: null,
      handDetected: false,
      isPinching: false,
      openPalm: false,
      confidence: 0,
      hoverId: null,
      landmarks: [],
      fps: 0,
    });
  }

  private loop = () => {
    if (!this.running || !this.landmarker || !this.video) return;
    const video = this.video;
    if (video.readyState < 2) {
      this.frame = requestAnimationFrame(this.loop);
      return;
    }

    const now = performance.now();
    const result = this.landmarker.detectForVideo(video, now);
    const hand = result.landmarks?.[0];

    if (!hand) {
      this.hoverId = null;
      this.prevPinch = false;
      this.prevPalm = false;
      gestureStore.setState({
        handDetected: false,
        isPinching: false,
        openPalm: false,
        pointing: false,
        confidence: 0,
        hoverId: null,
        landmarks: [],
      });
      this.frame = requestAnimationFrame(this.loop);
      return;
    }

    const indexTip = hand[8];
    const thumbTip = hand[4];
    const middleMcp = hand[9];
    const wrist = hand[0];

    // Scale thresholds by hand size so they work near and far from the camera.
    const palmSpan = Math.max(distance(wrist, middleMcp), 0.04);
    const pinchRatio = distance(thumbTip, indexTip) / palmSpan;

    const extended = [8, 12, 16, 20].filter((tip) => hand[tip].y < hand[tip - 2].y).length;
    const openPalm = extended >= 4;
    const pointing = extended === 1;

    // Pinch uses hysteresis so a trembling grip does not chatter.
    const isPinching = this.prevPinch ? pinchRatio < PINCH_OFF : pinchRatio < PINCH_ON;
    const pinchStarted = isPinching && !this.prevPinch;
    const palmStarted = openPalm && !this.prevPalm;
    this.prevPinch = isPinching;
    this.prevPalm = openPalm;

    // The preview is mirrored, so mirror x to keep the cursor 1:1 with the hand.
    const normalizedX = 1 - indexTip.x;
    const normalizedY = indexTip.y;
    const cursorX = normalizedX * window.innerWidth;
    const cursorY = normalizedY * window.innerHeight;

    const hoverId = this.resolveTarget(cursorX, cursorY);
    this.hoverId = hoverId;
    this.trackFps(now);

    gestureStore.setState({
      handDetected: true,
      cursorX,
      cursorY,
      normalizedX,
      normalizedY,
      isPinching,
      openPalm,
      pointing,
      confidence: result.handedness?.[0]?.[0]?.score ?? 0,
      hoverId,
      landmarks: gestureStore.getState().showLandmarks
        ? hand.map((l) => ({ x: l.x, y: l.y }))
        : [],
    });

    // Rising edge of a pinch selects whatever is under the cursor. We dispatch a
    // real click so gesture, mouse, touch and keyboard all share one code path.
    if (pinchStarted) this.select(cursorX, cursorY);
    if (palmStarted) {
      this.lastEvent = "palm";
      this.palmListeners.forEach((fn) => fn());
    }

    this.frame = requestAnimationFrame(this.loop);
  };

  private prevPinch = false;
  private prevPalm = false;
  private lastEvent: "palm" | null = null;
  private palmListeners = new Set<() => void>();

  /** Fires on the rising edge of an open palm. */
  onPalm(listener: () => void) {
    this.palmListeners.add(listener);
    return () => this.palmListeners.delete(listener);
  }

  getLastEvent() {
    return this.lastEvent;
  }

  private resolveTarget(x: number, y: number): string | null {
    if (typeof document === "undefined") return null;
    const el = document.elementFromPoint(x, y);
    const target = el?.closest<HTMLElement>("[data-gesture-target]");
    return target?.dataset.gestureTarget ?? null;
  }

  private select(x: number, y: number) {
    if (typeof document === "undefined") return;
    const el = document.elementFromPoint(x, y);
    const target = el?.closest<HTMLElement>("[data-gesture-target]");
    if (!target) return;
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    target.animate?.(
      [
        { boxShadow: "0 0 0 0 color-mix(in oklch, var(--color-ev-aqua) 70%, transparent)" },
        { boxShadow: "0 0 0 14px transparent" },
      ],
      { duration: 420, easing: "cubic-bezier(0.22,1,0.36,1)" },
    );
  }

  private trackFps(now: number) {
    this.frameTimes.push(now);
    while (this.frameTimes.length > 30) this.frameTimes.shift();
    if (this.frameTimes.length > 2) {
      const span = now - this.frameTimes[0];
      const fps = Math.round(((this.frameTimes.length - 1) / span) * 1000);
      gestureStore.setState({ fps });
    }
  }
}
