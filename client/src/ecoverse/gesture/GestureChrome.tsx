import { useEffect, useRef } from "react";
import { Hand, Loader2, ShieldCheck, VideoOff } from "lucide-react";
import { useI18n } from "../i18n";
import { useEcoGesture } from "./GestureProvider";
import { useGestureState } from "./useGesture";
import { gestureStore } from "./store";
import { gestureTargetProps } from "./useGesture";

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

/** Camera preview + landmark overlay. Landmark drawing is dev-mode only. */
function CameraFeed() {
  const { videoRef, attachVideo } = useEcoGesture();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { active, landmarks, showLandmarks } = useGestureState();
  const { d } = useI18n();

  // The preview element only exists once `active` is set, which happens inside
  // start(). Attaching here is what actually binds the camera stream to the
  // <video> the detection loop samples from.
  useEffect(() => {
    const video = videoRef.current;
    if (active && video) attachVideo(video);
  }, [active, attachVideo, videoRef]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !showLandmarks) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (!video.videoWidth) {
        requestAnimationFrame(draw);
        return;
      }
      if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
      if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (landmarks.length) {
        ctx.strokeStyle = "oklch(0.86 0.13 191 / 0.85)";
        ctx.lineWidth = Math.max(1.5, canvas.width / 320);
        ctx.beginPath();
        for (const [a, b] of CONNECTIONS) {
          const from = landmarks[a];
          const to = landmarks[b];
          if (!from || !to) continue;
          ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
          ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
        }
        ctx.stroke();
        ctx.fillStyle = "oklch(0.83 0.15 152)";
        for (const point of landmarks) {
          ctx.beginPath();
          ctx.arc(point.x * canvas.width, point.y * canvas.height, Math.max(2, canvas.width / 260), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }, [active, landmarks, showLandmarks, videoRef]);

  if (!active) return null;
  return (
    <div className="ev-cam">
      <div className="ev-cam__feed">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          aria-label={d.hero.gesture.preview}
        />
        {showLandmarks && <canvas ref={canvasRef} aria-hidden="true" />}
      </div>
    </div>
  );
}

export default function GestureChrome() {
  const { d } = useI18n();
  const { stop } = useEcoGesture();
  const state = useGestureState();

  if (!state.active) return null;

  const statusLabel =
    state.status === "loading"
      ? d.hero.gesture.loading
      : state.status === "requesting"
        ? d.hero.gesture.loading
        : state.handDetected
          ? d.hero.gesture.active
          : d.hero.gesture.noHand;

  const tone =
    state.status === "denied" || state.status === "error" || state.status === "unsupported"
      ? "var(--color-ev-coral)"
      : state.handDetected
        ? "var(--color-ev-emerald-lit)"
        : "var(--color-ev-amber)";

  return (
    <>
      <CameraFeed />

      <p className="ev-gesture-status" role="status" aria-live="polite">
        <span className="ev-dot" style={{ color: tone }} aria-hidden="true" />
        <span className="ev-sr-only">{d.hero.gesture.statusLabel}: </span>
        {state.status === "loading" ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : null}
        {statusLabel}
        {state.handDetected ? <span aria-hidden="true">✓</span> : null}
        <button
          type="button"
          onClick={stop}
          data-gesture-target="gesture-exit"
          className="ms-1 rounded-full border border-white/20 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-widest text-white/80 hover:bg-white/10"
        >
          {d.hero.gesture.exit}
        </button>
      </p>

      <aside className="ev-gesture-panel ev-panel" aria-label={d.hero.gesture.title}>
        <div className="flex items-center gap-2">
          <Hand size={16} style={{ color: "var(--color-ev-aqua)" }} aria-hidden="true" />
          <p className="ev-kicker">{d.hero.gesture.title}</p>
        </div>

        <ul className="grid gap-1.5">
          {d.hero.gesture.gestures.map((gesture) => (
            <li key={gesture.name} className="flex gap-2 text-xs leading-relaxed text-ev-mist">
              <b className="min-w-14 shrink-0 font-[family-name:var(--font-display)] text-ev-chalk">
                {gesture.name}
              </b>
              <span>{gesture.desc}</span>
            </li>
          ))}
        </ul>

        <p className="flex gap-2 rounded-xl border border-white/10 bg-black/25 p-2.5 text-[0.68rem] leading-relaxed text-ev-mist">
          <ShieldCheck size={14} className="mt-px shrink-0 text-ev-emerald-lit" aria-hidden="true" />
          <span>
            {d.hero.gesture.privacy}
            <br />
            <span className="text-ev-haze">{d.hero.gesture.localOnly}</span>
          </span>
        </p>

        {(state.status === "denied" || state.status === "error" || state.status === "unsupported") && (
          <p className="flex gap-2 rounded-xl border border-ev-coral/40 bg-ev-coral/10 p-2.5 text-[0.7rem] leading-relaxed">
            <VideoOff size={14} className="mt-px shrink-0 text-ev-coral" aria-hidden="true" />
            <span>
              {state.status === "denied" ? d.hero.gesture.denied : d.hero.gesture.unsupported}
              <br />
              <span className="text-ev-haze">{d.hero.gesture.fallback}</span>
            </span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={stop}
            {...gestureTargetProps("gesture-exit-panel")}
            className="ev-btn ev-btn--ghost ev-btn--sm"
          >
            {d.hero.gesture.exit}
          </button>
          {import.meta.env.DEV && (
            <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-ev-haze">
              <input
                type="checkbox"
                checked={state.showLandmarks}
                onChange={(event) => gestureStore.setState({ showLandmarks: event.target.checked })}
                className="h-3 w-3 accent-ev-aqua"
              />
              {d.hero.gesture.debug}
            </label>
          )}
        </div>
      </aside>
    </>
  );
}
