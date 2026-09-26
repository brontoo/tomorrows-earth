import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Hand } from "lucide-react";
import { useI18n } from "../i18n";
import { useEcoGesture } from "./GestureProvider";
import { useGestureState } from "./useGesture";

/**
 * First-run onboarding. Three steps, then a practice target that must be
 * successfully selected before the student continues. Skipping is always
 * available and simply turns Gesture Mode off again.
 */
export default function GestureTutorial() {
  const { d } = useI18n();
  const { completeTutorial, needsTutorial, setPracticeDone, onPalm } = useEcoGesture();
  const { active, handDetected, isPinching, status } = useGestureState();
  const [step, setStep] = useState(0);
  const [practice, setPractice] = useState<"idle" | "active" | "passed">("idle");

  const total = d.hero.tutorial.steps.length;

  // An open palm steps forward — the same gesture advertised in step one.
  useEffect(() => onPalm(() => {
    setPractice((current) => {
      if (current !== "idle") return current;
      if (handDetected) return "passed";
      return current;
    });
  }), [handDetected, onPalm]);

  useEffect(() => {
    if (practice === "passed") setPracticeDone(true);
  }, [practice, setPracticeDone]);

  return (
    <AnimatePresence>
      {active && needsTutorial && (
        <motion.div
          className="ev-gesture-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={d.hero.tutorial.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="ev-gesture-overlay__card ev-panel"
            initial={{ scale: 0.94, y: 18 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-ev-line-strong bg-ev-aqua/10">
                <Hand size={18} className="text-ev-aqua" aria-hidden="true" />
              </span>
              <div>
                <p className="ev-kicker">{d.hero.tutorial.title}</p>
                <p className="text-xs text-ev-haze">
                  {step < total ? `${step + 1} / ${total}` : "✓"}
                </p>
              </div>
            </div>

            {step < total ? (
              <div key={step}>
                <h2 className="ev-h2 !mt-0 !text-2xl">{d.hero.tutorial.steps[step].title}</h2>
                <p className="ev-lead !mt-3 !text-base">{d.hero.tutorial.steps[step].body}</p>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setStep(step + 1)} className="ev-btn">
                    {step === total - 1 ? d.hero.tutorial.tryIt : d.hero.tutorial.continue}
                  </button>
                  <button type="button" onClick={() => completeTutorial(true)} className="ev-btn ev-btn--ghost ev-btn--sm">
                    {d.hero.tutorial.skip}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm leading-relaxed text-ev-mist">
                  {practice === "passed" ? d.hero.tutorial.practiceDone : d.hero.tutorial.practice}
                </p>

                <button
                  type="button"
                  data-gesture-target="gesture-practice"
                  onClick={() => setPractice("passed")}
                  className="mt-5 grid h-28 w-full place-items-center rounded-2xl border-2 border-dashed border-ev-aqua/60 bg-ev-aqua/8 transition hover:bg-ev-aqua/15"
                >
                  {practice === "passed" ? (
                    <span className="flex items-center gap-2 text-sm font-bold text-ev-emerald-lit">
                      <Check size={18} aria-hidden="true" /> {d.hero.tutorial.practiceDone}
                    </span>
                  ) : (
                    <span className="ev-kicker">{d.hero.tutorial.practiceLabel}</span>
                  )}
                </button>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => completeTutorial(false)}
                    disabled={practice !== "passed"}
                    className="ev-btn disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {d.hero.tutorial.continue}
                  </button>
                  <button type="button" onClick={() => completeTutorial(true)} className="ev-btn ev-btn--ghost ev-btn--sm">
                    {d.hero.tutorial.skip}
                  </button>
                  <span className="ms-auto text-[0.68rem] text-ev-haze" role="status" aria-live="polite">
                    {status === "loading"
                      ? d.hero.gesture.loading
                      : handDetected
                        ? isPinching
                          ? "PINCH ✓"
                          : d.hero.gesture.active
                        : d.hero.gesture.noHand}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
