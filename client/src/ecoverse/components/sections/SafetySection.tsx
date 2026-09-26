import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";

export default function SafetySection() {
  const { d } = useI18n();

  return (
    <Section id="safety" tone="deep">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.footer.safety}
          title={d.safety.heading}
          lead={d.safety.body}
          align="center"
        />

        <Reveal className="mx-auto mt-12 max-w-4xl">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {d.safety.restrictions.map((rule, index) => (
              <motion.li
                key={rule}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (index % 2) * 0.07 }}
                className="ev-panel flex items-center gap-3 p-4"
                style={{
                  borderColor: "color-mix(in oklch, var(--color-ev-coral) 28%, transparent)",
                }}
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                  style={{ background: "oklch(0.65 0.16 25 / 0.14)", color: "var(--color-ev-coral)" }}
                  aria-hidden="true"
                >
                  <AlertTriangle size={14} />
                </span>
                <span className="text-sm text-ev-chalk">{rule}</span>
              </motion.li>
            ))}
          </ul>

          <div
            className="mt-6 grid gap-4 rounded-2xl border p-6 sm:grid-cols-[auto_1fr]"
            style={{ borderColor: "color-mix(in oklch, var(--color-ev-amber) 30%, transparent)" }}
          >
            <ShieldCheck size={22} style={{ color: "var(--color-ev-amber)" }} aria-hidden="true" />
            <p className="text-sm leading-relaxed text-ev-mist">{d.safety.note}</p>
          </div>

          <p
            className="mt-6 flex items-center justify-center gap-2 text-center font-[family-name:var(--font-display)] font-bold tracking-tight"
            style={{ color: "var(--color-ev-coral)" }}
          >
            <ShieldAlert size={17} aria-hidden="true" />
            {d.safety.urgent}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
