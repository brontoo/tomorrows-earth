import { useId } from "react";
import { cn } from "../../lib/utils";

/**
 * EcoVerse mark: an orbit ring with a tilted orbital path, a central leaf
 * form and three connected nodes — nature, exploration, technology and
 * interconnected systems in one glyph.
 */
export function EcoVerseMark({ className, size = 40 }: { className?: string; size?: number }) {
  const uid = useId().replace(/:/g, "");
  const ring = `ring-${uid}`;
  const glow = `glow-${uid}`;
  const leaf = `leaf-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={cn("shrink-0", className)}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={ring} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-ev-aqua)" />
          <stop offset="0.52" stopColor="var(--color-ev-teal-lit)" />
          <stop offset="1" stopColor="var(--color-ev-emerald-lit)" />
        </linearGradient>
        <linearGradient id={leaf} x1="13" y1="27" x2="27" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-ev-emerald)" />
          <stop offset="1" stopColor="var(--color-ev-emerald-lit)" />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* outer orbit ring */}
      <circle cx="20" cy="20" r="16.4" stroke={`url(#${ring})`} strokeWidth="1.6" opacity="0.9" />

      {/* tilted orbital path */}
      <ellipse
        cx="20"
        cy="20"
        rx="18.6"
        ry="7.4"
        stroke={`url(#${ring})`}
        strokeWidth="1.1"
        strokeDasharray="3.2 4.4"
        opacity="0.55"
        transform="rotate(-28 20 20)"
      />

      {/* network chords — interconnected systems */}
      <g stroke={`url(#${ring})`} strokeWidth="0.9" opacity="0.32">
        <path d="M20 4.2 L34.6 13.4 L24.4 27.6" />
        <path d="M20 4.2 L6.2 27.4 L34.6 13.4" />
      </g>

      {/* nodes */}
      <g fill="var(--color-ev-chalk)">
        <circle cx="20" cy="4.2" r="1.75" />
        <circle cx="34.6" cy="13.4" r="1.55" />
        <circle cx="6.2" cy="27.4" r="1.55" />
      </g>
      <circle cx="20" cy="4.2" r="3.4" fill={`url(#${ring})`} opacity="0.28" />

      {/* central leaf form */}
      <g filter={`url(#${glow})`}>
        <path
          d="M13.4 27.2C9.8 20.6 12.6 12.4 27.4 11.2 27.4 21.6 22.4 27.2 13.4 27.2Z"
          fill={`url(#${leaf})`}
        />
        <path
          d="M13.4 27.2 27.4 11.2"
          stroke="oklch(0.16 0.05 160 / 0.75)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M17.6 23.4c1.9-.5 3.2-1.7 4.1-3.3M20.4 20.2c1.8-.4 3.3-1.4 4.4-2.8"
          stroke="oklch(0.16 0.05 160 / 0.55)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </g>
      <path d="M13.4 27.2 10.4 30.2" stroke="var(--color-ev-emerald)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The wordmark. `Eco` reads as the natural half, `Verse` as the explored
 * half, bridged by a single gradient.
 */
export function EcoVerseWordmark({
  className,
  markClassName,
  markSize = 34,
  showMark = true,
}: {
  className?: string;
  markClassName?: string;
  markSize?: number;
  showMark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark && <EcoVerseMark size={markSize} className={markClassName} />}
      <span className="ev-brand-text text-[1.35em] leading-none">
        <span className="text-ev-chalk">Eco</span>
        <span className="ev-gradient-text">Verse</span>
      </span>
    </span>
  );
}
