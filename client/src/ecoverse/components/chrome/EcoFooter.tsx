import { Link } from "wouter";
import { useI18n, LOCALES } from "../../i18n";
import { EcoVerseWordmark } from "../brand/EcoVerseLogo";
import { cn } from "../../lib/utils";

const LINKS = [
  { href: "#vision", key: "about" },
  { href: "#game-loop", key: "howItWorks" },
  { href: "#safety", key: "safety" },
  { href: "#code", key: "privacy" },
  { href: "#accessibility", key: "accessibility" },
  { href: "mailto:explorers@ecoverse.ae", key: "contact" },
] as const;

export default function EcoFooter() {
  const { d, locale, setLocale } = useI18n();

  return (
    <footer className="relative mt-10 border-t border-ev-line bg-[oklch(0.1_0.032_272)]">
      {/* accessibility statement target — also the a11y summary */}
      <section
        id="accessibility"
        className="ev-narrow border-b border-ev-line py-10"
        aria-labelledby="a11y-heading"
      >
        <h2 id="a11y-heading" className="ev-kicker">
          {d.footer.accessibility}
        </h2>
        <p className="ev-note mt-3">
          {d.hero.gesture.intro} {d.a11y.reduceMotion} — {d.footer.missionNote}
        </p>
      </section>

      <div className="ev-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <EcoVerseWordmark markSize={40} />
          <p className="ev-lead !mt-4 !text-sm">{d.brand.tagline}</p>
          <p className="ev-note mt-2">{d.footer.tagline}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link href="/login" className="ev-btn ev-btn--ghost ev-btn--sm">
              {d.footer.studentSignIn}
            </Link>
            <Link href="/login" className="ev-btn ev-btn--ghost ev-btn--sm">
              {d.footer.teacherSignIn}
            </Link>
          </div>
        </div>

        <nav aria-label="Footer">
          <p className="ev-kicker">{d.footer.about}</p>
          <ul className="mt-4 grid gap-2.5">
            {LINKS.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  className="text-sm text-ev-mist no-underline transition-colors hover:text-ev-chalk"
                >
                  {d.footer[link.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="ev-kicker">{d.footer.language}</p>
          <div
            className="mt-4 inline-flex rounded-full border border-ev-line p-1"
            role="group"
            aria-label={d.footer.language}
          >
            {LOCALES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLocale(option.id)}
                aria-pressed={locale === option.id}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                  locale === option.id
                    ? "bg-ev-aqua text-[oklch(0.16_0.04_250)]"
                    : "text-ev-mist hover:text-ev-chalk",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="ev-note mt-6">{d.footer.missionNote}</p>
        </div>
      </div>

      <div className="ev-shell flex flex-col gap-3 border-t border-ev-line py-6 text-xs text-ev-haze sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} EcoVerse. {d.footer.rights}
        </p>
        <p className="ev-brand-text" style={{ letterSpacing: "0.16em" }}>
          {d.brand.claim.join(" ")}
        </p>
      </div>
    </footer>
  );
}
