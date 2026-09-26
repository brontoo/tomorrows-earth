import { motion } from "framer-motion";
import { BarChart3, Info, ShieldCheck } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";

/**
 * Game progress is a self-reported profile, so demo values are fine here.
 * Environmental figures are a different matter — those stay empty.
 */
const DEMO_GAME_PROGRESS = [
  { value: 1450, goal: 2000, percent: 72 },
  { value: 6, goal: 14, percent: 43 },
  { value: 4, goal: 8, percent: 50 },
  { value: 2, goal: 7, percent: 29 },
  { value: 9, goal: 12, percent: 75 },
];

/**
 * Game progress and verified impact are shown as two separate columns so a
 * score can never be mistaken for an environmental claim.
 */
export default function ImpactSection() {
  const { d } = useI18n();

  return (
    <Section id="impact" tone="deep">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.labels.progress}
          title={d.impact.heading}
          lead={d.impact.subheading}
          align="center"
        />

        <Reveal className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* -------------------------------------------- game progress only */}
          <div className="ev-panel p-7">
            <p className="ev-kicker flex items-center gap-2">
              <BarChart3 size={13} aria-hidden="true" />
              {d.impact.gameTitle}
            </p>
            <ul className="mt-5 grid gap-2.5">
              {d.impact.gameItems.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  className="rounded-xl border border-ev-line bg-black/20 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="ev-dot" style={{ color: "var(--color-ev-aqua)" }} aria-hidden="true" />
                    <span className="text-sm font-semibold text-ev-chalk">{item}</span>
                    <span className="ev-kicker ev-num ms-auto text-[0.6rem]">
                      {DEMO_GAME_PROGRESS[index].value} / {DEMO_GAME_PROGRESS[index].goal}
                    </span>
                  </div>
                  <span className="ev-xp mt-2.5 !h-1.5">
                    <motion.span
                      className="ev-xp__fill"
                      initial={{ inlineSize: 0 }}
                      whileInView={{ inlineSize: `${DEMO_GAME_PROGRESS[index].percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 + index * 0.07 }}
                    />
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* ------------------------------------------ verified impact only */}
          <div className="ev-panel p-7">
            <p className="ev-kicker flex items-center gap-2">
              <ShieldCheck size={13} aria-hidden="true" />
              {d.impact.impactTitle}
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {d.impact.impactItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl border p-3"
                  style={{
                    borderColor: "color-mix(in oklch, var(--color-ev-emerald-lit) 32%, transparent)",
                    background: "oklch(0.7 0.15 152 / 0.07)",
                  }}
                >
                  <span className="ev-dot" style={{ color: "var(--color-ev-emerald-lit)" }} aria-hidden="true" />
                  <span className="text-sm text-ev-chalk">{item}</span>
                </li>
              ))}
            </ul>

            {/* -------------------------------- quantified impact: honest empty state */}
            <div className="mt-7 border-t border-ev-line pt-6">
              <p className="ev-kicker">{d.impact.measurableTitle}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {d.impact.metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="rounded-xl border border-dashed border-ev-line-strong bg-black/15 p-4"
                  >
                    <p className="text-sm text-ev-mist">{metric.label}</p>
                    <p className="ev-display mt-1.5 text-lg text-ev-haze" aria-hidden="true">
                      — — —
                    </p>
                  </div>
                ))}
              </div>
              <p
                className="mt-5 flex items-start gap-2 rounded-xl border p-4 text-sm leading-relaxed"
                style={{
                  borderColor: "color-mix(in oklch, var(--color-ev-amber) 32%, transparent)",
                  background: "oklch(0.75 0.15 88 / 0.07)",
                  color: "var(--color-ev-mist)",
                }}
              >
                <Info size={15} className="mt-px shrink-0" style={{ color: "var(--color-ev-amber)" }} aria-hidden="true" />
                {d.impact.awaitingData}
              </p>
            </div>

            <p className="ev-note mt-4">{d.impact.measurableNote}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
