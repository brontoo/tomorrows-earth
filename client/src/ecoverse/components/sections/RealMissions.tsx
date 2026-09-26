import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileCheck2 } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";
import { cn } from "../../lib/utils";
import { useReducedMotion } from "../../lib/hooks";

const GAP = "gap-4";

export default function RealMissions() {
  const { d, fmt } = useI18n();
  const railRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const total = d.content.missions.length;

  // Track the card the user is actually looking at, without hijacking scroll.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const card = rail.firstElementChild as HTMLElement | null;
        if (!card) return;
        const step = card.offsetWidth + 16;
        setIndex(Math.round(rail.scrollLeft / step));
      });
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      rail.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const scrollTo = useCallback((next: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const clamped = Math.max(0, Math.min(total - 1, next));
    const card = rail.firstElementChild as HTMLElement | null;
    if (!card) return;
    rail.scrollTo({
      left: clamped * (card.offsetWidth + 16),
      behavior: reduced ? "auto" : "smooth",
    });
    setIndex(clamped);
  }, [reduced, total]);

  return (
    <Section id="real-missions" tone="quiet">
      <div className="ev-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={d.labels.missions} title={d.realMissions.heading} lead={d.realMissions.subheading} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTo(index - 1)}
              disabled={index === 0}
              aria-label={d.realMissions.previous}
              className="ev-btn ev-btn--ghost h-11 w-11 !p-0 disabled:opacity-30"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span className="ev-kicker ev-num px-1">
              {fmt(d.realMissions.position, { index: index + 1, total })}
            </span>
            <button
              type="button"
              onClick={() => scrollTo(index + 1)}
              disabled={index >= total - 1}
              aria-label={d.realMissions.next}
              className="ev-btn ev-btn--ghost h-11 w-11 !p-0 disabled:opacity-30"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <Reveal className="mt-10">
        <ul ref={railRef} className={cn("ev-rail px-6", GAP)}>
          {d.content.missions.map((mission, i) => (
            <li key={mission.name}>
              <article
                className="ev-panel ev-tilt relative flex h-full flex-col gap-4 p-6"
                onPointerMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const relX = (event.clientX - rect.left) / rect.width - 0.5;
                  const relY = (event.clientY - rect.top) / rect.height - 0.5;
                  event.currentTarget.style.setProperty("--ry", `${relX * 7}deg`);
                  event.currentTarget.style.setProperty("--rx", `${-relY * 7}deg`);
                }}
                onPointerLeave={(event) => {
                  event.currentTarget.style.setProperty("--ry", "0deg");
                  event.currentTarget.style.setProperty("--rx", "0deg");
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="ev-kicker ev-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ev-tag" style={{ color: "var(--color-ev-aqua)" }}>
                    {d.labels.missions}
                  </span>
                </div>
                <h3 className="ev-display text-xl text-ev-chalk">{mission.name}</h3>
                <p className="text-sm leading-relaxed text-ev-mist">{mission.desc}</p>
                <p className="mt-auto flex items-start gap-2 rounded-xl border border-ev-line bg-black/20 p-3 text-xs leading-relaxed text-ev-mist">
                  <FileCheck2 size={14} className="mt-px shrink-0 text-ev-emerald-lit" aria-hidden="true" />
                  <span>
                    <b className="block text-[0.62rem] uppercase tracking-[0.16em] text-ev-haze">
                      {d.realMissions.evidenceLabel}
                    </b>
                    {mission.evidence}
                  </span>
                </p>
              </article>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
