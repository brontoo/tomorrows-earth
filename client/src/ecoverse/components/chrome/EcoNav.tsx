import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useI18n } from "../../i18n";
import { useScrolled } from "../../lib/hooks";
import { EcoVerseWordmark } from "../brand/EcoVerseLogo";
import { gestureTargetProps } from "../../gesture/useGesture";

export const NAV_LINKS = [
  { id: "portal", key: "home" },
  { id: "game-loop", key: "howItWorks" },
  { id: "real-missions", key: "missions" },
  { id: "rewards", key: "rewards" },
  { id: "impact", key: "impact" },
  { id: "safety", key: "safety" },
] as const;

export default function EcoNav({ active }: { active: string }) {
  const { d } = useI18n();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="ev-nav" data-scrolled={scrolled || open}>
        <Link
          href="/ecoverse"
          className="flex items-center no-underline"
          aria-label={d.a11y.brandHome}
          onClick={() => setOpen(false)}
        >
          <EcoVerseWordmark markSize={30} />
        </Link>

        <nav className="ev-nav__links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="ev-nav__link"
              aria-current={active === link.id ? "true" : undefined}
            >
              {d.nav[link.key]}
            </a>
          ))}
        </nav>

        <div className="ev-nav__actions">
          <Link
            href="/login"
            className="ev-nav__link hidden sm:block"
            {...gestureTargetProps("nav-signin")}
          >
            {d.nav.signIn}
          </Link>
          <Link
            href="/missions"
            className="ev-btn ev-btn--sm ev-nav__cta"
            {...gestureTargetProps("nav-enter")}
          >
            {d.nav.enter}
          </Link>
          <button
            type="button"
            className="ev-nav__burger"
            aria-expanded={open}
            aria-label={open ? d.nav.closeMenu : d.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ev-mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <nav aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="ev-mobile__link"
                  onClick={() => setOpen(false)}
                >
                  {d.nav[link.key]}
                </a>
              ))}
              <div className="mt-8 flex flex-col gap-3">
                <Link href="/missions" className="ev-btn" onClick={() => setOpen(false)}>
                  {d.nav.enter}
                </Link>
                <Link href="/login" className="ev-btn ev-btn--ghost" onClick={() => setOpen(false)}>
                  {d.nav.signIn}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
