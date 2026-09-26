import { motion } from "framer-motion";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";

export default function ExplorerCode() {
  const { d } = useI18n();

  return (
    <Section id="code">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.nav.safety}
          title={d.code.heading}
          lead={d.code.subheading}
          align="center"
        />

        <Reveal className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2">
          {d.code.items.map((item, index) => (
            <motion.p
              key={item.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 2) * 0.08 + Math.floor(index / 2) * 0.05 }}
              className="ev-panel flex items-start gap-4 p-5"
            >
              <span className="ev-num mt-0.5 text-xs font-bold tracking-[0.2em] text-ev-aqua">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <b className="block font-[family-name:var(--font-display)] text-[0.95rem] tracking-tight text-ev-chalk">
                  {item.name}
                </b>
                <span className="mt-1 block text-sm leading-relaxed text-ev-mist">{item.body}</span>
              </span>
            </motion.p>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
