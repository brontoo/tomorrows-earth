import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

/** Consistent section header: eyebrow, heading, optional lead. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "start",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(align === "center" && "mx-auto max-w-3xl text-center", className)}
    >
      {eyebrow && <p className="ev-eyebrow">{eyebrow}</p>}
      <h2 className="ev-h2">{title}</h2>
      {lead && <p className="ev-lead">{lead}</p>}
    </motion.header>
  );
}

export function Section({
  id,
  children,
  className,
  tone = "default",
}: {
  id: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "deep" | "quiet";
}) {
  return (
    <section
      id={id}
      className={cn(
        "ev-section relative",
        tone === "deep" && "bg-[oklch(0.115_0.035_270)]",
        tone === "quiet" && "bg-[oklch(0.155_0.042_266)]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          "bg-[linear-gradient(90deg,transparent,oklch(0.8_0.08_200/0.22),transparent)]",
        )}
        aria-hidden="true"
      />
      {children}
    </section>
  );
}

/** Standard fade-and-rise for section content. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
