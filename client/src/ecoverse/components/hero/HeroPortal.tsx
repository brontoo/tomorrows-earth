import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Hand, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "../../i18n";
import { useParallax } from "../../lib/hooks";
import { getDeviceTier, TIER_PARTICLE_COUNTS } from "../../lib/utils";
import { EcoVerseMark } from "../brand/EcoVerseLogo";
import FloatingOrbs from "./FloatingOrbs";
import { Dunes, FarRange, ForegroundFlora, NearShore } from "./Landscape";
import ParticleField from "./ParticleField";
import PortalGraphic from "./PortalGraphic";
import GestureGate from "./GestureGate";
import { gestureTargetProps } from "../../gesture/useGesture";

const ENTER_PATH = "/missions";
const HOW_PATH = "#game-loop";

export default function HeroPortal() {
  const { d, fmt } = useI18n();
  const sceneRef = useParallax<HTMLDivElement>();
  const [taken, setTaken] = useState<string[]>([]);
  const [phase, setPhase] = useState<"explore" | "armed" | "entering" | "welcome">("explore");
  const [hoverCta, setHoverCta] = useState(false);

  const tier = getDeviceTier();
  const particles = TIER_PARTICLE_COUNTS[tier];

  const charge = Math.min(taken.length, 3);
  const armed = phase === "armed";

  const selectOrb = useCallback((id: string) => {
    setTaken((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      if (next.length >= 3) setPhase("armed");
      return next;
    });
  }, []);

  const enterPortal = useCallback(() => {
    setPhase("entering");
    window.setTimeout(() => setPhase("welcome"), 1500);
  }, []);

  const reset = useCallback(() => {
    setTaken([]);
    setPhase("explore");
  }, []);

  return (
    <section
      id="portal"
      className="ev-hero"
      aria-labelledby="hero-title"
      onPointerEnter={() => setHoverCta(true)}
      onPointerLeave={() => setHoverCta(false)}
    >
      {/* ---------------------------------------------------------- scene */}
      <div className="ev-scene" ref={sceneRef} aria-hidden="true">
        <div className="ev-layer ev-layer--sky">
          <div className="absolute inset-0 bg-[radial-gradient(58%_42%_at_50%_46%,oklch(0.42_0.09_214/0.55),transparent_70%)]" />
        </div>

        <div className="ev-layer ev-layer--stars">
          <ParticleField count={particles} variant="stars" opacity={0.9} className="ev-stars" />
        </div>

        <div className="ev-layer ev-layer--range">
          <div className="ev-range" style={{ blockSize: "52%" }}>
            <FarRange />
          </div>
          <div className="ev-range" style={{ blockSize: "40%" }}>
            <Dunes />
          </div>
        </div>

        <div className="ev-layer ev-layer--portal">
          <div className="ev-portal" data-charge={charge} data-armed={armed}>
            <PortalGraphic charge={charge} armed={armed} />
          </div>
        </div>

        <div className="ev-layer ev-layer--frags">
          <ParticleField count={Math.round(particles * 0.5)} variant="motes" converge={hoverCta || armed} />
        </div>

        <div className="ev-layer ev-layer--fore">
          <div className="ev-range" style={{ blockSize: "34%" }}>
            <NearShore />
          </div>
          <div className="ev-range" style={{ blockSize: "38%" }}>
            <ForegroundFlora />
          </div>
          <ParticleField count={Math.round(particles * 0.35)} variant="leaves" />
        </div>
      </div>

      {/* ------------------------------------------------------- fragments */}
      <FloatingOrbs taken={taken} onSelect={selectOrb} />

      {/* portal becomes an enter target once three fragments are held */}
      {armed && (
        <button
          type="button"
          {...gestureTargetProps("portal-enter")}
          onClick={enterPortal}
          className="ev-portal-hit"
          aria-label={d.hero.activity.readyHintPointer}
        >
          <span className="ev-portal-hit__ring" aria-hidden="true" />
        </button>
      )}

      {/* --------------------------------------------------------- content */}
      <div className="ev-hero__content">
        <AnimatePresence>
          {phase === "welcome" ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid justify-items-center gap-4"
            >
              <p className="ev-kicker">{d.hero.activity.selected}</p>
              <h2 className="ev-h2 ev-gradient-text !mt-0">{d.hero.activity.welcome}</h2>
              <p className="ev-note text-center">{d.hero.activity.welcomeBody}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href={ENTER_PATH} className="ev-btn" {...gestureTargetProps("welcome-enter")}>
                  {d.hero.primary} <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <button type="button" onClick={reset} className="ev-btn ev-btn--ghost ev-btn--sm">
                  {d.hero.activity.reset}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              className="grid justify-items-center"
              animate={{ opacity: phase === "armed" ? 0.55 : 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="ev-eyebrow">{d.hero.eyebrow}</p>

              <h1 id="hero-title" className="ev-hero__wordmark ev-brand-text ev-gradient-text">
                {d.hero.title}
              </h1>

              <p className="ev-hero__tagline">{d.brand.tagline}</p>

              <p className="ev-claim ev-hero__claim">
                {d.brand.claim.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>

              <p className="ev-hero__support">{d.hero.supporting}</p>

              <AnimatePresence>
                {armed && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-6 grid justify-items-center gap-2 rounded-2xl border border-ev-emerald-lit/40 bg-ev-emerald/10 px-6 py-4 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="ev-kicker text-ev-emerald-lit">
                      {d.hero.activity.ready}
                    </p>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Sparkles size={15} aria-hidden="true" />
                      {d.hero.activity.readyHintPointer}
                    </p>
                    <button
                      type="button"
                      onClick={enterPortal}
                      {...gestureTargetProps("portal-enter-button")}
                      className="ev-btn ev-btn--emerald ev-btn--sm mt-1"
                    >
                      {d.hero.primary}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="ev-hero__cta">
                <Link href={ENTER_PATH} className="ev-btn" {...gestureTargetProps("hero-enter")}>
                  {d.hero.primary} <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link href={HOW_PATH} className="ev-btn ev-btn--ghost">
                  {d.hero.secondary}
                </Link>
              </div>

              <div className="mt-5 flex flex-col items-center gap-3">
                <p className="text-xs text-ev-haze">
                  {charge > 0
                    ? fmt(d.hero.activity.progress, { count: charge })
                    : d.hero.orbHint}
                </p>
                <GestureGate />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ----------------------------------------------------------- hints */}
      {phase === "explore" && (
        <a
          href="#welcome"
          className="ev-hero__hint ev-hint-bob absolute bottom-6 start-1/2 z-10 -translate-x-1/2"
        >
          {d.hero.scroll}
          <ChevronDown size={15} aria-hidden="true" />
        </a>
      )}

      {/* ----------------------------------------------------------- brand */}
      <span className="pointer-events-none absolute bottom-8 end-8 z-10 hidden opacity-25 lg:block">
        <EcoVerseMark size={120} />
      </span>
    </section>
  );
}
