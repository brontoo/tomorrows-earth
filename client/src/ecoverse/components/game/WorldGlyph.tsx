import { useId } from "react";
import { cn } from "../../lib/utils";

export type WorldKind =
  | "water"
  | "desert"
  | "forest"
  | "city"
  | "energy"
  | "ocean"
  | "mountains"
  | "waste"
  | "food"
  | "transport"
  | "climate"
  | "community"
  | "innovation";

const PALETTE: Record<WorldKind, { from: string; to: string; accent: string }> = {
  water: { from: "oklch(0.55 0.12 220)", to: "oklch(0.24 0.07 250)", accent: "oklch(0.86 0.12 200)" },
  desert: { from: "oklch(0.72 0.13 72)", to: "oklch(0.3 0.06 60)", accent: "oklch(0.92 0.13 84)" },
  forest: { from: "oklch(0.52 0.13 152)", to: "oklch(0.19 0.05 160)", accent: "oklch(0.83 0.15 152)" },
  city: { from: "oklch(0.56 0.1 250)", to: "oklch(0.2 0.05 262)", accent: "oklch(0.84 0.11 195)" },
  energy: { from: "oklch(0.8 0.14 84)", to: "oklch(0.3 0.06 70)", accent: "oklch(0.93 0.13 88)" },
  ocean: { from: "oklch(0.5 0.13 232)", to: "oklch(0.15 0.05 258)", accent: "oklch(0.79 0.12 205)" },
  mountains: { from: "oklch(0.55 0.07 250)", to: "oklch(0.18 0.04 264)", accent: "oklch(0.79 0.06 220)" },
  waste: { from: "oklch(0.6 0.11 165)", to: "oklch(0.2 0.05 168)", accent: "oklch(0.82 0.14 160)" },
  food: { from: "oklch(0.72 0.13 60)", to: "oklch(0.26 0.06 45)", accent: "oklch(0.9 0.12 70)" },
  transport: { from: "oklch(0.62 0.11 215)", to: "oklch(0.21 0.05 250)", accent: "oklch(0.85 0.12 198)" },
  climate: { from: "oklch(0.66 0.13 30)", to: "oklch(0.24 0.06 265)", accent: "oklch(0.86 0.13 200)" },
  community: { from: "oklch(0.68 0.12 320)", to: "oklch(0.24 0.06 290)", accent: "oklch(0.86 0.12 330)" },
  innovation: { from: "oklch(0.7 0.13 265)", to: "oklch(0.22 0.06 270)", accent: "oklch(0.87 0.12 255)" },
};

/**
 * A miniature environment. Dimensional rather than a flat icon: each scene has
 * its own horizon, depth layering and light source.
 */
export function WorldGlyph({
  kind,
  size = 48,
  className,
  radius = 0.3,
}: {
  kind: WorldKind;
  size?: number;
  className?: string;
  radius?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const sky = `sky-${uid}`;
  const ground = `gnd-${uid}`;
  const c = PALETTE[kind];
  const r = radius * 48;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn("block", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
        <clipPath id={`clip-${uid}`}>
          <rect width="48" height="48" rx={r} />
        </clipPath>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        <rect width="48" height="48" fill={`url(#${sky})`} />

        {kind === "water" && (
          <>
            <circle cx="35" cy="13" r="6" fill={c.accent} opacity="0.35" />
            <path d="M0 30c8-4 14 4 22 0s14-4 26 0v18H0Z" fill={c.accent} opacity="0.4" />
            <path d="M0 37c8-4 14 4 22 0s14-4 26 0v11H0Z" fill={c.accent} opacity="0.7" />
            <circle cx="24" cy="24" r="9" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.55" />
          </>
        )}

        {kind === "ocean" && (
          <>
            <path d="M0 12c6 3 10-3 16 0s10 3 16 0 10 3 16 0v36H0Z" fill={c.accent} opacity="0.22" />
            <path d="M0 24c6 3 10-3 16 0s10 3 16 0 10 3 16 0" stroke={c.accent} strokeWidth="1.6" fill="none" opacity="0.75" />
            <path d="M0 32c6 3 10-3 16 0s10 3 16 0 10 3 16 0" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.4" />
            <path d="M0 40c6 3 10-3 16 0s10 3 16 0 10 3 16 0" stroke={c.accent} strokeWidth="1.2" fill="none" opacity="0.5" />
            <circle cx="13" cy="20" r="2.2" fill="#fff" opacity="0.5" />
          </>
        )}

        {kind === "desert" && (
          <>
            <circle cx="15" cy="13" r="5.5" fill={c.accent} opacity="0.6" />
            <path d="M0 32c10-9 20 4 28-3s14-2 20 3v16H0Z" fill={c.accent} opacity="0.45" />
            <path d="M0 39c9-6 18 3 26-2s15-1 22 2v9H0Z" fill={c.accent} opacity="0.8" />
          </>
        )}

        {kind === "forest" && (
          <>
            <path d="M24 8 15 24h18Z" fill={c.accent} opacity="0.5" />
            <path d="M24 14 12 30h24Z" fill={c.accent} opacity="0.7" />
            <path d="M24 20 9 38h30Z" fill={c.accent} />
            <rect x="22" y="38" width="4" height="10" fill="oklch(0.3 0.07 40)" opacity="0.7" />
          </>
        )}

        {kind === "city" && (
          <>
            <path d="M4 48V22h9v26ZM17 48V12h8v36ZM29 48V28h7v20ZM40 48V18h6v30Z" fill="oklch(0.14 0.04 260)" opacity="0.9" />
            <path d="M4 48V22h9v26Z" fill={c.accent} opacity="0.28" />
            <g fill={c.accent} opacity="0.9">
              <rect x="7" y="27" width="2" height="2" />
              <rect x="10" y="33" width="2" height="2" />
              <rect x="19" y="18" width="2" height="2" />
              <rect x="22" y="26" width="2" height="2" />
              <rect x="19" y="34" width="2" height="2" />
              <rect x="31" y="33" width="2" height="2" />
              <rect x="42" y="24" width="2" height="2" />
              <rect x="42" y="32" width="2" height="2" />
            </g>
            <path d="M0 46h48v2H0Z" fill={c.accent} opacity="0.3" />
          </>
        )}

        {kind === "energy" && (
          <>
            <circle cx="37" cy="12" r="5" fill={c.accent} opacity="0.7" />
            <path d="M0 34h48v14H0Z" fill={c.accent} opacity="0.28" />
            <path d="M6 34 12 14l4 20ZM12 34l6-24 5 24Z" fill={c.accent} opacity="0.85" />
            <rect x="33" y="20" width="1.8" height="14" fill="oklch(0.9 0.06 90)" opacity="0.8" />
            <g fill="oklch(0.95 0.05 90)" opacity="0.8">
              <path d="M34 20 42 22.5 34 25Z" />
              <path d="M34 25 26 22.5 34 20Z" />
            </g>
          </>
        )}

        {kind === "mountains" && (
          <>
            <circle cx="12" cy="12" r="4" fill={c.accent} opacity="0.5" />
            <path d="M0 40 14 18l10 15 7-9 17 16v8H0Z" fill={c.accent} opacity="0.5" />
            <path d="M0 46 18 26l8 10 6-6 16 16v2H0Z" fill={c.accent} opacity="0.85" />
            <path d="M11 15l3 3-3 3-3-3Z" fill="#fff" opacity="0.85" />
          </>
        )}

        {kind === "waste" && (
          <>
            <path d="M24 12a12 12 0 0 1 12 12" stroke={c.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M36 24a12 12 0 0 1-12 12" stroke={c.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M24 36a12 12 0 0 1-12-12" stroke={c.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M12 24a12 12 0 0 1 4-8.8" stroke={c.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="m33.5 20.5 3.5 3.5-4.5 1.5Z" fill={c.accent} />
            <path d="M15 20.5 11.5 24l1.5 4.5 3-4Z" fill={c.accent} />
          </>
        )}

        {kind === "food" && (
          <>
            <circle cx="24" cy="26" r="13" fill="oklch(0.94 0.02 90)" opacity="0.9" />
            <circle cx="24" cy="26" r="8.5" fill={c.to} opacity="0.35" />
            <path d="M24 15v22M13 26h22" stroke={c.from} strokeWidth="1.4" opacity="0.5" />
            <path d="M10 40h28" stroke={c.accent} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </>
        )}

        {kind === "transport" && (
          <>
            <path d="M0 38h48v4H0Z" fill={c.accent} opacity="0.35" />
            <path d="M6 30h36v8H6Z" fill={c.accent} opacity="0.7" />
            <path d="M10 30 15 20h18l5 10Z" fill={c.accent} opacity="0.95" />
            <circle cx="15" cy="38" r="4" fill="oklch(0.16 0.04 260)" />
            <circle cx="33" cy="38" r="4" fill="oklch(0.16 0.04 260)" />
            <circle cx="15" cy="38" r="1.6" fill={c.accent} />
            <circle cx="33" cy="38" r="1.6" fill={c.accent} />
          </>
        )}

        {kind === "climate" && (
          <>
            <circle cx="24" cy="20" r="8" fill={c.accent} opacity="0.75" />
            <g stroke={c.accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
              <path d="M24 5v4M24 31v4M9 20h4M35 20h4M13 9l3 3M35 9l-3 3M13 31l3-3M35 31l-3-3" />
            </g>
            <path d="M0 40c8-4 14 4 22 0s14-4 26 0v8H0Z" fill={c.to} opacity="0.5" />
          </>
        )}

        {kind === "community" && (
          <>
            <g fill={c.accent}>
              <circle cx="24" cy="17" r="5" opacity="0.95" />
              <circle cx="12" cy="21" r="4" opacity="0.7" />
              <circle cx="36" cy="21" r="4" opacity="0.7" />
            </g>
            <path d="M14 40c0-6 4.5-10 10-10s10 4 10 10Z" fill={c.accent} opacity="0.9" />
            <path d="M2 40c0-4.5 3-7.5 7-7.5S16 35.5 16 40ZM32 40c0-4.5 3-7.5 7-7.5S46 35.5 46 40Z" fill={c.accent} opacity="0.5" />
          </>
        )}

        {kind === "innovation" && (
          <>
            <path d="M24 6 14 20h20Z" fill={c.accent} opacity="0.6" />
            <path d="M14 20 9 34h30L34 20Z" fill={c.accent} opacity="0.85" />
            <path d="M9 34h30l-4 8H13Z" fill={c.accent} />
            <circle cx="24" cy="16" r="3" fill="#fff" opacity="0.85" />
          </>
        )}

        {/* depth: top light + bottom vignette on every scene */}
        <rect width="48" height="48" fill="url(#sky)" opacity="0.14" />
        <path d="M0 0h48v18c-12 6-24 6-48 0Z" fill="#fff" opacity="0.07" />
      </g>
      <rect width="48" height="48" rx={r} fill="none" stroke="#fff" strokeOpacity="0.14" />
    </svg>
  );
}
