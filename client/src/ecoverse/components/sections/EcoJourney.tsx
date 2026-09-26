import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { Lock } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";

/** Index past which milestones stay locked. */
const UNLOCKED_UPTO = 5;

export default function EcoJourney() {
  const { d } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 72%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <Section id="journey">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.labels.progress}
          title={d.journey.heading}
          lead={d.journey.subheading}
          align="center"
        />

        <Reveal className="relative mt-16" >
          <div ref={trackRef} className="relative">
            {/* the rail */}
            <span
              className="ev-timeline absolute inset-x-0 top-5 hidden h-px md:block"
              aria-hidden="true"
            />
            {/* the fill that follows scroll */}
            <motion.span
              className="absolute inset-x-0 top-5 hidden h-px origin-left md:block"
              style={{
                scaleX: fill,
                background: "linear-gradient(90deg, var(--color-ev-aqua), var(--color-ev-emerald-lit))",
                boxShadow: "0 0 18px -2px var(--color-ev-aqua)",
              }}
              aria-hidden="true"
            />

            <ol className="grid gap-6 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
              {d.journey.milestones.map((milestone, index) => {
                const done = index < UNLOCKED_UPTO;
                const current = index === UNLOCKED_UPTO;
                return (
                  <motion.li
                    key={milestone}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                    className="ev-timeline__step"
                    data-state={current ? "current" : done ? "done" : "locked"}
                  >
                    <span className="ev-timeline__bead" aria-hidden="true">
                      {done ? "✓" : current ? "◈" : <Lock size={11} />}
                    </span>
                    <p className="ev-kicker ev-num">
                      {String(index + 1).padStart(2, "0")} · {d.journey.state}
                    </p>
                    <h3 className="ev-timeline__title">{milestone}</h3>
                    <p className="ev-timeline__meta">
                      {current ? d.rewards.worlds.available : done ? d.rewards.worlds.complete : d.journey.locked}
                    </p>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
