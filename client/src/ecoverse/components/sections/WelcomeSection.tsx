import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";

export default function WelcomeSection() {
  const { d } = useI18n();
  const steps = d.welcome.chain;

  return (
    <Section id="welcome" tone="deep">
      <div className="ev-shell grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <SectionHeading eyebrow={d.nav.home} title={d.welcome.heading} />
          <p className="ev-lead mt-6 text-lg text-ev-chalk">
            {d.welcome.subheading.map((line, index) => (
              <span
                key={line}
                className="block"
                style={index === 0 ? { color: "var(--color-ev-mist)" } : undefined}
              >
                {line}
              </span>
            ))}
          </p>
          <p className="ev-lead mt-5">{d.welcome.body}</p>
        </div>

        <Reveal className="relative">
          {/* LEARN → ACT → PROVE → IMPACT */}
          <ol className="relative grid gap-3">
            <span
              className="pointer-events-none absolute top-6 start-[1.45rem] w-px bg-[linear-gradient(180deg,var(--color-ev-aqua),var(--color-ev-emerald-lit),var(--color-ev-amber))] opacity-45"
              style={{ blockSize: "calc(100% - 3rem)" }}
              aria-hidden="true"
            />
            {steps.map((step, index) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex items-center gap-4"
              >
                <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ev-line-strong bg-[oklch(0.15_0.04_268)] font-[family-name:var(--font-display)] text-xs font-bold tracking-[0.14em] text-ev-aqua">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-ev-chalk sm:text-3xl">
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <ArrowDown
                    size={16}
                    className="ev-flow-arrow ms-auto opacity-50"
                    aria-hidden="true"
                  />
                )}
              </motion.li>
            ))}
          </ol>

          <div className="ev-panel mt-10 p-7 text-center">
            <p className="ev-claim text-[clamp(1rem,2.3vw,1.6rem)]">
              {d.welcome.highlight.map((line) => (
                <span key={line} className="ev-gradient-text block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
