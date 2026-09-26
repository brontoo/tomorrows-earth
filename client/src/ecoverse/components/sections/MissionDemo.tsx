import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, RotateCcw, Target, Timer, Zap } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";
import { WorldGlyph } from "../game/WorldGlyph";
import { gestureTargetProps } from "../../gesture/useGesture";

type Phase = "idle" | "accepted" | "done";

/** Simulated countdown — deliberately not a real deadline. */
function useDemoCountdown(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    setSeconds(0);
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return seconds;
}

export default function MissionDemo() {
  const { d } = useI18n();
  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState(0);
  const seconds = useDemoCountdown(phase === "accepted" || phase === "done");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const accept = () => {
    setPhase("accepted");
    setStage(0);
    // Walk the four demo stages, then land on the reward.
    [1400, 2900, 4400, 5900].forEach((delay, index) => {
      timers.current.push(
        window.setTimeout(() => {
          setStage(index + 1);
          if (index === 3) setPhase("done");
        }, delay),
      );
    });
  };

  const reset = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setPhase("idle");
    setStage(0);
  };

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <Section id="mission-demo" tone="deep">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.demo.code}
          title={d.demo.heading}
          lead={d.demo.subheading}
          align="center"
        />

        <Reveal className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* ---------------------------------------------------- the card */}
          <article className="ev-panel overflow-hidden">
            <header className="flex flex-wrap items-center gap-4 border-b border-ev-line p-6">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-lg">
                <WorldGlyph kind="waste" size={64} radius={0.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="ev-kicker">{d.demo.code}</p>
                <h3 className="ev-display mt-1 text-2xl text-ev-chalk sm:text-3xl">
                  {d.demo.title}
                </h3>
              </div>
              <span className="ev-tag" style={{ color: "var(--color-ev-amber)" }}>
                <Zap size={12} aria-hidden="true" /> {d.demo.reward}
              </span>
            </header>

            <dl className="grid grid-cols-2 gap-px bg-ev-line sm:grid-cols-4">
              {[
                { label: d.labels.category, value: d.demo.category, span: "col-span-2" },
                { label: d.labels.difficulty, value: d.demo.difficulty },
                { label: d.labels.time, value: d.demo.time },
              ].map((item) => (
                <div key={item.label} className={`bg-[oklch(0.16_0.04_268)] px-5 py-4 ${item.span ?? ""}`}>
                  <dt className="ev-kicker">{item.label}</dt>
                  <dd className="mt-1 text-sm text-ev-chalk">{item.value}</dd>
                </div>
              ))}
              <div className="col-span-2 bg-[oklch(0.16_0.04_268)] px-5 py-4 sm:col-span-4">
                <dt className="ev-kicker">{d.labels.badge}</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-ev-chalk">
                  <span aria-hidden="true">◈</span> {d.demo.badge}
                </dd>
              </div>
            </dl>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <p className="ev-kicker">{d.labels.briefing}</p>
                <p className="mt-2 text-sm italic leading-relaxed text-ev-mist">
                  “{d.demo.briefing}”
                </p>
              </div>
              <div>
                <p className="ev-kicker flex items-center gap-1.5">
                  <Target size={13} aria-hidden="true" /> {d.labels.objective}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ev-chalk">{d.demo.objective}</p>
                <p className="ev-kicker mt-4">{d.labels.evidence}</p>
                <ul className="mt-2 grid gap-1.5">
                  {d.demo.evidence.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-ev-mist">
                      <Check size={13} style={{ color: "var(--color-ev-emerald-lit)" }} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className="flex flex-wrap items-center gap-3 border-t border-ev-line p-6">
              {phase === "idle" ? (
                <button
                  type="button"
                  onClick={accept}
                  {...gestureTargetProps("demo-accept")}
                  className="ev-btn"
                >
                  {d.demo.accept}
                </button>
              ) : (
                <>
                  <span className="ev-tag" style={{ color: "var(--color-ev-emerald-lit)" }}>
                    <Check size={12} aria-hidden="true" /> {d.demo.accepted}
                  </span>
                  <span className="ev-tag ev-num">
                    <Timer size={12} aria-hidden="true" /> {clock}
                  </span>
                  <button
                    type="button"
                    onClick={reset}
                    {...gestureTargetProps("demo-reset")}
                    className="ev-btn ev-btn--ghost ev-btn--sm ms-auto"
                  >
                    <RotateCcw size={13} aria-hidden="true" /> {d.demo.reset}
                  </button>
                </>
              )}
            </footer>
          </article>

          {/* -------------------------------------------------- demo track */}
          <div className="grid content-start gap-3">
            <ol className="grid gap-2" aria-live="polite">
              {d.demo.timeline.map((label, index) => {
                const done = stage > index;
                const active = stage === index;
                const isReward = index === d.demo.timeline.length - 1;
                return (
                  <li
                    key={label}
                    className="ev-panel relative flex items-center gap-3 overflow-hidden p-4 transition-all"
                    style={{
                      borderColor: active
                        ? "color-mix(in oklch, var(--color-ev-aqua) 45%, transparent)"
                        : undefined,
                      opacity: stage >= index ? 1 : 0.45,
                    }}
                  >
                    {active && (
                      <motion.span
                        layoutId="demo-sweep"
                        className="absolute inset-0 -z-0 bg-[oklch(0.7_0.1_200/0.09)]"
                        transition={{ type: "spring", stiffness: 200, damping: 26 }}
                      />
                    )}
                    <span
                      className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs"
                      style={{
                        borderColor: done
                          ? "color-mix(in oklch, var(--color-ev-emerald-lit) 60%, transparent)"
                          : "var(--color-ev-line)",
                        color: done ? "var(--color-ev-emerald-lit)" : "var(--color-ev-haze)",
                      }}
                    >
                      {done ? <Check size={14} aria-hidden="true" /> : index + 1}
                    </span>
                    <span className="relative z-10 font-[family-name:var(--font-display)] text-sm font-semibold text-ev-chalk">
                      {label}
                    </span>
                    {isReward && done && (
                      <span className="relative z-10 ms-auto ev-kicker" style={{ color: "var(--color-ev-amber)" }}>
                        {d.demo.verified}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>

            <AnimatePresence>
              {phase === "accepted" && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ev-panel flex gap-2 p-4 text-xs leading-relaxed text-ev-mist"
                >
                  <Clock size={14} className="mt-px shrink-0" aria-hidden="true" />
                  {d.demo.acceptedBody}
                </motion.p>
              )}
            </AnimatePresence>

            {phase === "done" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ev-panel grid justify-items-center gap-2 p-6 text-center"
              >
                <span
                  className="grid h-14 w-14 place-items-center rounded-full text-2xl"
                  style={{
                    background: "radial-gradient(circle, oklch(0.7 0.15 154 / 0.3), transparent 70%)",
                    boxShadow: "0 0 34px -6px var(--color-ev-emerald-lit)",
                  }}
                  aria-hidden="true"
                >
                  ◈
                </span>
                <p className="ev-display text-lg text-ev-chalk">{d.demo.verified}</p>
                <p className="ev-kicker" style={{ color: "var(--color-ev-amber)" }}>
                  {d.demo.reward}
                </p>
              </motion.div>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
