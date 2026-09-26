/**
 * Parallax landscape plates. Each is a self-contained SVG that stretches to
 * its container, so they layer into a believable horizon without any image
 * assets.
 */

export function FarRange() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="ev-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.3 0.05 250 / 0.85)" />
          <stop offset="100%" stopColor="oklch(0.17 0.045 258 / 0.95)" />
        </linearGradient>
        <linearGradient id="ev-far2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.24 0.05 252 / 0.95)" />
          <stop offset="100%" stopColor="oklch(0.13 0.04 266)" />
        </linearGradient>
      </defs>
      {/* back range */}
      <path
        d="M0 300 90 214l58 52 76-104 92 122 62-64 74 82 84-140 96 150 70-58 82 84 74-116 92 132 66-52 80 76 74-92 90 104 68-46 96 68v92H0Z"
        fill="url(#ev-far)"
        opacity="0.7"
      />
      {/* front range */}
      <path
        d="M0 340 110 268l70 46 88-88 76 96 96-58 82 74 92-108 78 118 84-52 76 66 88-92 74 106 82-64 74 58 90-84 80 78 80-52 76 64v106H0Z"
        fill="url(#ev-far2)"
      />
      {/* haze */}
      <path d="M0 372c160-18 320 14 480-4s320-26 480-6 320 22 480 4v54H0Z" fill="oklch(0.18 0.05 252 / 0.6)" />
    </svg>
  );
}

export function Dunes() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="ev-dune" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.4 0.07 74 / 0.7)" />
          <stop offset="100%" stopColor="oklch(0.24 0.06 62 / 0.95)" />
        </linearGradient>
      </defs>
      <path d="M0 168c150-52 300 30 450 4s280-64 440-24 320 58 550 6v106H0Z" fill="url(#ev-dune)" opacity="0.75" />
      <path d="M0 210c180-38 320 26 500 6s300-44 470-8 300 40 470 8v44H0Z" fill="oklch(0.3 0.07 66 / 0.9)" />
      <path d="M0 238c200-24 340 18 520 4s300-24 470 2 300 18 450 2v14H0Z" fill="oklch(0.22 0.055 260)" />
    </svg>
  );
}

export function NearShore() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="ev-shore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.45 0.09 200 / 0.75)" />
          <stop offset="100%" stopColor="oklch(0.16 0.05 250)" />
        </linearGradient>
      </defs>
      <path d="M0 120c120-26 220 20 340 6s240-40 360-16 240 34 360 12 220-20 380 4v84H0Z" fill="url(#ev-shore)" opacity="0.6" />
      <g stroke="oklch(0.86 0.12 196)" strokeWidth="1.4" fill="none" opacity="0.28">
        <path d="M0 150c130-18 240 14 360 4s250-24 360-6 250 20 360 4 240-10 360 6" />
        <path d="M0 172c140-14 250 10 370 2s250-16 360-2 250 12 360 2 240-6 350 4" />
      </g>
    </svg>
  );
}

/** Foreground vegetation — the closest parallax plate. */
export function ForegroundFlora() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 340"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ev-flora" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.16 0.045 165 / 0.55)" />
          <stop offset="100%" stopColor="oklch(0.09 0.03 268)" />
        </linearGradient>
      </defs>

      {/* left cluster */}
      <g fill="url(#ev-flora)">
        <path d="M0 340V196c34 6 58 30 66 66 6 28 4 54-4 78Z" />
        <path d="M74 340c-6-52 14-104 58-136-14 46-12 92 6 136Z" />
        <path d="M132 340c2-40 24-74 62-88-22 30-28 62-20 88Z" />
        <path d="M0 340V228c22 10 36 34 38 62 2 22 0 38-4 50Z" opacity="0.8" />
        {/* right cluster mirrored */}
        <path d="M1440 340V196c-34 6-58 30-66 66-6 28-4 54 4 78Z" />
        <path d="M1366 340c6-52-14-104-58-136 14 46 12 92-6 136Z" />
        <path d="M1308 340c-2-40-24-74-62-88 22 30 28 62 20 88Z" />
        <path d="M1440 340V228c-22 10-36 34-38 62-2 22 0 38 4 50Z" opacity="0.8" />
      </g>

      {/* grass tufts along the base */}
      <g stroke="url(#ev-flora)" strokeWidth="3" strokeLinecap="round" fill="none">
        {Array.from({ length: 26 }, (_, i) => {
          const x = 12 + i * 55;
          const h = 26 + ((i * 37) % 30);
          return <path key={i} d={`M${x} 340c2-${h} 8-${h * 0.7} 12-${h * 0.4}`} />;
        })}
      </g>
    </svg>
  );
}
