"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { bmi, tdee, bodyFat, idealWeight, activityOptions } from "@/lib/calculators";

interface Results {
  bmiValue: number; bmiCategory: string;
  tdeeValue: number;
  bfValue: number | null;
  idealMin: number; idealMax: number;
}

export default function CalculatorPage() {
  const reduced = useReducedMotion();
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [activity, setActivity] = useState(1.55);
  const [results, setResults] = useState<Results | null>(null);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    const h = parseFloat(height), w = parseFloat(weight),
          a = parseInt(age), n = parseFloat(neck), wst = parseFloat(waist);
    if (!h || !w || !a || !n || !wst) return;

    const b = bmi(w, h);
    const t = tdee(w, h, a, sex, activity);
    const bf = bodyFat(sex, h, wst, n, sex === "female" ? parseFloat(hips) : undefined);
    const ideal = idealWeight(h, sex);

    setResults({ bmiValue: b.value, bmiCategory: b.category, tdeeValue: t, bfValue: bf, idealMin: ideal.min, idealMax: ideal.max });
  }

  const fadeUp = {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.4, bounce: 0 } },
  };

  const bmiColor = results
    ? results.bmiCategory === "Normal" ? "var(--success)"
    : results.bmiCategory === "Underweight" ? "var(--warn)"
    : "var(--destructive)"
    : "var(--foreground)";

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Tools</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Body stats calculator</h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            BMI, TDEE, body fat %, and ideal weight — all client-side, no data sent anywhere.
          </p>
        </div>

        <form onSubmit={calculate} className="space-y-5 rounded-[var(--r-card)] border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="space-y-1.5">
            <Label>Sex</Label>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className="flex-1 rounded-[var(--r-button)] border py-2 text-[0.875rem] font-medium transition-colors"
                  style={{
                    borderColor: sex === s ? "var(--primary)" : "var(--border)",
                    background: sex === s ? "var(--accent-dim)" : "transparent",
                    color: sex === s ? "var(--primary)" : "var(--muted-foreground)",
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" min="16" max="99" placeholder="28" value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" min="100" max="250" placeholder="178" value={height} onChange={(e) => setHeight(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" min="30" max="300" step="0.1" placeholder="78" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="neck">Neck (cm)</Label>
              <Input id="neck" type="number" min="20" max="60" step="0.5" placeholder="38" value={neck} onChange={(e) => setNeck(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input id="waist" type="number" min="40" max="200" step="0.5" placeholder="84" value={waist} onChange={(e) => setWaist(e.target.value)} required />
            </div>
            {sex === "female" && (
              <div className="space-y-1.5">
                <Label htmlFor="hips">Hips (cm)</Label>
                <Input id="hips" type="number" min="50" max="200" step="0.5" placeholder="96" value={hips} onChange={(e) => setHips(e.target.value)} required={sex === "female"} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Activity level</Label>
            <div className="space-y-1">
              {activityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActivity(opt.value)}
                  className="w-full rounded-[var(--r-button)] border px-3 py-2 text-left text-[0.8125rem] transition-colors"
                  style={{
                    borderColor: activity === opt.value ? "var(--primary)" : "var(--border)",
                    background: activity === opt.value ? "var(--accent-dim)" : "transparent",
                    color: activity === opt.value ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">Calculate</Button>
        </form>

        <AnimatePresence mode="wait">
          {results && (
            <motion.div
              key="results"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
              className="space-y-3"
            >
              {[
                { label: "BMI", value: `${results.bmiValue}`, sub: results.bmiCategory, color: bmiColor },
                { label: "TDEE (daily calories)", value: `${results.tdeeValue} kcal`, sub: "Maintenance calories", color: "var(--foreground)" },
                ...(results.bfValue !== null ? [{ label: "Body fat %", value: `${results.bfValue}%`, sub: "US Navy formula", color: "var(--foreground)" }] : []),
                { label: "Ideal weight range", value: `${results.idealMin}–${results.idealMax} kg`, sub: "Devine formula", color: "var(--foreground)" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="flex items-center justify-between rounded-[var(--r-card)] border p-4"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <div>
                    <p className="text-[0.75rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{item.label}</p>
                    <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>{item.sub}</p>
                  </div>
                  <p className="text-xl font-bold tracking-tight" style={{ color: item.color }}>{item.value}</p>
                </motion.div>
              ))}

              <motion.div variants={fadeUp} className="pt-2">
                <Link href="/coach/onboarding" className={buttonVariants({ variant: "outline", size: "lg" }) + " w-full"}>
                  Use these results in my plan →
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
