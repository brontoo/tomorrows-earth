import { AlertTriangle, Hand, ShieldCheck } from "lucide-react";
import { useI18n } from "../../i18n";
import { useEcoGesture } from "../../gesture/GestureProvider";
import { useGestureState, gestureTargetProps } from "../../gesture/useGesture";
import { cn } from "../../lib/utils";

/**
 * Optional hand controls. The camera is only requested from this button —
 * nothing on the page can turn it on, and declining leaves every other
 * control untouched.
 */
export default function GestureGate() {
  const { d } = useI18n();
  const { start, stop, supported } = useEcoGesture();
  const state = useGestureState();

  // The store is the single source of truth for the attempt, so a declined
  // permission or a model that fails to load is reported instead of leaving a
  // button that silently does nothing.
  const starting = state.status === "requesting" || state.status === "loading";
  const problem =
    state.status === "denied"
      ? d.hero.gesture.denied
      : state.status === "error"
        ? d.hero.gesture.error
        : null;

  if (state.active) {
    return (
      <button
        type="button"
        onClick={stop}
        {...gestureTargetProps("gesture-toggle")}
        className="ev-btn ev-btn--ghost ev-btn--sm"
      >
        <Hand size={14} aria-hidden="true" />
        {d.hero.gesture.exit}
      </button>
    );
  }

  if (!supported) {
    return (
      <p className="max-w-xs text-center text-[0.7rem] leading-relaxed text-ev-haze">
        {d.hero.gesture.unsupported} {d.hero.gesture.fallback}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => void start()}
        disabled={starting}
        {...gestureTargetProps("gesture-toggle")}
        className={cn("ev-btn ev-btn--ghost ev-btn--sm", starting && "opacity-60")}
        aria-describedby="gesture-privacy"
      >
        <Hand size={14} aria-hidden="true" />
        {starting ? d.hero.gesture.loading : d.hero.gesture.activate}
      </button>
      <p
        id="gesture-privacy"
        className="flex max-w-md items-start gap-1.5 text-center text-[0.66rem] leading-relaxed text-ev-haze"
      >
        <ShieldCheck size={12} className="mt-px shrink-0 text-ev-emerald-lit" aria-hidden="true" />
        <span>{d.hero.gesture.privacy}</span>
      </p>
      {/* Announced politely rather than as an alert: nothing is broken, the
          optional mode simply did not start and pointer input still works. */}
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "flex max-w-md items-start gap-1.5 text-center text-[0.66rem] leading-relaxed",
          problem ? "text-ev-amber-lit" : "sr-only",
        )}
      >
        {problem && (
          <>
            <AlertTriangle size={12} className="mt-px shrink-0" aria-hidden="true" />
            <span>
              {problem} {d.hero.gesture.fallback}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
