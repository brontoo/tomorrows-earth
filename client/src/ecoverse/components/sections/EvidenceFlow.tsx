import { motion } from "framer-motion";
import { FileText, PlayCircle, Share2, ShieldCheck, Upload } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";

/** Icon per flow stage, in dictionary order. */
const ICONS = [PlayCircle, Upload, FileText, ShieldCheck, Share2];

export default function EvidenceFlow() {
  const { d } = useI18n();

  return (
    <Section id="evidence">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.labels.evidence}
          title={d.evidence.heading}
          lead={d.evidence.subheading}
          align="center"
        />

        <Reveal className="relative mt-14">
          <span className="ev-divider-glow pointer-events-none absolute inset-x-0 top-10 hidden lg:block" aria-hidden="true" />

          <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {d.evidence.flow.map((stage, index) => {
              const Icon = ICONS[index] ?? FileText;
              return (
                <motion.li
                  key={stage}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.09 }}
                  className="ev-panel group relative p-5 text-center"
                >
                  <span
                    className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-ev-line-strong bg-[oklch(0.15_0.04_268)] transition-transform duration-500 group-hover:-translate-y-1"
                    style={{
                      boxShadow: "0 0 34px -14px var(--color-ev-aqua)",
                      color: "var(--color-ev-aqua)",
                    }}
                    aria-hidden="true"
                  >
                    <Icon size={22} />
                  </span>
                  <p className="ev-kicker ev-num mt-4">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1.5 font-[family-name:var(--font-display)] font-bold text-ev-chalk">
                    {stage}
                  </h3>
                </motion.li>
              );
            })}
          </ol>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <p className="ev-kicker text-center">{d.evidence.typesNote}</p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {d.evidence.types.map((type) => (
              <li key={type} className="ev-tag">
                {type}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
