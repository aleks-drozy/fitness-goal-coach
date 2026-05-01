"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    n: "01",
    title: "Safe, structured weight cuts",
    body: "Enter your current weight, target weight class, and competition date. Get a week-by-week cut plan that preserves your strength and sharpness on the mat.",
  },
  {
    n: "02",
    title: "Plans built for grapplers",
    body: "Not generic gym programmes. Your plan accounts for mat sessions, drilling, randori, and recovery, built around your schedule and any injuries.",
  },
  {
    n: "03",
    title: "Stay on track, week by week",
    body: "Log your weight each week. Maken tracks your trajectory, flags when you're off course, and adjusts your plan automatically.",
  },
] as const;

// Jakub Krehel enter recipe: opacity + translate + blur
const FADE_UP = {
  hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)" },
};

const HERO_STAGGER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const SPRING = { type: "spring" as const, duration: 0.55, bounce: 0 };
const SPRING_FAST = { type: "spring" as const, duration: 0.45, bounce: 0 };

export default function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-28 text-center">
        {/* Warm ambient glow from primary hue */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% -5%, var(--accent) 0%, transparent 70%)",
          }}
        />

        <motion.div
          className="mx-auto w-full max-w-2xl"
          variants={HERO_STAGGER}
          initial="hidden"
          animate="show"
        >
          {/* Eyebrow */}
          <motion.p
            variants={reduce ? undefined : FADE_UP}
            transition={reduce ? { duration: 0 } : SPRING_FAST}
            className="mb-7 text-[0.6875rem] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--primary)" }}
          >
            Judo · BJJ · Competition Prep
          </motion.p>

          {/* Headline */}
          <motion.h1
            variants={reduce ? undefined : FADE_UP}
            transition={reduce ? { duration: 0 } : SPRING}
            className="mb-7 font-semibold leading-[1.04]"
            style={{
              fontSize: "clamp(2.5rem, 9.5vw, 5rem)",
              letterSpacing: "-0.035em",
              color: "var(--foreground)",
            }}
          >
            Cut weight.
            {/* Break only on sm+ — on mobile the text wraps naturally */}
            <br className="hidden sm:block" />
            {" "}Peak on fight day.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={reduce ? undefined : FADE_UP}
            transition={reduce ? { duration: 0 } : SPRING}
            className="mx-auto mb-10 text-[1rem] leading-[1.7] sm:text-[1.0625rem]"
            style={{ color: "var(--muted-foreground)", maxWidth: "36rem" }}
          >
            Make weight, fight fresh. Competition prep for judo and BJJ athletes:
            weight cut protocol, training plan, and weekly check-ins built around
            your weight class and tournament date.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            variants={reduce ? undefined : FADE_UP}
            transition={reduce ? { duration: 0 } : SPRING_FAST}
          >
            <Link
              href="/coach"
              className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-[0.9375rem]")}
            >
              Get my competition plan →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-28">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.n}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", duration: 0.5, bounce: 0, delay: i * 0.09 }
              }
              className="relative overflow-hidden rounded-[var(--r-card)] border p-7"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              {/* Large watermark number — differentiates each card */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-3 select-none font-semibold tabular-nums leading-none"
                style={{
                  fontSize: "6.5rem",
                  color: "var(--primary)",
                  opacity: 0.055,
                  letterSpacing: "-0.05em",
                }}
              >
                {f.n}
              </span>

              {/* Small labeled number */}
              <p
                className="mb-4 font-semibold tabular-nums"
                style={{ fontSize: "0.6875rem", letterSpacing: "0.12em", color: "var(--primary)" }}
              >
                {f.n}
              </p>

              <h3
                className="mb-3 text-[0.9375rem] font-semibold leading-snug"
                style={{ color: "var(--foreground)" }}
              >
                {f.title}
              </h3>

              <p
                className="text-[0.875rem] leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Social proof strip */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={
            reduce ? { duration: 0 } : { type: "spring", duration: 0.45, bounce: 0, delay: 0.25 }
          }
          className="mt-12 text-center text-[0.8125rem] font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Built for competitive judoka and BJJ athletes.{" "}
          <span style={{ color: "var(--primary)" }}>Free to start.</span>
        </motion.p>
      </section>

      {/* ─── SECONDARY CTA ─────────────────────────────────── */}
      <section
        className="border-t px-6 py-28 text-center"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={reduce ? { duration: 0 } : SPRING}
          className="mx-auto max-w-xl space-y-6"
        >
          <h2
            className="font-semibold leading-tight"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            Your next competition is closer than you think.
          </h2>

          <p
            className="mx-auto text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--muted-foreground)", maxWidth: "30rem" }}
          >
            Most athletes leave weight management to the last week.
            Start your cut plan now and arrive at weigh-in strong.
          </p>

          <Link href="/coach" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8")}>
            Start for free →
          </Link>
        </motion.div>
      </section>
    </>
  );
}
