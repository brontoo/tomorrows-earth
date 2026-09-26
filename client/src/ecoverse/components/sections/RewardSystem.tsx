import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Lock, Sparkles, Star, Ticket } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal, Section, SectionHeading } from "./Section";
import { useCountUp } from "../../lib/hooks";

/** The four independent reward systems. */
export default function RewardSystem() {
  const { d, fmt } = useI18n();
  const xp = d.rewards.xp;
  const percent = Math.round((xp.total / xp.goal) * 100);
  const { ref: countRef, display } = useCountUp(xp.total);

  const [tokens, setTokens] = useState<number>(d.rewards.tokens.count);
  const [hintOpen, setHintOpen] = useState(false);

  const spendToken = () => {
    if (tokens < 1) return;
    setTokens((n) => n - 1);
    setHintOpen(true);
  };

  return (
    <Section id="rewards" tone="deep">
      <div className="ev-shell">
        <SectionHeading
          eyebrow={d.labels.reward}
          title={d.rewards.heading}
          lead={d.rewards.subheading}
          align="center"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ------------------------------------------------- Eco XP + bars */}
          <Reveal>
            <div className="ev-panel p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="ev-kicker">{xp.name}</p>
                <p className="ev-display text-lg text-ev-chalk">{xp.title}</p>
              </div>

              <p className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.4rem,7vw,3.6rem)] font-bold leading-none text-ev-chalk">
                <span ref={countRef}>{display.toLocaleString()}</span>
                <span className="ms-2 text-base font-semibold text-ev-haze">
                  / {xp.goal.toLocaleString()} {xp.name}
                </span>
              </p>

              <div
                className="ev-xp mt-6"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={xp.name}
              >
                <motion.span
                  className="ev-xp__fill"
                  initial={{ inlineSize: 0 }}
                  whileInView={{ inlineSize: `${percent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="ev-note mt-2">{xp.desc}</p>

              {/* -------------------------------------------- badge strip */}
              <div className="mt-7 border-t border-ev-line pt-6">
                <p className="ev-kicker">{d.rewards.badges.name}</p>
                <p className="ev-note mt-1.5">{d.rewards.badges.desc}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {d.content.rewardBadges.map((badge) => (
                    <li key={badge.name}>
                      <span
                        className="ev-tag"
                        data-earned={badge.unlocked}
                        style={
                          badge.unlocked
                            ? { color: "var(--color-ev-amber)", borderColor: "color-mix(in oklch, var(--color-ev-amber) 45%, transparent)" }
                            : { color: "var(--color-ev-haze)" }
                        }
                      >
                        {badge.unlocked ? (
                          <Star size={11} aria-hidden="true" />
                        ) : (
                          <Lock size={11} aria-hidden="true" />
                        )}
                        {badge.name}
                        {!badge.unlocked && <span className="ev-sr-only"> — {d.rewards.badges.locked}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* -------------------------------------- help tokens + world unlocks */}
          <div className="grid content-start gap-6">
            <Reveal delay={0.08}>
              <div className="ev-panel p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="ev-kicker">{d.rewards.tokens.name}</p>
                  <span className="ev-token ms-auto">
                    <Ticket size={13} aria-hidden="true" /> {tokens}
                  </span>
                </div>
                <p className="ev-note mt-1.5">{d.rewards.tokens.desc}</p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {d.rewards.tokens.count > 0 &&
                    Array.from({ length: d.rewards.tokens.count }, (_, i) => (
                      <span
                        key={i}
                        className="ev-token"
                        data-spent={i >= tokens}
                        aria-hidden="true"
                      >
                        <Sparkles size={12} />
                      </span>
                    ))}
                  <button
                    type="button"
                    onClick={spendToken}
                    disabled={tokens === 0}
                    className="ev-btn ev-btn--ghost ev-btn--sm ms-auto"
                  >
                    {tokens === 0 ? d.rewards.tokens.empty : d.rewards.tokens.use}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {hintOpen ? (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-5 rounded-xl border border-ev-line bg-black/25 p-4 text-sm leading-relaxed text-ev-mist"
                    >
                      {d.content.tokenHint}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
                <p className="ev-note mt-3">{d.rewards.tokens.spent}</p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="ev-panel p-7">
                <p className="ev-kicker">{d.rewards.worlds.name}</p>
                <p className="ev-note mt-1.5">{d.rewards.worlds.desc}</p>
                <ul className="mt-4 grid gap-2">
                  {d.uae.worlds.map((world) => {
                    const complete = world.status === "complete";
                    const available = world.status === "available";
                    return (
                      <li
                        key={world.name}
                        className="flex items-center gap-3 rounded-xl border border-ev-line bg-black/20 p-3"
                      >
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border"
                          style={{
                            borderColor: complete
                              ? "var(--color-ev-emerald-lit)"
                              : available
                                ? "var(--color-ev-aqua)"
                                : "var(--color-ev-line)",
                            color: complete
                              ? "var(--color-ev-emerald-lit)"
                              : available
                                ? "var(--color-ev-aqua)"
                                : "var(--color-ev-haze)",
                          }}
                        >
                          {complete ? <Star size={13} aria-hidden="true" /> : available ? <Globe2 size={13} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
                        </span>
                        <span className="ev-num w-6 shrink-0 text-xs text-ev-haze">
                          {String(world.n).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-ev-chalk">
                          {world.name}
                        </span>
                        <span className="ev-kicker">
                          {complete
                            ? d.rewards.worlds.complete
                            : available
                              ? d.rewards.worlds.available
                              : d.rewards.worlds.locked}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="ev-note mt-4">{d.rewards.worlds.lockedHint}</p>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.2} className="mt-8">
          <p className="ev-note text-center">
            {fmt(d.badges.collection, {
              unlocked: d.content.badges.filter((badge) => badge.unlocked).length,
              total: d.content.badges.length,
            })}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
