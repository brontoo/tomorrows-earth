import { useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";
import { cn } from "../../lib/utils";

type Rarity = "common" | "rare" | "epic" | "legendary";
type Group = "action" | "world" | "skill" | "team" | "secret" | "legendary";

const RARITY_STYLE: Record<Rarity, { a: string; b: string; glow: string; text: string }> = {
  common: { a: "oklch(0.62 0.07 220)", b: "oklch(0.34 0.05 250)", glow: "oklch(0.7 0.07 220 / 0.5)", text: "var(--color-ev-mist)" },
  rare: { a: "oklch(0.72 0.12 205)", b: "oklch(0.3 0.07 250)", glow: "oklch(0.75 0.12 205 / 0.55)", text: "var(--color-ev-aqua)" },
  epic: { a: "oklch(0.75 0.16 300)", b: "oklch(0.3 0.09 280)", glow: "oklch(0.72 0.16 300 / 0.6)", text: "oklch(0.82 0.13 305)" },
  legendary: { a: "oklch(0.84 0.15 88)", b: "oklch(0.32 0.08 66)", glow: "oklch(0.85 0.15 88 / 0.62)", text: "var(--color-ev-amber)" },
};

const FILTERS: Group[] = ["action", "world", "skill", "team", "legendary", "secret"];

export default function BadgeVault() {
  const { d, fmt, locale } = useI18n();
  const [group, setGroup] = useState<Group | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const badges = d.content.badges.filter((badge) => group === "all" || badge.group === group);
  const unlockedCount = d.content.badges.filter((badge) => badge.unlocked).length;
  const openBadge = d.content.badges.find((badge) => badge.id === openId);
  const openSecret = Boolean(openBadge && "secret" in openBadge && openBadge.secret) && !openBadge?.unlocked;

  return (
    <Section id="badges">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.rewards.badges.name}
          title={d.badges.heading}
          lead={d.badges.subheading}
        />

        {/* -------------------------------------------------------- filters */}
        <Reveal className="mt-9 flex flex-wrap items-center gap-2">
          <FilterChip active={group === "all"} onClick={() => setGroup("all")}>
            {d.badges.all}
          </FilterChip>
          {FILTERS.map((key) => (
            <FilterChip key={key} active={group === key} onClick={() => setGroup(key)}>
              {d.badges.groups[key]}
            </FilterChip>
          ))}
          <span className="ev-kicker ev-num ms-auto">
            {fmt(d.badges.collection, { unlocked: unlockedCount, total: d.content.badges.length })}
          </span>
        </Reveal>

        {/* ---------------------------------------------------------- vault */}
        <Reveal className="mt-9">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {badges.map((badge, index) => {
              const rarity = (badge.rarity as Rarity) in RARITY_STYLE ? (badge.rarity as Rarity) : "common";
              const style = RARITY_STYLE[rarity];
              const secret = "secret" in badge && Boolean(badge.secret) && !badge.unlocked;
              const open = openId === badge.id;
              return (
                <motion.li
                  key={badge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.86 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: (index % 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="grid justify-items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : badge.id)}
                    aria-expanded={open}
                    aria-label={`${badge.unlocked ? badge.name : secret ? d.badges.secretLocked : badge.name} — ${d.badges.inspect}`}
                    className="ev-badge"
                    data-locked={!badge.unlocked}
                    style={
                      {
                        "--badge-a": style.a,
                        "--badge-b": style.b,
                        "--badge-glow": badge.unlocked ? style.glow : "transparent",
                      } as CSSProperties
                    }
                  >
                    <span className="ev-badge__inner">
                      <span className="ev-badge__glyph" aria-hidden="true">
                        {badge.unlocked ? badge.glyph : secret ? "?" : "◇"}
                      </span>
                      <span className="ev-badge__name" style={{ color: badge.unlocked ? style.text : undefined }}>
                        {badge.unlocked ? badge.name : secret ? d.badges.secretName : badge.name}
                      </span>
                    </span>
                    {secret && (
                      <span className="ev-badge__lock" aria-hidden="true">
                        <Lock size={11} />
                      </span>
                    )}
                  </button>
                  <span className="ev-kicker ev-num" style={{ color: badge.unlocked ? style.text : undefined }}>
                    {d.badges.rarity[rarity]}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </Reveal>

        {/* ------------------------------------------------------ detail card */}
        <AnimatePresence>
          {openBadge && (
            <motion.div
              key={openBadge.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="ev-panel mt-10 grid gap-6 p-7 sm:grid-cols-[auto_1fr]"
            >
              <span
                className="ev-badge !h-24 !w-24 !p-0"
                data-locked={!openBadge.unlocked}
                aria-hidden="true"
              >
                <span className="ev-badge__inner">
                  <span className="ev-badge__glyph">
                    {openBadge.unlocked ? openBadge.glyph : openSecret ? "?" : "◇"}
                  </span>
                </span>
              </span>
              <div>
                <p className="ev-kicker">{d.badges.groups[openBadge.group as Group]}</p>
                <h3 className="ev-display mt-1 text-2xl text-ev-chalk">
                  {openSecret ? d.badges.secretLocked : openBadge.name}
                </h3>
                <p className="ev-note mt-2">{openSecret ? d.badges.secretLocked : openBadge.desc}</p>
                <p className="mt-4 flex items-start gap-2 text-sm text-ev-mist">
                  <Sparkles size={14} className="mt-px shrink-0 text-ev-aqua" aria-hidden="true" />
                  <span>
                    <b className="block text-[0.62rem] uppercase tracking-[0.16em] text-ev-haze">
                      {d.badges.requirement}
                    </b>
                    {openSecret ? "???" : openBadge.requirement}
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("ev-tag transition-colors", active && "ev-tag--active")}
    >
      {children}
    </button>
  );
}
