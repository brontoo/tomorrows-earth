import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useI18n } from "../../i18n";
import { useReducedMotion } from "../../lib/hooks";
import { Reveal, Section, SectionHeading } from "./Section";
import { gestureTargetProps } from "../../gesture/useGesture";

/** Ring geometry, kept in one place so nodes and the travelling pulse agree. */
const RADIUS = 41; // percent of the container

function polar(index: number, total: number) {
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180);
  return {
    x: 50 + RADIUS * Math.cos(angle),
    y: 50 + RADIUS * Math.sin(angle),
  };
}

export default function GameLoop() {
  const { d, fmt } = useI18n();
  const steps = d.loop.steps;
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // A pulse travels the ring as the section passes through the viewport.
  const pulseAngle = useTransform(scrollYProgress, [0.05, 0.85], [-90, 250]);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 26]);

  const current = steps[active];

  return (
    <Section id="game-loop">
      <div className="ev-shell" ref={sectionRef}>
        <SectionHeading
          eyebrow={d.nav.howItWorks}
          title={d.loop.heading}
          lead={d.loop.subheading}
          align="center"
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal className="relative order-2 lg:order-1">
            <div className="ev-loop">
              <motion.svg
                className="ev-loop__svg"
                viewBox="0 0 100 100"
                aria-hidden="true"
                style={reduced ? undefined : { rotate: ringRotate }}
              >
                <defs>
                  <linearGradient id="ev-loop-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--color-ev-aqua)" />
                    <stop offset="50%" stopColor="var(--color-ev-teal-lit)" />
                    <stop offset="100%" stopColor="var(--color-ev-emerald-lit)" />
                  </linearGradient>
                </defs>

                {/* structural rings */}
                <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="url(#ev-loop-grad)" strokeWidth="0.35" opacity="0.35" />
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS - 7}
                  fill="none"
                  stroke="url(#ev-loop-grad)"
                  strokeWidth="0.2"
                  strokeDasharray="0.8 2.4"
                  opacity="0.4"
                />
                <circle cx="50" cy="50" r={RADIUS + 6} fill="none" stroke="url(#ev-loop-grad)" strokeWidth="0.2" opacity="0.22" />

                {/* chords between consecutive steps */}
                {steps.map((_, index) => {
                  const a = polar(index, steps.length);
                  const b = polar(index + 1, steps.length);
                  const done = index < active;
                  return (
                    <line
                      key={index}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={done ? "var(--color-ev-emerald-lit)" : "url(#ev-loop-grad)"}
                      strokeWidth={done ? 0.6 : 0.3}
                      opacity={done ? 0.85 : 0.3}
                      style={{ transition: "all .4s ease" }}
                    />
                  );
                })}

                {/* scroll-linked travelling pulse */}
                {!reduced && (
                  <motion.g style={{ rotate: pulseAngle, originX: "50px", originY: "50px" }}>
                    <circle cx={50} cy={50 - RADIUS} r="1.6" fill="var(--color-ev-aqua)" />
                    <circle cx={50} cy={50 - RADIUS} r="4" fill="var(--color-ev-aqua)" opacity="0.22" />
                  </motion.g>
                )}
              </motion.svg>

              {/* centre readout */}
              <div className="ev-loop__core">
                <div>
                  <p className="ev-kicker">
                    {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                  </p>
                  <p className="ev-display mt-2 text-xl text-ev-chalk sm:text-2xl">
                    {current.name}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ev-mist sm:text-sm">
                    {current.desc}
                  </p>
                </div>
              </div>

              {/* step buttons */}
              {steps.map((step, index) => {
                const point = polar(index, steps.length);
                return (
                  <button
                    key={step.id}
                    type="button"
                    data-gesture-target={`loop-${step.id}`}
                    data-active={index === active}
                    data-done={index < active}
                    onClick={() => setActive(index)}
                    onPointerEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    aria-pressed={index === active}
                    aria-label={fmt(d.a11y.selectMission, { name: `${step.name}. ${step.desc}` })}
                    className="ev-loop__node"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <span className="ev-loop__num">{String(index + 1).padStart(2, "0")}</span>
                    <span className="ev-loop__name">{step.name}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="order-1 lg:order-2">
            <ol className="grid gap-2.5">
              {steps.map((step, index) => (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    onPointerEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    className="flex w-full items-start gap-4 rounded-2xl border border-transparent p-3 text-start transition-colors hover:border-ev-line hover:bg-white/5"
                    aria-current={index === active ? "true" : undefined}
                  >
                    <span
                      className="ev-loop__num mt-1 w-8 shrink-0"
                      style={{ color: index <= active ? "var(--color-ev-aqua)" : undefined }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-[family-name:var(--font-display)] font-semibold text-ev-chalk">
                        {step.name}
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-ev-mist">
                        {step.desc}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="ev-note mt-5">{d.loop.instruction}</p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
