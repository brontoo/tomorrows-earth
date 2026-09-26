import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ar } from "./ar";
import { en, type Dictionary } from "./en";

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

export const LOCALES: { id: Locale; label: string; dir: Dir; lang: string }[] = [
  { id: "en", label: "English", dir: "ltr", lang: "en" },
  { id: "ar", label: "العربية", dir: "rtl", lang: "ar" },
];

const DICTS: Record<Locale, Dictionary> = { en, ar };
const STORAGE_KEY = "ecoverse.locale";

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ar") return stored;
  } catch {
    /* localStorage unavailable (private mode) — fall through to browser language */
  }
  return window.navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
}

type I18nValue = {
  locale: Locale;
  dir: Dir;
  isRTL: boolean;
  d: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Replaces `{token}` placeholders. */
  fmt: (template: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function EcoI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const meta = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];

  useEffect(() => {
    const root = document.documentElement;
    root.lang = meta.lang;
    root.dir = meta.dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore persistence failures */
    }
  }, [locale, meta.lang, meta.dir]);

  useEffect(() => {
    const dict = DICTS[locale];
    document.title = dict.meta.title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", dict.meta.description);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const toggleLocale = useCallback(
    () => setLocaleState((current) => (current === "en" ? "ar" : "en")),
    [],
  );

  const fmt = useCallback(
    (template: string, vars?: Record<string, string | number>) => {
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in vars ? String(vars[key]) : match,
      );
    },
    [],
  );

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: meta.dir,
      isRTL: meta.dir === "rtl",
      d: DICTS[locale],
      setLocale,
      toggleLocale,
      fmt,
    }),
    [fmt, locale, meta.dir, setLocale, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside EcoI18nProvider");
  return ctx;
}
