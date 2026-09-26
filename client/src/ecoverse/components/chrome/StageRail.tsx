import { useI18n } from "../../i18n";

/** Maps the ten narrative beats onto the sections that carry them. */
export const STAGE_SECTIONS = [
  "portal",
  "welcome",
  "game-loop",
  "universe",
  "evidence",
  "rewards",
  "impact",
  "code",
  "uae",
  "final",
] as const;

/**
 * Scroll story indicator. Ten stages, always visible on large screens, and a
 * keyboard-reachable jump list.
 */
export default function StageRail({ active }: { active: string }) {
  const { d } = useI18n();
  const activeIndex = Math.max(
    0,
    STAGE_SECTIONS.indexOf(active as (typeof STAGE_SECTIONS)[number]),
  );

  return (
    <nav className="ev-rail-nav" aria-label={d.stagesLabel}>
      {STAGE_SECTIONS.map((section, index) => (
        <button
          key={section}
          type="button"
          className="ev-rail-nav__item"
          data-active={index === activeIndex}
          onClick={() => {
            document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span>{d.stages[index]}</span>
          <span className="ev-rail-nav__dot" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
