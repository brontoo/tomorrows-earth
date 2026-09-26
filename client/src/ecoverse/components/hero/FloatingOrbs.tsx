import { useState } from "react";
import { cn } from "../../lib/utils";
import { useI18n } from "../../i18n";
import { useGestureState } from "../../gesture/useGesture";
import { gestureTargetProps } from "../../gesture/useGesture";
import { WorldGlyph, type WorldKind } from "../game/WorldGlyph";

const ORB_KIND: Record<string, WorldKind> = {
  water: "water",
  energy: "energy",
  biodiversity: "forest",
  circularity: "waste",
  ocean: "ocean",
};

const GLOW: Record<string, string> = {
  water: "var(--color-ev-aqua)",
  energy: "var(--color-ev-amber)",
  biodiversity: "var(--color-ev-emerald-lit)",
  circularity: "var(--color-ev-teal-lit)",
  ocean: "var(--color-ev-aqua-deep)",
};

/**
 * The five world fragments orbiting the portal. Every fragment is a real
 * button, so point, click, tap and keyboard all select it — a pinch simply
 * dispatches a click.
 */
export default function FloatingOrbs({
  taken,
  onSelect,
  practiceId,
}: {
  taken: string[];
  onSelect: (id: string) => void;
  /** When set, this fragment is the tutorial practice target. */
  practiceId?: string;
}) {
  const { d, fmt } = useI18n();
  const { hoverId, active: gestureActive } = useGestureState();
  const [active, setActive] = useState<string | null>(null);

  return (
    <ul
      className="pointer-events-none absolute inset-0 z-[5] m-0 list-none p-0"
      aria-label={d.hero.orbsLabel}
      data-testid="hero-orbs"
    >
      {d.content.orbs.map((orb, index) => {
        const id = orb.id;
        const isTaken = taken.includes(id);
        const gestureHover = gestureActive && hoverId === `orb-${id}`;
        const isActive = active === id || gestureHover;
        return (
          <li key={id} className="pointer-events-none absolute inset-0">
            <button
              type="button"
              data-pos={index}
              data-gesture-target={`orb-${id}`}
              data-active={isActive}
              data-taken={isTaken}
              data-practice={practiceId === id}
              aria-label={fmt(d.a11y.selectMission, { name: orb.name })}
              aria-pressed={isTaken}
              disabled={isTaken}
              onClick={() => onSelect(id)}
              onPointerEnter={() => setActive(id)}
              onPointerLeave={() => setActive((cur) => (cur === id ? null : cur))}
              onFocus={() => setActive(id)}
              onBlur={() => setActive((cur) => (cur === id ? null : cur))}
              className={cn(
                "ev-orb pointer-events-auto",
                practiceId === id && "ev-orb--practice",
              )}
              style={{
                ["--orb-glow" as string]: GLOW[id],
                ["--depth" as string]: 34,
                ["--float-y" as string]: `${8 + index * 1.4}s`,
                ["--float-d" as string]: `${index * -1.3}s`,
              }}
            >
              <span className="ev-orb__body">
                <WorldGlyph kind={ORB_KIND[id]} size={200} radius={0.5} className="ev-orb__art" />
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(70% 55% at 32% 24%, oklch(1 0 0 / 0.28), transparent 62%), radial-gradient(120% 100% at 50% 120%, oklch(0.05 0.02 270 / 0.75), transparent 60%)",
                  }}
                />
              </span>
              <span className="ev-orb__ring" aria-hidden="true" />
              <span className="ev-orb__label" aria-hidden="true">
                <b>{orb.name}</b>
                <span>{orb.blurb}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
