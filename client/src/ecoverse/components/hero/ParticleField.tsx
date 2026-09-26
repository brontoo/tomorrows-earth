import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../lib/hooks";
import { cn } from "../../lib/utils";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  pulse: number;
  color: string;
};

export type ParticleFieldVariant = "stars" | "motes" | "leaves";

const PALETTES: Record<ParticleFieldVariant, string[]> = {
  stars: ["#eaf4ff", "#bfe6ff", "#9fd8ff"],
  motes: ["#8ff0e4", "#7cd4ff", "#a8f0c0", "#ffd79a"],
  leaves: ["#7ce0a8", "#5fc98d", "#9fe8c0"],
};

/**
 * Lightweight 2D particle atmosphere. Pauses when off-screen or when the tab
 * is hidden, and renders a single static frame under reduced-motion.
 */
export default function ParticleField({
  count,
  variant = "stars",
  className,
  converge = false,
  opacity = 1,
}: {
  count: number;
  variant?: ParticleFieldVariant;
  className?: string;
  /** Ease particles toward the centre — used when the portal is charged. */
  converge?: boolean;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const convergeRef = useRef(converge);
  convergeRef.current = converge;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let visible = true;
    let pageVisible = true;

    const palette = PALETTES[variant];
    const isLeaf = variant === "leaves";

    const seed = () => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: isLeaf ? 2 + Math.random() * 3.5 : 0.5 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.16,
        vy: isLeaf ? -0.12 - Math.random() * 0.28 : (Math.random() - 0.5) * 0.1,
        alpha: 0.15 + Math.random() * 0.6,
        pulse: Math.random() * Math.PI * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const drawParticle = (p: Particle) => {
      const twinkle = 0.65 + Math.sin(p.pulse) * 0.35;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha * twinkle));
      ctx.fillStyle = p.color;

      if (isLeaf) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.pulse);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 1.9, p.r * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(drawParticle);
      ctx.globalAlpha = 1;
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      for (const p of particles) {
        p.pulse += 0.012;

        if (convergeRef.current) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          // Ease in rather than snap, so convergence feels like attraction.
          const pull = Math.min(0.9, 26 / dist) * 0.006;
          p.vx += (dx / dist) * pull * 60 * 0.06;
          p.vy += (dy / dist) * pull * 60 * 0.06;
          p.vx *= 0.965;
          p.vy *= 0.965;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap with a soft margin so nothing pops at the edges.
        const m = 14;
        if (p.x < -m) p.x = width + m;
        if (p.x > width + m) p.x = -m;
        if (p.y < -m) p.y = height + m;
        if (p.y > height + m) p.y = -m;

        drawParticle(p);
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    };

    const run = () => {
      if (raf) cancelAnimationFrame(raf);
      if (reduced || !visible || !pageVisible) {
        renderStatic();
        return;
      }
      raf = requestAnimationFrame(step);
    };

    resize();
    run();

    const observer = new ResizeObserver(() => {
      resize();
      if (reduced || !visible || !pageVisible) renderStatic();
    });
    observer.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        run();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      run();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, reduced, variant]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
