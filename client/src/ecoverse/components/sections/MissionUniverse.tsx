import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";
import { WorldGlyph, type WorldKind } from "../game/WorldGlyph";
import { useTilt } from "../../lib/hooks";
import { gestureTargetProps } from "../../gesture/useGesture";

const ZONE_KIND: Record<string, WorldKind> = {
  waste: "waste",
  water: "water",
  energy: "energy",
  biodiversity: "forest",
  oceans: "ocean",
  food: "food",
  transport: "transport",
  climate: "climate",
  cities: "city",
  community: "community",
  innovation: "innovation",
};

export default function MissionUniverse() {
  const { d } = useI18n();
  const [activeId, setActiveId] = useState(d.content.zones[0].id);
  const active = d.content.zones.find((zone) => zone.id === activeId) ?? d.content.zones[0];

  return (
    <Section id="universe">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.labels.world}
          title={d.universe.heading}
          lead={d.universe.subheading}
        />

        <Reveal className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* ------------------------------------------- floating fragments */}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {d.content.zones.map((zone) => {
              const selected = zone.id === activeId;
              return (
                <ZoneCard
                  key={zone.id}
                  id={zone.id}
                  name={zone.name}
                  blurb={zone.blurb}
                  kind={ZONE_KIND[zone.id]}
                  selected={selected}
                  onSelect={() => setActiveId(zone.id)}
                />
              );
            })}
          </ul>

          {/* ------------------------------------------------- zone readout */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="ev-panel p-6">
              <p className="ev-kicker">{d.universe.exampleMissions}</p>
              <h3 className="ev-display mt-2 text-2xl text-ev-chalk">{active.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ev-mist">{active.blurb}</p>

              <ul className="mt-5 grid gap-3">
                <AnimatePresence mode="wait">
                  {active.missions.map((mission) => (
                    <motion.li
                      key={mission.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-xl border border-ev-line bg-black/20 p-4"
                    >
                      <p className="font-[family-name:var(--font-display)] font-semibold text-ev-chalk">
                        {mission.name}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ev-mist">
                        {mission.blurb}
                      </p>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <Link
                href="/missions"
                {...gestureTargetProps("universe-open")}
                className="ev-btn ev-btn--ghost ev-btn--sm mt-6 w-full"
              >
                <Compass size={14} aria-hidden="true" />
                {d.universe.openExplorer}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function ZoneCard({
  id,
  name,
  blurb,
  kind,
  selected,
  onSelect,
}: {
  id: string;
  name: string;
  blurb: string;
  kind: WorldKind;
  selected: boolean;
  onSelect: () => void;
}) {
  const tilt = useTilt<HTMLButtonElement>(7);

  return (
    <li>
      <button
        type="button"
        ref={tilt.ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        onClick={onSelect}
        onFocus={onSelect}
        aria-pressed={selected}
        {...gestureTargetProps(`zone-${id}`)}
        className="ev-tilt ev-panel group relative block w-full overflow-hidden p-4 text-start"
        style={{
          borderColor: selected
            ? "color-mix(in oklch, var(--color-ev-aqua) 55%, transparent)"
            : undefined,
          boxShadow: selected
            ? "0 0 0 1px color-mix(in oklch, var(--color-ev-aqua) 35%, transparent), 0 22px 60px -20px var(--color-ev-aqua-deep)"
            : undefined,
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(80% 60% at 80% 0%, color-mix(in oklch, var(--color-ev-aqua) 12%, transparent), transparent 70%)",
          }}
        />
        <span className="ev-tilt-inner relative z-10 block">
          <span className="block h-20 w-20 overflow-hidden rounded-2xl shadow-[0_10px_28px_-10px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover:scale-105">
            <WorldGlyph kind={kind} size={80} radius={0.22} />
          </span>
          <span className="mt-3 block font-[family-name:var(--font-display)] text-[0.82rem] font-bold uppercase leading-tight tracking-[0.1em] text-ev-chalk">
            {name}
          </span>
          <span className="mt-1.5 block text-[0.72rem] leading-snug text-ev-haze">{blurb}</span>
        </span>
      </button>
    </li>
  );
}
