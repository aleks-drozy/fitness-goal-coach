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

const FADE_UP = {
  hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)" },
};

const HERO_STAGGER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.04 },
  },
};

const SPRING = { type: "spring" as const, duration: 0.55, bounce: 0 };
const SPRING_FAST = { type: "spring" as const, duration: 0.45, bounce: 0 };

export default function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-24 pt-28">
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
            className="mb-6 text-[0.6875rem] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--primary)" }}
          >
            Judo · BJJ · Competition Prep
          </motion.p>

          {/* Headline — left-aligned, poster-weight */}
          <motion.h1
            variants={reduce ? undefined : FADE_UP}
            transition={reduce ? { duration: 0 } : SPRING}
            className="mb-6 font-semibold leading-[1.04]"
            style={{
              fontSize: "clamp(2.75rem, 10vw, 5.5rem)",
              letterSpacing: "-0.04em",
              color: "var(--foreground)",
            }}
          >
            Cut weight.
            <br />
            Peak on fight day.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={reduce ? undefined : FADE_UP}
            transition={reduce ? { duration: 0 } : SPRING}
            className="mb-10 text-[1rem] leading-[1.7] sm:text-[1.0625rem]"
            style={{ color: "var(--muted-foreground)", maxWidth: "34rem" }}
          >
            Competition prep for judo and BJJ athletes: weight cut protocol,
            training plan, and weekly check-ins built around your weight class
            and tournament date.
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
      <section
        className="border-t px-6 py-20"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto w-full max-w-2xl">
          {/* Asymmetric: feature 01 spans full width as a lead, 02+03 sit below */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={reduce ? { duration: 0 } : SPRING}
            className="mb-14"
          >
            <p
              className="mb-2 font-semibold tabular-nums"
              style={{ fontSize: "0.6875rem", letterSpacing: "0.12em", color: "var(--primary)" }}
            >
              {FEATURES[0].n}
            </p>
            <h3
              className="mb-3 font-semibold leading-snug"
              style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", letterSpacing: "-0.025em", color: "var(--foreground)" }}
            >
              {FEATURES[0].title}
            </h3>
            <p
              className="text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--muted-foreground)", maxWidth: "32rem" }}
            >
              {FEATURES[0].body}
            </p>
          </motion.div>

          {/* Divider */}
          <div className="mb-14 h-px" style={{ background: "var(--border)" }} />

          {/* 02 + 03 as left-aligned rows */}
          <div className="space-y-10">
            {FEATURES.slice(1).map((f, i) => (
              <motion.div
                key={f.n}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", duration: 0.5, bounce: 0, delay: i * 0.06 }
                }
                className="grid gap-4 sm:grid-cols-[5rem_1fr]"
              >
                <p
                  className="font-semibold tabular-nums"
                  style={{ fontSize: "0.6875rem", letterSpacing: "0.12em", color: "var(--primary)", paddingTop: "0.2em" }}
                >
                  {f.n}
                </p>
                <div>
                  <h3
                    className="mb-2 text-[1rem] font-semibold leading-snug"
                    style={{ color: "var(--foreground)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-[0.9rem] leading-relaxed"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {f.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
            className="mt-16 text-[0.8125rem] font-medium"
            style={{ color: "var(--muted-foreground)" }}
          >
            Built for competitive judoka and BJJ athletes.{" "}
            <span style={{ color: "var(--primary)" }}>Free to start.</span>
          </motion.p>
        </div>
      </section>

      {/* ─── SECONDARY CTA ─────────────────────────────────── */}
      <section
        className="border-t px-6 py-24"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={reduce ? { duration: 0 } : SPRING}
          className="mx-auto max-w-2xl space-y-5"
        >
          <h2
            className="font-semibold leading-tight"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            Your next competition is closer than you think.
          </h2>

          <p
            className="text-[0.9375rem] leading-relaxed"
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
