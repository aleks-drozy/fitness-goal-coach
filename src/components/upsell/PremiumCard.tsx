"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const features = [
  "Detailed weekly training plan built around your goal",
  "Nutrition guidance with calorie and protein targets",
  "Weekly check-ins with updated timeline",
  "Recovery and sleep recommendations",
  "Injury-aware exercise modifications",
  "Judo S&C integration: strength work built around your mat sessions",
  "Plan adjustments as your progress changes",
];

export function PremiumCard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }
    setJoined(true);
  }

  return (
    <div
      className="rounded-[var(--r-card)] border overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="px-6 py-6 space-y-2" style={{ background: "var(--accent-dim)" }}>
        <p
          className="text-[0.6875rem] font-medium tracking-[0.08em] uppercase"
          style={{ color: "var(--primary)" }}
        >
          Premium Coaching
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}
          >
            $9
          </span>
          <span className="text-base" style={{ color: "var(--muted-foreground)" }}>/month</span>
        </div>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Launching soon. Join the waitlist for early access.
        </p>
      </div>

      <ul className="px-6 py-5 space-y-3.5 border-t" style={{ borderColor: "var(--border)" }}>
        {features.map((f) => (
          <li key={f} className="flex gap-3 text-sm items-start">
            <span
              className="shrink-0 mt-px font-bold text-base leading-none"
              style={{ color: "var(--success)" }}
            >
              ✓
            </span>
            <span style={{ color: "var(--muted-foreground)", lineHeight: "1.55" }}>{f}</span>
          </li>
        ))}
      </ul>

      <div className="px-6 pb-6 pt-1">
        {joined ? (
          <div
            className="rounded-[var(--r-card)] border px-4 py-4 text-center"
            style={{ borderColor: "var(--success)", background: "var(--success-dim)" }}
          >
            <p className="text-[0.875rem] font-medium" style={{ color: "var(--success)" }}>
              You&apos;re on the list.
            </p>
            <p className="text-[0.8125rem] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              We&apos;ll email you when Premium launches.
            </p>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && (
              <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>{error}</p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Joining…" : "Join waitlist for early access"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
