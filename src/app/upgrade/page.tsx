import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "Competition-anchored AI estimate",
  "Sport-specific timeframe and reasoning",
  "Basic dashboard",
  "Weekly progress logging",
];

const PREMIUM_FEATURES = [
  "Weekly training plan built for your schedule and goals",
  "Day-by-day weight cut protocol",
  "Auto-updated plan when progress deviates",
  "Competition periodization (strength → taper)",
  "Weekly email reminders with competition countdown",
  "Priority support",
];

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-lg space-y-10">

        {/* Header */}
        <div className="text-center space-y-2">
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--primary)" }}
          >
            Pricing
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Upgrade to Premium
          </h1>
          <p className="text-[0.9375rem]" style={{ color: "var(--muted-foreground)" }}>
            Everything you need to cut weight safely and peak on fight day.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Free */}
          <div
            className="rounded-[var(--r-card)] border p-6 space-y-5"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--muted-foreground)" }}>Free</p>
              <p className="mt-1 text-2xl font-semibold">£0</p>
              <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>Forever</p>
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[0.875rem]">
                  <span style={{ color: "var(--success)" }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div
              className="rounded-[var(--r-button)] border px-4 py-2.5 text-center text-[0.875rem] font-medium"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              Current plan
            </div>
          </div>

          {/* Premium */}
          <div
            className="rounded-[var(--r-card)] border p-6 space-y-5"
            style={{ borderColor: "var(--primary)", background: "var(--accent-dim)" }}
          >
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--primary)" }}>Premium</p>
              <div className="mt-1 flex items-baseline gap-1">
                <p className="text-2xl font-semibold">£9</p>
                <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>/month</p>
              </div>
              <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
                or £79/year (save 27%)
              </p>
            </div>
            <ul className="space-y-2">
              {[...FREE_FEATURES, ...PREMIUM_FEATURES].map((f, i) => (
                <li key={f} className="flex items-start gap-2 text-[0.875rem]">
                  <span style={{ color: i < FREE_FEATURES.length ? "var(--success)" : "var(--primary)" }}>✓</span>
                  <span style={{ fontWeight: i >= FREE_FEATURES.length ? 500 : 400 }}>{f}</span>
                </li>
              ))}
            </ul>

            {/* Coming-soon CTA — swap for Stripe Checkout link when billing goes live */}
            <div
              className="rounded-[var(--r-card)] border px-4 py-3 text-center space-y-2"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <p className="text-[0.875rem] font-medium">Billing coming soon</p>
              <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
                Join the early access list and get 3 months free when we launch.
              </p>
              <Link
                href="/waitlist"
                className={cn(buttonVariants({ size: "sm" }), "w-full mt-1")}
              >
                Join early access →
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
          Already have a premium account?{" "}
          <Link href="/dashboard" style={{ color: "var(--primary)" }}>
            Go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
