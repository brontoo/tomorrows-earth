import { motion } from "framer-motion";
import { ArrowRight, Lock, Star } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";
import { gestureTargetProps } from "../../gesture/useGesture";

const MAP_W = 1586;
const MAP_H = 992;

/**
 * Pin placement, in the artwork's native 1586×992 pixel space. These reuse the
 * verified coordinates already used by the missions map, so the EcoVerse route
 * sits on the illustrated geography rather than floating over the sea.
 * Ordered west → north → east, climbing the coast like a real journey.
 */
const PIN_POINTS = [
  { x: 360, y: 770 },
  { x: 860, y: 540 },
  { x: 1030, y: 425 },
  { x: 1090, y: 260 },
  { x: 1180, y: 150 },
  { x: 1310, y: 260 },
  { x: 1375, y: 335 },
];

const ROUTE = PIN_POINTS.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

export default function UAEAdventure() {
  const { d } = useI18n();
  const worlds = d.uae.worlds;

  return (
    <Section id="uae" tone="quiet">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.nav.missions}
          title={d.uae.heading}
          lead={d.uae.subheading}
          align="center"
        />

        <Reveal className="mt-12">
          <p className="ev-note mx-auto max-w-3xl text-center">{d.uae.intro}</p>

          {/* ------------------------------------------------------- the map */}
          <div className="ev-uae mt-9">
            <span className="ev-uae__plate" aria-hidden="true" />
            <div className="ev-uae__frame">
              <img
                src="/maps/uae-adventure-map.png"
                alt={d.uae.subheading}
                loading="lazy"
                decoding="async"
                width={MAP_W}
                height={MAP_H}
              />
              <span className="ev-uae__grid" aria-hidden="true" />
            </div>

            {/* route overlay */}
            <svg
              className="ev-uae__path"
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ev-uae-route" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-ev-emerald-lit)" />
                  <stop offset="55%" stopColor="var(--color-ev-aqua)" />
                  <stop offset="100%" stopColor="var(--color-ev-amber)" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              <path d={ROUTE} fill="none" stroke="url(#ev-uae-route)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
              <path
                d={ROUTE}
                fill="none"
                stroke="url(#ev-uae-route)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="14 22"
                opacity="0.9"
              >
                <animate attributeName="stroke-dashoffset" from="36" to="0" dur="1.4s" repeatCount="indefinite" />
              </path>
            </svg>

            {/* world pins */}
            {worlds.map((world, index) => {
              const point = PIN_POINTS[index] ?? PIN_POINTS[PIN_POINTS.length - 1];
              const locked = world.status === "locked";
              const complete = world.status === "complete";
              return (
                <button
                  key={world.name}
                  type="button"
                  className="ev-uae__world group"
                  data-status={world.status}
                  style={{
                    left: `${(point.x / MAP_W) * 100}%`,
                    top: `${(point.y / MAP_H) * 100}%`,
                    zIndex: worlds.length - index,
                  }}
                  aria-label={`${d.labels.world} ${world.n}: ${world.name}`}
                >
                  <span className="ev-uae__pin" aria-hidden="true">
                    {complete ? <Star size={12} /> : locked ? <Lock size={11} /> : world.n}
                  </span>
                  <span className="ev-uae__name">{world.name}</span>
                  <span
                    className="ev-uae__state rounded-md border border-ev-line bg-[oklch(0.14_0.03_268/0.88)] px-2 py-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {complete
                      ? d.rewards.worlds.complete
                      : locked
                        ? d.rewards.worlds.locked
                        : d.rewards.worlds.available}
                  </span>
                </button>
              );
            })}
          </div>

          {/* --------------------------------------------------------- meta */}
          <p className="ev-note mt-4 text-center">{d.uae.hint}</p>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {d.uae.stats.map((stat) => (
              <li key={stat} className="ev-tag">
                {stat}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex justify-center">
            <Link
              href="/missions"
              {...gestureTargetProps("uae-enter")}
              className="ev-btn"
            >
              {d.uae.cta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
