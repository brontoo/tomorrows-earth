import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "../../i18n";
import { Section } from "./Section";
import { EcoVerseWordmark } from "../brand/EcoVerseLogo";
import FloatingOrbs from "../hero/FloatingOrbs";
import { gestureTargetProps } from "../../gesture/useGesture";

export default function FinalCTA() {
  const { d } = useI18n();

  return (
    <Section id="final" className="overflow-hidden !py-28">
      {/* the same world the hero opened, seen from the far side */}
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <FloatingOrbs taken={[]} onSelect={() => {}} />
        <span
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 100%, oklch(0.5 0.12 200 / 0.22), transparent 70%)",
          }}
        />
      </div>

      <div className="ev-narrow relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <EcoVerseWordmark markSize={72} className="justify-center" />

          <h2 className="ev-h1 mt-10 text-[clamp(1.9rem,6vw,3.8rem)]">{d.final.heading}</h2>

          {d.final.lines.map((line) => (
            <p key={line} className="ev-lead mt-4 text-lg text-ev-chalk">
              {line}
            </p>
          ))}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/missions" {...gestureTargetProps("final-enter")} className="ev-btn">
              {d.final.cta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/login" {...gestureTargetProps("final-signin")} className="ev-btn ev-btn--ghost">
              <LogIn size={15} aria-hidden="true" />
              {d.final.secondary}
            </Link>
          </div>

          <p className="ev-brand-text mt-14 text-[0.6rem] text-ev-haze">
            {d.final.mark.join(" ")}
          </p>
        </motion.div>
      </div>
    </Section>
  );
}
