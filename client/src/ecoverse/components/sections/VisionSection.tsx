import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";

export default function VisionSection() {
  const { d } = useI18n();

  return (
    <Section id="vision" tone="quiet">
      <div className="ev-shell">
        <SectionHeading eyebrow={d.footer.about} title={d.vision.heading} align="center" />

        <Reveal className="mx-auto mt-10 max-w-5xl text-center">
          <p className="ev-h1 !text-[clamp(1.7rem,5.4vw,3.6rem)]">
            {d.vision.statement.map((line) => (
              <span key={line} className="ev-gradient-text block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-[1.2fr_0.8fr] md:text-start">
          <p className="ev-lead text-ev-chalk">{d.vision.body}</p>
          <ul className="grid content-start gap-2.5">
            {d.vision.highlight.map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="flex items-center gap-3 rounded-xl border border-ev-line bg-black/25 px-4 py-3"
              >
                <span className="ev-dot" style={{ color: "var(--color-ev-emerald-lit)" }} aria-hidden="true" />
                <span className="font-[family-name:var(--font-display)] font-bold tracking-tight text-ev-chalk">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
