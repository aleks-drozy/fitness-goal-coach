# Full Feature Build — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 9 production features: photo comparison, adaptive plans, cron reminders, body stats calculator, exercise library, weight-cut planner, shareable results card, dark mode, and GDPR account management.

**Architecture:** Protected features live under `src/app/(protected)/`, public tools under `src/app/tools/`, new API routes under `src/app/api/`. All UI follows the existing OKLCH amber token system with framer-motion for animations.

**Tech Stack:** Next.js 16.2.4 App Router, Supabase (auth + DB + Storage), Groq (llama-3.3-70b-versatile + llama-4-scout-17b-16e-instruct for vision), Resend (email), next-themes (dark mode), html2canvas (share card), framer-motion (animations).

---

## Pre-task: Install packages + branch

- [ ] `npm install resend next-themes html2canvas`
- [ ] `npm install --save-dev @types/html2canvas` (if types needed — skip if not found)
- [ ] Add to `.env.local`:
  ```
  CRON_SECRET=generate-a-random-32-char-string-here
  SUPABASE_SERVICE_ROLE_KEY=get-from-supabase-dashboard-settings-api
  RESEND_API_KEY=get-from-resend.com-dashboard
  ```
- [ ] Commit: `chore: install resend, next-themes, html2canvas`

---

## Task 1: Nav component + proxy update

**Files:**
- Create: `src/components/layout/Nav.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/proxy.ts`

- [ ] Create `src/components/layout/Nav.tsx`:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { label: "Calculator", href: "/tools/calculator" },
  { label: "Exercises", href: "/tools/exercises" },
];
const protected_ = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Progress", href: "/progress" },
  { label: "Plan", href: "/plan" },
];

export function Nav() {
  const pathname = usePathname();
  // Hide nav inside wizard
  if (pathname.startsWith("/coach")) return null;

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 border-b"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex size-6 items-center justify-center rounded-full"
            style={{ background: "var(--primary)" }}
          >
            <Zap size={12} fill="var(--primary-foreground)" color="var(--primary-foreground)" />
          </div>
          <span className="text-[0.8125rem] font-semibold">Fitness Coach</span>
        </Link>

        <div className="flex items-center gap-1">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "rounded-[var(--r-button)] px-3 py-1.5 text-[0.8125rem] transition-colors",
                pathname.startsWith(t.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
          <div className="mx-1 h-4 w-px" style={{ background: "var(--border)" }} />
          {protected_.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "rounded-[var(--r-button)] px-3 py-1.5 text-[0.8125rem] transition-colors",
                pathname === t.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] Modify `src/app/layout.tsx` — add `<Nav />` and top padding:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WizardProvider } from "@/context/WizardContext";
import { Nav } from "@/components/layout/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fitness Goal Coach",
  description: "Get a realistic estimate of what your fitness goal may take.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground font-sans antialiased">
        <WizardProvider>
          <Nav />
          <div className="pt-12">{children}</div>
        </WizardProvider>
      </body>
    </html>
  );
}
```

- [ ] Verify `npm run build` passes
- [ ] Commit: `feat: add global nav with tools dropdown`

---

## Task 2: Feature 1 — Photo comparison page

**Files:**
- Create: `src/app/(protected)/progress/photos/page.tsx`
- Create: `src/components/progress/PhotoComparison.tsx`
- Create: `src/app/api/progress/photo-analysis/route.ts`

**Supabase manual steps (before coding):**
1. Dashboard → Storage → New bucket: name `progress-photos`, Public = OFF
2. Dashboard → Storage → progress-photos → Policies → New policy:
   - For SELECT: `(storage.foldername(name))[1] = auth.uid()::text`
   - For INSERT: `(storage.foldername(name))[1] = auth.uid()::text`
   - For DELETE: `(storage.foldername(name))[1] = auth.uid()::text`
3. Run SQL (from spec):
```sql
create table public.photo_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now() not null,
  week1_url text not null,
  current_url text not null,
  analysis text not null,
  revised_estimate text
);
alter table public.photo_analyses enable row level security;
create policy "photo_analyses: own data" on public.photo_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] Create `src/components/progress/PhotoComparison.tsx`:

```tsx
"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AnalysisResult {
  analysis: string;
  revised_estimate: string | null;
}

export function PhotoComparison({ userId }: { userId: string }) {
  const router = useRouter();
  const [week1File, setWeek1File] = useState<File | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [week1Preview, setWeek1Preview] = useState<string | null>(null);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownMsg, setCooldownMsg] = useState<string | null>(null);

  function handleFile(which: "week1" | "current") {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (which === "week1") { setWeek1File(file); setWeek1Preview(url); }
      else { setCurrentFile(file); setCurrentPreview(url); }
    };
  }

  async function handleAnalyze() {
    if (!week1File || !currentFile) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext1 = week1File.name.split(".").pop();
    const ext2 = currentFile.name.split(".").pop();
    const path1 = `${userId}/week1-${Date.now()}.${ext1}`;
    const path2 = `${userId}/current-${Date.now()}.${ext2}`;

    const [up1, up2] = await Promise.all([
      supabase.storage.from("progress-photos").upload(path1, week1File, { upsert: true }),
      supabase.storage.from("progress-photos").upload(path2, currentFile, { upsert: true }),
    ]);

    if (up1.error || up2.error) {
      setError("Upload failed. Check file sizes (max 5MB each).");
      setUploading(false);
      return;
    }

    const { data: url1 } = supabase.storage.from("progress-photos").getPublicUrl(path1);
    const { data: url2 } = supabase.storage.from("progress-photos").getPublicUrl(path2);

    setUploading(false);
    setAnalyzing(true);

    const res = await fetch("/api/progress/photo-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week1Url: url1.publicUrl, currentUrl: url2.publicUrl }),
    });
    const data = await res.json();
    setAnalyzing(false);

    if (!res.ok) {
      if (res.status === 429) setCooldownMsg(data.error);
      else setError(data.error ?? "Analysis failed.");
      return;
    }
    setResult(data);
    router.refresh();
  }

  const bothUploaded = !!week1Preview && !!currentPreview;

  return (
    <div className="space-y-8">
      {/* Upload row */}
      <div className="grid grid-cols-2 gap-4">
        {(["week1", "current"] as const).map((which) => {
          const preview = which === "week1" ? week1Preview : currentPreview;
          const label = which === "week1" ? "Week 1 photo" : "Current photo";
          return (
            <div key={which} className="space-y-2">
              <Label>{label}</Label>
              <label
                className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-[var(--r-card)] border-2 border-dashed overflow-hidden"
                style={{
                  borderColor: preview ? "var(--primary)" : "var(--border)",
                  background: "var(--surface)",
                }}
              >
                {preview ? (
                  <img src={preview} alt={label} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <div className="text-2xl opacity-30">+</div>
                    <p className="text-[0.75rem]" style={{ color: "var(--muted-foreground)" }}>
                      Tap to upload
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFile(which)}
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* Comparison slider */}
      {bothUploaded && (
        <div className="space-y-3">
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--primary)" }}
          >
            Comparison
          </p>
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-[var(--r-card)] select-none"
            style={{ touchAction: "none" }}
          >
            {/* Week 1 — base layer */}
            <img
              src={week1Preview!}
              alt="Week 1"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Current — clipped layer */}
            <img
              src={currentPreview!}
              alt="Current"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
            />
            {/* Drag handle */}
            <div
              className="absolute inset-y-0 w-0.5 -translate-x-1/2"
              style={{
                left: `${sliderValue}%`,
                background: "var(--primary)",
                transition: "left 0ms",
              }}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full border-2 shadow-lg"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--primary)",
                }}
              >
                <span className="text-[0.625rem]" style={{ color: "var(--primary)" }}>⟺</span>
              </div>
            </div>
            {/* Range input for drag */}
            <input
              type="range"
              min={0}
              max={100}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              style={{ WebkitAppearance: "none" }}
            />
            {/* Labels */}
            <div className="absolute bottom-3 left-3 rounded px-2 py-0.5 text-[0.6875rem] font-medium" style={{ background: "oklch(0 0 0 / 50%)", color: "#fff" }}>Week 1</div>
            <div className="absolute bottom-3 right-3 rounded px-2 py-0.5 text-[0.6875rem] font-medium" style={{ background: "oklch(0.72 0.19 58 / 80%)", color: "var(--primary-foreground)" }}>Now</div>
          </div>
        </div>
      )}

      {cooldownMsg && (
        <div className="rounded-[var(--r-input)] border px-3 py-2 text-[0.8125rem]" style={{ borderColor: "var(--warn)", color: "var(--warn)", background: "var(--warn-dim)" }}>
          {cooldownMsg}
        </div>
      )}
      {error && (
        <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>{error}</p>
      )}

      {bothUploaded && !result && (
        <Button size="lg" className="w-full" onClick={handleAnalyze} disabled={uploading || analyzing}>
          {uploading ? "Uploading…" : analyzing ? "Analysing with AI…" : "Analyse my progress"}
        </Button>
      )}

      {result && (
        <div
          className="rounded-[var(--r-card)] border p-6 space-y-4"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>
            AI Analysis
          </p>
          <p className="text-[0.875rem] leading-relaxed whitespace-pre-wrap">{result.analysis}</p>
          {result.revised_estimate && (
            <div className="rounded-[var(--r-input)] border px-3 py-2 text-[0.8125rem]" style={{ borderColor: "var(--border-strong)" }}>
              Revised estimate: <span className="font-medium">{result.revised_estimate}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] Create `src/app/(protected)/progress/photos/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { PhotoComparison } from "@/components/progress/PhotoComparison";

export default async function PhotosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: lastAnalysis } = await supabase
    .from("photo_analyses")
    .select("created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>
            Progress photos
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Photo comparison</h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            Upload two photos for side-by-side comparison and AI body composition analysis. Analysis has a 24-hour cooldown.
          </p>
          {lastAnalysis && (
            <p className="mt-2 text-[0.75rem]" style={{ color: "var(--muted-foreground)" }}>
              Last analysis: {new Date(lastAnalysis.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <PhotoComparison userId={user!.id} />
      </div>
    </div>
  );
}
```

- [ ] Create `src/app/api/progress/photo-analysis/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 24h cooldown check
  const { data: last } = await supabase
    .from("photo_analyses")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last) {
    const hoursSince = (Date.now() - new Date(last.created_at).getTime()) / 3_600_000;
    if (hoursSince < 24) {
      const hoursLeft = Math.ceil(24 - hoursSince);
      return NextResponse.json(
        { error: `Analysis cooldown active. Try again in ${hoursLeft}h.` },
        { status: 429 }
      );
    }
  }

  const { week1Url, currentUrl } = await req.json();
  if (!week1Url || !currentUrl) {
    return NextResponse.json({ error: "Both image URLs required" }, { status: 400 });
  }

  const completion = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a PhD-level personal trainer and sports scientist. You have been provided two progress photos of the same person: an earlier photo (Week 1) and a more recent photo (Current).

Assess the visible body composition changes between the two photos. Be specific about what you can and cannot determine from photos alone. Address: visible muscle definition changes, estimated body fat % change direction, overall physique trajectory.

Then state whether the person appears on track for typical body recomposition goals, and if the visual evidence warrants a revised timeline estimate, provide one (e.g. "6-10 months").

Return ONLY valid JSON (no markdown fences):
{
  "analysis": "3-5 paragraphs of honest, specific, evidence-based analysis",
  "revised_estimate": "X-Y months or null if unchanged"
}`,
          },
          { type: "image_url", image_url: { url: week1Url } },
          { type: "image_url", image_url: { url: currentUrl } },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const raw = (completion.choices[0].message.content ?? "")
    .trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "");

  let parsed: { analysis: string; revised_estimate: string | null };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  await supabase.from("photo_analyses").insert({
    user_id: user.id,
    week1_url: week1Url,
    current_url: currentUrl,
    analysis: parsed.analysis,
    revised_estimate: parsed.revised_estimate,
  });

  return NextResponse.json(parsed);
}
```

- [ ] Add `/progress/photos` link to the progress page:

In `src/app/(protected)/progress/page.tsx`, add after the `<h1>`:
```tsx
<Link href="/progress/photos" className="mt-2 inline-block text-[0.8125rem]" style={{ color: "var(--primary)" }}>
  Photo comparison →
</Link>
```
Add `import Link from "next/link";` at top.

- [ ] `npm run build` — fix any TypeScript errors
- [ ] Commit: `feat: add progress photo comparison page with Groq vision analysis`

---

## Task 3: Feature 2 — Adaptive plan updates

**Files:**
- Modify: `src/app/api/progress/route.ts`
- Modify: `src/components/progress/ProgressForm.tsx`

- [ ] Modify `src/app/api/progress/route.ts` — add plan regeneration after insert. Replace the final `return NextResponse.json(...)` line and the insert block with:

```ts
  // ... (existing insert block stays) ...

  // After successful insert, check last 3 entries for deviation
  let planUpdated = false;

  const { data: last3 } = await supabase
    .from("progress_entries")
    .select("week_number, current_weight")
    .eq("user_id", user.id)
    .order("week_number", { ascending: false })
    .limit(3);

  if (last3 && last3.length >= 2 && estimate && ws) {
    const startWeight = (ws as any)?.onboarding?.weightKg as number | undefined;
    const goalType = (ws as any)?.questionnaire?.goalType as string | undefined;
    const timeframeMax = (estimate as any)?.timeframeMax as number | undefined;

    if (startWeight && timeframeMax) {
      const weeksElapsed = weekNumber;
      const totalWeeks = timeframeMax * 4.33;
      // Expected weight change per week (negative = loss, positive = gain)
      const expectedWeeklyDelta =
        goalType === "fat_loss" ? -0.5 : goalType === "muscle_gain" ? 0.25 : -0.25;
      const expectedWeight = startWeight + expectedWeeklyDelta * weeksElapsed;
      const deviation = Math.abs(currentWeight - expectedWeight) / Math.abs(expectedWeight - startWeight || 1);

      if (deviation > 0.1 && weeksElapsed >= 2) {
        // Regenerate plan
        const planPrompt = `You are an expert fitness coach. A user's progress is deviating from their plan. Update their training plan.

User goal: ${goalType ?? "general fitness"}
Starting weight: ${startWeight}kg
Expected weight at week ${weekNumber}: ${expectedWeight.toFixed(1)}kg
Actual weight: ${currentWeight}kg
Deviation: ${(deviation * 100).toFixed(0)}%

Return ONLY valid JSON (no markdown fences) matching exactly:
{
  "weekly_schedule": [{ "day": "string", "focus": "string", "exercises": ["string"] }],
  "nutrition": { "calories_guidance": "string", "protein_target": "string", "meal_timing": "string" },
  "judo_specific": null,
  "recovery": { "sleep": "string", "active_recovery": "string" }
}`;

        const planCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: planPrompt }],
          temperature: 0.4,
          max_tokens: 2048,
        });

        const planRaw = (planCompletion.choices[0].message.content ?? "")
          .trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

        try {
          const newPlan = JSON.parse(planRaw);
          await supabase.from("fitness_plans").insert({ user_id: user.id, plan: newPlan });
          planUpdated = true;
        } catch {
          // silently fail — plan regeneration is best-effort
        }
      }
    }
  }

  return NextResponse.json({
    ...entry,
    revised_estimate: groqResponse.revised_estimate,
    plan_updated: planUpdated,
  });
```

- [ ] Modify `src/components/progress/ProgressForm.tsx` — handle `plan_updated` in success state. In `handleSubmit`, update the `setSuccess` call:

```ts
    setSuccess({
      on_track: data.on_track,
      revised_estimate: data.revised_estimate,
      ai_feedback: data.ai_feedback,
      plan_updated: data.plan_updated ?? false,
    });
```

Add `plan_updated: boolean` to `SuccessData` interface. Then in the success render, after `revised_estimate` block:

```tsx
{success.plan_updated && (
  <div
    className="rounded-[var(--r-input)] border px-3 py-2.5 text-[0.8125rem]"
    style={{ borderColor: "var(--primary)", background: "var(--accent-dim)" }}
  >
    <span className="font-medium" style={{ color: "var(--primary)" }}>Your plan was automatically updated</span>
    {" — "}
    <a href="/plan" style={{ color: "var(--primary)", textDecoration: "underline" }}>view it at /plan</a>
  </div>
)}
```

- [ ] `npm run build` — fix TypeScript errors
- [ ] Commit: `feat: add adaptive plan regeneration on off-track progress`

---

## Task 4: Feature 3 — Weekly check-in reminder cron

**Files:**
- Create: `src/app/api/cron/weekly-reminder/route.ts`
- Create: `vercel.json`
- Modify: `src/lib/supabase/service.ts` (new service role client)

- [ ] Create `src/lib/supabase/service.ts`:

```ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service role client — NEVER import this in client components or expose to browser
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

- [ ] Create `src/app/api/cron/weekly-reminder/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  // Cron auth guard
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Find users with no progress entry in last 8 days
  const cutoff = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

  // Get all user IDs who have logged recently
  const { data: recentUsers } = await supabase
    .from("progress_entries")
    .select("user_id")
    .gte("created_at", cutoff);

  const recentIds = (recentUsers ?? []).map((r: { user_id: string }) => r.user_id);

  // Get all users from profiles
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id");

  const toRemind = (allProfiles ?? []).filter(
    (p: { id: string }) => !recentIds.includes(p.id)
  );

  if (toRemind.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Get emails from auth.users via admin API
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const remindEmails = users
    .filter((u) => toRemind.some((p: { id: string }) => p.id === u.id))
    .map((u) => u.email)
    .filter(Boolean) as string[];

  let sent = 0;
  for (const email of remindEmails) {
    try {
      await resend.emails.send({
        from: "Fitness Coach <noreply@yourdomain.com>",
        to: email,
        subject: "Time to log your weekly check-in 💪",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px;">How's the week going?</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
              You haven't logged a check-in this week. Even a quick note helps your AI coach track your trajectory and keep your plan on point.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://yourapp.com"}/progress"
               style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Log this week →
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 32px;">
              You're receiving this because you have a Fitness Coach account. 
            </p>
          </div>
        `,
      });
      sent++;
    } catch {
      // continue on individual failures
    }
  }

  return NextResponse.json({ sent });
}
```

- [ ] Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-reminder",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

- [ ] Add `NEXT_PUBLIC_APP_URL` to `.env.local`:
  ```
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

- [ ] `npm run build` — fix any TypeScript errors
- [ ] Commit: `feat: add weekly check-in reminder cron job`

---

## Task 5: Feature 4 — Body stats calculator

**Files:**
- Create: `src/app/tools/calculator/page.tsx`
- Create: `src/lib/calculators.ts`

- [ ] Create `src/lib/calculators.ts`:

```ts
export function bmi(weightKg: number, heightCm: number) {
  const h = heightCm / 100;
  const value = weightKg / (h * h);
  const category =
    value < 18.5 ? "Underweight" :
    value < 25   ? "Normal"      :
    value < 30   ? "Overweight"  : "Obese";
  return { value: +value.toFixed(1), category };
}

export function tdee(
  weightKg: number, heightCm: number, age: number,
  sex: "male" | "female", activity: number
) {
  // Mifflin-St Jeor BMR
  const bmr = sex === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * activity);
}

// US Navy body fat %
export function bodyFat(
  sex: "male" | "female",
  heightCm: number, waistCm: number, neckCm: number, hipsCm?: number
) {
  if (sex === "male") {
    return +(495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450).toFixed(1);
  }
  if (!hipsCm) return null;
  return +(495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450).toFixed(1);
}

// Devine formula ideal weight range
export function idealWeight(heightCm: number, sex: "male" | "female") {
  const inchesOver5ft = Math.max(0, heightCm / 2.54 - 60);
  const base = sex === "male" ? 50 : 45.5;
  const mid = base + 2.3 * inchesOver5ft;
  return { min: +(mid * 0.9).toFixed(1), max: +(mid * 1.1).toFixed(1) };
}

export const activityOptions = [
  { label: "Sedentary (desk job, no exercise)", value: 1.2 },
  { label: "Lightly active (1-3 days/week)", value: 1.375 },
  { label: "Moderately active (3-5 days/week)", value: 1.55 },
  { label: "Very active (6-7 days/week)", value: 1.725 },
  { label: "Extremely active (athlete/physical job)", value: 1.9 },
];
```

- [ ] Create `src/app/tools/calculator/page.tsx`:

```tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
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
          {/* Sex */}
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

          {/* Activity */}
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
```

- [ ] `npm run build` — fix any TypeScript errors
- [ ] Commit: `feat: add body stats calculator page`

---

## Task 6: Feature 5 — Exercise library

**Files:**
- Create: `src/data/exercises.json`
- Create: `src/app/tools/exercises/page.tsx`

- [ ] Create `src/data/exercises.json` (60 exercises):

```json
[
  {"id":"sq1","name":"Back Squat","category":"Strength","muscleGroups":["Quads","Glutes","Hamstrings"],"equipment":"Barbell","difficulty":"Intermediate","description":"Compound lower-body movement. Bar rests on upper traps. Descend until hips below parallel.","sets":4,"reps":"6-8"},
  {"id":"sq2","name":"Goblet Squat","category":"Strength","muscleGroups":["Quads","Glutes","Core"],"equipment":"Dumbbell","difficulty":"Beginner","description":"Hold a dumbbell at chest height. Squat deep, elbows tracking inside knees.","sets":3,"reps":"10-12"},
  {"id":"sq3","name":"Bulgarian Split Squat","category":"Strength","muscleGroups":["Quads","Glutes","Hip Flexors"],"equipment":"Dumbbell","difficulty":"Intermediate","description":"Rear foot elevated on bench. Deep lunge. Develops unilateral leg strength and balance.","sets":3,"reps":"8-10 each"},
  {"id":"dl1","name":"Conventional Deadlift","category":"Strength","muscleGroups":["Hamstrings","Glutes","Back","Traps"],"equipment":"Barbell","difficulty":"Intermediate","description":"Hip-hinge pattern. Drive floor away, keep bar close to body, lock out hips at top.","sets":4,"reps":"4-6"},
  {"id":"dl2","name":"Romanian Deadlift","category":"Strength","muscleGroups":["Hamstrings","Glutes","Lower Back"],"equipment":"Barbell","difficulty":"Intermediate","description":"Soft knee bend, hinge at hips, feel hamstring stretch at bottom. Great for posterior chain.","sets":3,"reps":"8-10"},
  {"id":"dl3","name":"Trap Bar Deadlift","category":"Strength","muscleGroups":["Quads","Glutes","Back"],"equipment":"Trap Bar","difficulty":"Beginner","description":"More quad-friendly than conventional. Good starting deadlift variation.","sets":4,"reps":"5-6"},
  {"id":"hp1","name":"Barbell Hip Thrust","category":"Strength","muscleGroups":["Glutes","Hamstrings"],"equipment":"Barbell","difficulty":"Intermediate","description":"Shoulders on bench, bar across hips. Drive hips to full extension. Peak glute activation.","sets":4,"reps":"10-12"},
  {"id":"bp1","name":"Bench Press","category":"Strength","muscleGroups":["Chest","Triceps","Front Delts"],"equipment":"Barbell","difficulty":"Intermediate","description":"Horizontal push. Bar to nipple line, slight arch, elbows 45-75° from torso.","sets":4,"reps":"6-8"},
  {"id":"bp2","name":"Dumbbell Incline Press","category":"Strength","muscleGroups":["Upper Chest","Triceps","Front Delts"],"equipment":"Dumbbell","difficulty":"Beginner","description":"30-45° incline. Targets upper chest. Good unilateral balance.","sets":3,"reps":"10-12"},
  {"id":"bp3","name":"Push-Up","category":"Strength","muscleGroups":["Chest","Triceps","Core"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Ground-based horizontal push. Full ROM, elbows at 45°. Scales via elevation.","sets":3,"reps":"Max"},
  {"id":"row1","name":"Barbell Row","category":"Strength","muscleGroups":["Lats","Rhomboids","Biceps"],"equipment":"Barbell","difficulty":"Intermediate","description":"Horizontal pull. Hinge forward, bar to lower chest, squeeze shoulder blades.","sets":4,"reps":"6-8"},
  {"id":"row2","name":"Single-Arm Dumbbell Row","category":"Strength","muscleGroups":["Lats","Rhomboids","Biceps"],"equipment":"Dumbbell","difficulty":"Beginner","description":"Knee on bench. Pull dumbbell to hip, elbow close to body.","sets":3,"reps":"10 each"},
  {"id":"row3","name":"Cable Row","category":"Strength","muscleGroups":["Lats","Mid Back","Biceps"],"equipment":"Cable Machine","difficulty":"Beginner","description":"Seated row to abdomen. Maintain upright torso, full stretch at extension.","sets":3,"reps":"12"},
  {"id":"pu1","name":"Pull-Up","category":"Strength","muscleGroups":["Lats","Biceps","Core"],"equipment":"Pull-Up Bar","difficulty":"Intermediate","description":"Full hang, pull until chin over bar. Use bands for assistance if needed.","sets":4,"reps":"Max"},
  {"id":"pu2","name":"Lat Pulldown","category":"Strength","muscleGroups":["Lats","Biceps"],"equipment":"Cable Machine","difficulty":"Beginner","description":"Wide grip, pull bar to upper chest. Retract shoulder blades.","sets":3,"reps":"10-12"},
  {"id":"sh1","name":"Overhead Press","category":"Strength","muscleGroups":["Front Delts","Triceps","Upper Traps"],"equipment":"Barbell","difficulty":"Intermediate","description":"Standing or seated. Press bar overhead to full lockout. Core braced throughout.","sets":4,"reps":"6-8"},
  {"id":"sh2","name":"Lateral Raise","category":"Strength","muscleGroups":["Lateral Delts"],"equipment":"Dumbbell","difficulty":"Beginner","description":"Slight forward lean, arms rise to shoulder height. Slow controlled eccentric.","sets":3,"reps":"15-20"},
  {"id":"co1","name":"Plank","category":"Strength","muscleGroups":["Core","Shoulders"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Forearms on floor, body rigid. Squeeze glutes and brace abs. Hold for time.","duration":"30-60s"},
  {"id":"co2","name":"Dead Bug","category":"Strength","muscleGroups":["Deep Core","Hip Flexors"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Lower back pressed to floor. Opposite arm/leg extends simultaneously.","sets":3,"reps":"10 each"},
  {"id":"co3","name":"Ab Wheel Rollout","category":"Strength","muscleGroups":["Core","Lats","Shoulders"],"equipment":"Ab Wheel","difficulty":"Advanced","description":"Kneel, roll wheel forward maintaining a rigid torso. Anti-extension core exercise.","sets":3,"reps":"8-10"},
  {"id":"run1","name":"Interval Sprints","category":"Cardio","muscleGroups":["Full Body"],"equipment":"Treadmill / Track","difficulty":"Intermediate","description":"20-30s all-out effort, 90s recovery. 6-10 rounds. Excellent fat loss and conditioning.","sets":8,"duration":"20s on / 90s off"},
  {"id":"run2","name":"Steady-State Run","category":"Cardio","muscleGroups":["Legs","Cardiovascular"],"equipment":"Treadmill / Outdoor","difficulty":"Beginner","description":"Zone 2 aerobic base building. Conversational pace, 30-60 minutes.","duration":"30-60min"},
  {"id":"cyc1","name":"Assault Bike Intervals","category":"Cardio","muscleGroups":["Full Body"],"equipment":"Assault Bike","difficulty":"Advanced","description":"Max effort 10-20s, full rest 40-50s. 8-10 rounds. Brutal full-body conditioning.","sets":10,"duration":"15s on / 45s off"},
  {"id":"row4","name":"Rowing Machine","category":"Cardio","muscleGroups":["Back","Legs","Arms"],"equipment":"Rowing Machine","difficulty":"Beginner","description":"Low-impact full-body cardio. Drive with legs first, then lean back, then arms.","duration":"20-30min"},
  {"id":"sk1","name":"Jump Rope","category":"Cardio","muscleGroups":["Calves","Shoulders","Coordination"],"equipment":"Jump Rope","difficulty":"Beginner","description":"Double-unders for advanced. Great judo warm-up. 3-5 rounds of 2 minutes.","sets":5,"duration":"2min"},
  {"id":"mob1","name":"Hip 90/90 Stretch","category":"Mobility","muscleGroups":["Hip Flexors","External Rotators","Glutes"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Sit with both legs at 90° angles. Hold 60s each side. Critical for judo hip mobility.","duration":"60s each"},
  {"id":"mob2","name":"Thoracic Rotation","category":"Mobility","muscleGroups":["Thoracic Spine","Lats"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Side-lying, top knee bent, rotate upper torso. Open chest to ceiling.","sets":2,"reps":"10 each"},
  {"id":"mob3","name":"Ankle Mobility Drill","category":"Mobility","muscleGroups":["Ankles","Calves"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Knee-to-wall drill. Drive knee over toes without heel lifting. 10 reps each.","sets":2,"reps":"10 each"},
  {"id":"mob4","name":"World's Greatest Stretch","category":"Mobility","muscleGroups":["Hip Flexors","Thoracic","Hamstrings"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Lunge forward, drop elbow to instep, rotate arm to ceiling. 5 reps per side.","sets":2,"reps":"5 each"},
  {"id":"mob5","name":"Couch Stretch","category":"Mobility","muscleGroups":["Hip Flexors","Quads"],"equipment":"Wall","difficulty":"Beginner","description":"Rear knee on floor, shin up wall. Upright torso. 2 min each side. Fixes desk posture.","duration":"2min each"},
  {"id":"jc1","name":"Uchi-Komi (Repetition Entry)","category":"Judo Conditioning","muscleGroups":["Hips","Core","Grip"],"equipment":"Partner / Resistance Band","difficulty":"Beginner","description":"Repeated throw entries without completion. Builds explosive hip insertion and muscle memory. 10 reps per throw per side.","sets":5,"reps":"10 per side"},
  {"id":"jc2","name":"Grip Strength Dead Hang","category":"Judo Conditioning","muscleGroups":["Forearms","Grip","Shoulders"],"equipment":"Pull-Up Bar","difficulty":"Beginner","description":"Hang from bar with full grip. Builds the forearm endurance critical for kumi-kata.","sets":3,"duration":"30-60s"},
  {"id":"jc3","name":"Towel Pull-Up","category":"Judo Conditioning","muscleGroups":["Grip","Lats","Biceps"],"equipment":"Towel + Pull-Up Bar","difficulty":"Advanced","description":"Drape towels over bar, grip ends. Pull-ups develop judo-specific grip and pulling strength.","sets":3,"reps":"Max"},
  {"id":"jc4","name":"Explosive Hip Extension (Band)","category":"Judo Conditioning","muscleGroups":["Hips","Glutes","Core"],"equipment":"Resistance Band","difficulty":"Intermediate","description":"Band around hips, anchored behind. Drive hips forward explosively. Mimics harai-goshi/o-goshi hip action.","sets":4,"reps":"8 each"},
  {"id":"jc5","name":"Seoi-Nage Shoulder Drill","category":"Judo Conditioning","muscleGroups":["Shoulders","Triceps","Core"],"equipment":"Resistance Band","difficulty":"Intermediate","description":"Simulate shoulder entry with resistance band. Builds seoi-nage-specific pulling mechanics.","sets":3,"reps":"12 each"},
  {"id":"jc6","name":"Sled Push","category":"Judo Conditioning","muscleGroups":["Quads","Glutes","Core"],"equipment":"Sled","difficulty":"Intermediate","description":"Low body position drive. Builds legs-in-for-throw strength and cardiovascular output.","sets":6,"duration":"20m"},
  {"id":"jc7","name":"Kettlebell Swing","category":"Judo Conditioning","muscleGroups":["Hamstrings","Glutes","Lower Back","Core"],"equipment":"Kettlebell","difficulty":"Intermediate","description":"Hip hinge power. Develops explosive posterior chain strength for throw execution.","sets":4,"reps":"15"},
  {"id":"jc8","name":"Medicine Ball Rotational Throw","category":"Judo Conditioning","muscleGroups":["Core","Obliques","Shoulders"],"equipment":"Medicine Ball","difficulty":"Intermediate","description":"Rotate and throw med ball against wall. Develops rotational power for ippon-seoi-nage and uchi-mata.","sets":4,"reps":"10 each"},
  {"id":"jc9","name":"Grip Pinching (Plate Pinch)","category":"Judo Conditioning","muscleGroups":["Grip","Forearms"],"equipment":"Weight Plates","difficulty":"Beginner","description":"Pinch two plates together and hold. Develops pinching grip strength for lapel grips.","sets":3,"duration":"30s"},
  {"id":"jc10","name":"Bridging (Ukemi Drill)","category":"Judo Conditioning","muscleGroups":["Neck","Upper Back","Core"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Lie on back, bridge on top of head. Builds neck strength critical for falling safely and groundwork.","sets":3,"duration":"30s"},
  {"id":"jc11","name":"Randori Simulation (Shadow Judo)","category":"Judo Conditioning","muscleGroups":["Full Body"],"equipment":"Bodyweight","difficulty":"Intermediate","description":"3-minute rounds of shadow gripping, stance switching, entry drilling. Builds judo-specific endurance.","sets":5,"duration":"3min rounds"},
  {"id":"rec1","name":"Foam Rolling (Thoracic)","category":"Recovery","muscleGroups":["Thoracic Spine","Lats"],"equipment":"Foam Roller","difficulty":"Beginner","description":"Roll thoracic spine for 60s. Pause on tight spots. Restores extension lost from gripping posture.","duration":"60s"},
  {"id":"rec2","name":"Contrast Shower","category":"Recovery","muscleGroups":["Full Body"],"equipment":"Shower","difficulty":"Beginner","description":"Alternate 3min hot / 1min cold, 3-4 cycles. Reduces DOMS and improves circulation.","duration":"12-16min"},
  {"id":"rec3","name":"Legs Up the Wall","category":"Recovery","muscleGroups":["Hamstrings","Lower Back","Circulatory"],"equipment":"Wall","difficulty":"Beginner","description":"Lie on back, legs vertical against wall. 5-10 minutes. Reduces leg fatigue post-training.","duration":"5-10min"},
  {"id":"rec4","name":"Box Breathing","category":"Recovery","muscleGroups":["Respiratory","Nervous System"],"equipment":"None","difficulty":"Beginner","description":"4s inhale, 4s hold, 4s exhale, 4s hold. 5 minutes. Activates parasympathetic system post-competition.","duration":"5min"},
  {"id":"rec5","name":"Cold Water Immersion","category":"Recovery","muscleGroups":["Full Body"],"equipment":"Cold Bath / Ice Bath","difficulty":"Intermediate","description":"10-15°C for 10-15 minutes. Most evidence-backed recovery method for reducing DOMS and inflammation.","duration":"10-15min"},
  {"id":"str1","name":"Nordic Hamstring Curl","category":"Strength","muscleGroups":["Hamstrings"],"equipment":"Partner / GHD","difficulty":"Advanced","description":"Most effective hamstring eccentric exercise. Lowers risk of hamstring strain significantly.","sets":3,"reps":"5-8"},
  {"id":"str2","name":"Face Pull","category":"Strength","muscleGroups":["Rear Delts","External Rotators","Upper Back"],"equipment":"Cable Machine","difficulty":"Beginner","description":"Cable to face height, pull to ears with external rotation. Counteracts bench press/judo posture.","sets":3,"reps":"15-20"},
  {"id":"str3","name":"Pallof Press","category":"Strength","muscleGroups":["Core","Anti-Rotation"],"equipment":"Cable Machine / Band","difficulty":"Beginner","description":"Press cable straight out from chest. Resist rotation. Anti-rotation core strength for grappling.","sets":3,"reps":"10 each"},
  {"id":"str4","name":"Single-Leg RDL","category":"Strength","muscleGroups":["Hamstrings","Glutes","Balance"],"equipment":"Dumbbell","difficulty":"Intermediate","description":"Balance on one leg, hinge forward. Builds hip stability and unilateral hamstring strength.","sets":3,"reps":"8-10 each"},
  {"id":"str5","name":"Trap-3 Raise","category":"Strength","muscleGroups":["Lower Traps","Rotator Cuff"],"equipment":"Dumbbell","difficulty":"Beginner","description":"Lie prone on incline bench, raise dumbbells in Y position. Crucial rotator cuff health for grappling.","sets":3,"reps":"12-15"},
  {"id":"str6","name":"Z-Press","category":"Strength","muscleGroups":["Front Delts","Triceps","Core"],"equipment":"Barbell","difficulty":"Advanced","description":"Seated on floor, legs straight. Overhead press. Eliminates leg drive, demands core stability.","sets":3,"reps":"6-8"},
  {"id":"jc12","name":"Arm Drag Entry (Band)","category":"Judo Conditioning","muscleGroups":["Biceps","Core","Shoulders"],"equipment":"Resistance Band","difficulty":"Intermediate","description":"Simulate arm drag entry against band resistance. Develops single-leg attack setups.","sets":3,"reps":"10 each"},
  {"id":"jc13","name":"Burpee Broad Jump","category":"Judo Conditioning","muscleGroups":["Full Body"],"equipment":"Bodyweight","difficulty":"Intermediate","description":"Burpee followed by maximum broad jump. Builds explosive power and cardiovascular conditioning simultaneously.","sets":4,"reps":"8"},
  {"id":"mob6","name":"Seated Butterfly Stretch","category":"Mobility","muscleGroups":["Adductors","Hips"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Soles of feet together, lean forward. Stretch adductors for guard work and uchi-mata.","duration":"90s"},
  {"id":"mob7","name":"Cat-Cow","category":"Mobility","muscleGroups":["Spine","Core","Hips"],"equipment":"Bodyweight","difficulty":"Beginner","description":"Alternating spinal flexion/extension. Warms up spine pre-training, decompresses post-training.","sets":2,"reps":"10 slow"},
  {"id":"rec6","name":"Epsom Salt Bath","category":"Recovery","muscleGroups":["Muscles","Nervous System"],"equipment":"Bath","difficulty":"Beginner","description":"400g Epsom salt in warm bath for 20 minutes. Magnesium absorption may reduce muscle soreness.","duration":"20min"},
  {"id":"str7","name":"Cable Woodchop","category":"Strength","muscleGroups":["Obliques","Core","Shoulders"],"equipment":"Cable Machine","difficulty":"Beginner","description":"Diagonal pull from high to low (and reverse). Rotational core power for throwing.","sets":3,"reps":"12 each"}
]
```

- [ ] Create `src/app/tools/exercises/page.tsx`:

```tsx
"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import exercises from "@/data/exercises.json";
import { Input } from "@/components/ui/input";

const categories = ["All", "Strength", "Cardio", "Mobility", "Judo Conditioning", "Recovery"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

export default function ExercisesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchQ = !query || ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.muscleGroups.some((m) => m.toLowerCase().includes(query.toLowerCase()));
      const matchC = category === "All" || ex.category === category;
      const matchD = difficulty === "All" || ex.difficulty === difficulty;
      return matchQ && matchC && matchD;
    });
  }, [query, category, difficulty]);

  const diffColor = (d: string) =>
    d === "Beginner" ? "var(--success)" : d === "Intermediate" ? "var(--warn)" : "var(--destructive)";

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Tools</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Exercise library</h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            {exercises.length} exercises including judo-specific conditioning. Filter by category, difficulty, or muscle.
          </p>
        </div>

        {/* Search + filters */}
        <div className="space-y-3">
          <Input placeholder="Search by name or muscle group…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="rounded-[var(--r-pill)] border px-3 py-1 text-[0.75rem] font-medium transition-colors"
                style={{
                  borderColor: category === c ? "var(--primary)" : "var(--border)",
                  background: category === c ? "var(--accent-dim)" : "transparent",
                  color: category === c ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="rounded-[var(--r-pill)] border px-3 py-1 text-[0.75rem] font-medium transition-colors"
                style={{
                  borderColor: difficulty === d ? "var(--primary)" : "var(--border)",
                  background: difficulty === d ? "var(--accent-dim)" : "transparent",
                  color: difficulty === d ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
          {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="space-y-2">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              className="rounded-[var(--r-card)] border p-4 space-y-2"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[0.875rem] font-semibold">{ex.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {ex.muscleGroups.map((m) => (
                      <span
                        key={m}
                        className="rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
                        style={{ background: "var(--surface-raised)", color: "var(--muted-foreground)" }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold"
                    style={{ background: `${diffColor(ex.difficulty)}20`, color: diffColor(ex.difficulty) }}
                  >
                    {ex.difficulty}
                  </span>
                  <span className="text-[0.6875rem]" style={{ color: "var(--muted-foreground)" }}>
                    {ex.equipment}
                  </span>
                </div>
              </div>
              <p className="text-[0.8125rem] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {ex.description}
              </p>
              {(ex.sets || ex.reps || ex.duration) && (
                <p className="text-[0.75rem]" style={{ color: "var(--primary)" }}>
                  {[ex.sets && `${ex.sets} sets`, ex.reps && ex.reps, ex.duration && ex.duration].filter(Boolean).join(" × ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] `npm run build` — fix TypeScript errors
- [ ] Commit: `feat: add searchable exercise library with judo-specific exercises`

---

## Task 7: Feature 6 — Judo weight cut planner

**Files:**
- Create: `src/app/(protected)/weight-cut/page.tsx`
- Create: `src/components/weight-cut/WeightCutClient.tsx`
- Create: `src/app/api/weight-cut/route.ts`

Note: Placed at `/(protected)/weight-cut` (not `/coach/weight-cut`) because the proxy excludes `/coach/*` from auth enforcement.

- [ ] Create `src/app/api/weight-cut/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const WEIGHT_CLASSES = [60, 66, 73, 81, 90, 100] as const;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentWeight, targetClass, competitionDate, dietQuality, sessionsPerWeek } = await req.json();

  if (!currentWeight || !targetClass || !competitionDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const daysLeft = Math.round((new Date(competitionDate).getTime() - Date.now()) / 86_400_000);
  const kgToCut = parseFloat(currentWeight) - parseFloat(targetClass);

  if (daysLeft < 1) return NextResponse.json({ error: "Competition date must be in the future" }, { status: 400 });
  if (kgToCut <= 0) return NextResponse.json({ error: "Current weight is already at or below target class" }, { status: 400 });

  // Safety check: >5% bodyweight cut in <14 days is unsafe
  const pctCut = kgToCut / parseFloat(currentWeight);
  if (pctCut > 0.05 && daysLeft < 14) {
    return NextResponse.json({
      safetyWarning: true,
      message: `Cutting ${kgToCut.toFixed(1)}kg (${(pctCut * 100).toFixed(1)}% of bodyweight) in ${daysLeft} days is unsafe and performance-destroying. We cannot generate a protocol for this cut. Consider competing at a higher weight class or entering a later competition.`,
    }, { status: 422 });
  }

  const prompt = `You are an expert judo-specific strength and conditioning coach with experience supporting elite athletes through competition weight cuts.

Current situation:
- Current weight: ${currentWeight}kg
- Target weight class: under ${targetClass}kg
- kg to cut: ${kgToCut.toFixed(1)}kg
- Days to competition: ${daysLeft}
- Diet quality (1-5): ${dietQuality}
- Training sessions per week: ${sessionsPerWeek}

Produce a safe, evidence-based week-by-week weight cut plan that preserves competition performance. Include a water cut protocol ONLY in the final 24-48 hours. Be conservative and performance-focused.

Return ONLY valid JSON (no markdown fences):
{
  "weeklyTargets": [
    { "week": 1, "targetWeight": 0.0, "strategy": "string", "nutrition": "string", "training": "string" }
  ],
  "nutritionGuidelines": "string",
  "hydrationProtocol": "string — water cut in final 24-48h only",
  "trainingAdjustments": "string",
  "safetyWarnings": ["string"]
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2048,
  });

  const raw = (completion.choices[0].message.content ?? "")
    .trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

  let plan: Record<string, unknown>;
  try { plan = JSON.parse(raw); }
  catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

  await supabase.from("fitness_plans").insert({ user_id: user.id, plan: { ...plan, type: "weight_cut" } });

  return NextResponse.json({ plan, kgToCut: kgToCut.toFixed(1), daysLeft });
}
```

- [ ] Create `src/components/weight-cut/WeightCutClient.tsx`:

```tsx
"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CLASSES = [60, 66, 73, 81, 90, 100, "100+"] as const;

interface WeeklyTarget { week: number; targetWeight: number; strategy: string; nutrition: string; training: string; }
interface CutPlan {
  weeklyTargets: WeeklyTarget[];
  nutritionGuidelines: string;
  hydrationProtocol: string;
  trainingAdjustments: string;
  safetyWarnings: string[];
}

export function WeightCutClient() {
  const reduced = useReducedMotion();
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetClass, setTargetClass] = useState<number | string>("");
  const [competitionDate, setCompetitionDate] = useState("");
  const [dietQuality, setDietQuality] = useState(3);
  const [sessionsPerWeek, setSessionsPerWeek] = useState("4");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const [result, setResult] = useState<{ plan: CutPlan; kgToCut: string; daysLeft: number } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setSafetyWarning(null);
    const res = await fetch("/api/weight-cut", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentWeight: parseFloat(currentWeight), targetClass, competitionDate, dietQuality, sessionsPerWeek: parseInt(sessionsPerWeek) }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.status === 422 && data.safetyWarning) { setSafetyWarning(data.message); return; }
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    setResult(data);
  }

  const stagger = { show: { transition: { staggerChildren: reduced ? 0 : 0.08 } }, hidden: {} };
  const slideIn = {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.45, bounce: 0 } },
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-[var(--r-card)] border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cw">Current weight (kg)</Label>
            <Input id="cw" type="number" step="0.1" min="40" max="200" placeholder="82.5" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Competition date</Label>
            <Input id="date" type="date" value={competitionDate} onChange={(e) => setCompetitionDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Target weight class</Label>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => (
              <button key={c} type="button" onClick={() => setTargetClass(c)}
                className="rounded-[var(--r-button)] border px-3 py-1.5 text-[0.875rem] font-medium transition-colors"
                style={{
                  borderColor: targetClass === c ? "var(--primary)" : "var(--border)",
                  background: targetClass === c ? "var(--accent-dim)" : "transparent",
                  color: targetClass === c ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                {c === "100+" ? "+100" : `u${c}`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Diet quality — {dietQuality}/5 ({["", "Poor", "Below average", "Average", "Good", "Excellent"][dietQuality]})</Label>
          <input type="range" min={1} max={5} value={dietQuality} onChange={(e) => setDietQuality(+e.target.value)} className="w-full accent-[var(--primary)]" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sesh">Training sessions per week</Label>
          <Input id="sesh" type="number" min="1" max="14" placeholder="5" value={sessionsPerWeek} onChange={(e) => setSessionsPerWeek(e.target.value)} required />
        </div>

        {safetyWarning && (
          <div className="rounded-[var(--r-card)] border p-4 space-y-1" style={{ borderColor: "var(--destructive)", background: "oklch(0.62 0.22 27 / 8%)" }}>
            <p className="text-[0.8125rem] font-semibold" style={{ color: "var(--destructive)" }}>⚠ Unsafe cut detected</p>
            <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>{safetyWarning}</p>
          </div>
        )}
        {error && <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading || !targetClass}>
          {loading ? "Generating protocol…" : "Generate weight cut plan"}
        </Button>
      </form>

      {result && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={slideIn} className="rounded-[var(--r-card)] border p-4" style={{ borderColor: "var(--primary)", background: "var(--accent-dim)" }}>
            <p className="text-[0.875rem]"><span className="font-semibold" style={{ color: "var(--primary)" }}>{result.kgToCut}kg</span> to cut in <span className="font-semibold" style={{ color: "var(--primary)" }}>{result.daysLeft} days</span></p>
          </motion.div>

          <motion.div variants={slideIn} className="space-y-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Week-by-week targets</p>
            {result.plan.weeklyTargets.map((w, i) => (
              <motion.div key={i} variants={slideIn} className="rounded-[var(--r-card)] border p-4 space-y-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.875rem] font-semibold">Week {w.week}</span>
                  <span className="text-lg font-bold" style={{ color: "var(--primary)" }}>{w.targetWeight}kg</span>
                </div>
                <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>{w.strategy}</p>
                <div className="grid grid-cols-2 gap-2 text-[0.75rem]" style={{ color: "var(--muted-foreground)" }}>
                  <div><span className="font-medium">Nutrition:</span> {w.nutrition}</div>
                  <div><span className="font-medium">Training:</span> {w.training}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {[
            { label: "Nutrition guidelines", content: result.plan.nutritionGuidelines },
            { label: "Hydration protocol", content: result.plan.hydrationProtocol },
            { label: "Training adjustments", content: result.plan.trainingAdjustments },
          ].map(({ label, content }) => (
            <motion.div key={label} variants={slideIn} className="rounded-[var(--r-card)] border p-4 space-y-1.5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>{label}</p>
              <p className="text-[0.875rem] leading-relaxed">{content}</p>
            </motion.div>
          ))}

          {result.plan.safetyWarnings.length > 0 && (
            <motion.div variants={slideIn} className="rounded-[var(--r-card)] border p-4 space-y-2" style={{ borderColor: "var(--warn)", background: "var(--warn-dim)" }}>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--warn)" }}>Safety notes</p>
              {result.plan.safetyWarnings.map((w, i) => <p key={i} className="text-[0.8125rem]" style={{ color: "var(--warn)" }}>{w}</p>)}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
```

- [ ] Create `src/app/(protected)/weight-cut/page.tsx`:

```tsx
import { WeightCutClient } from "@/components/weight-cut/WeightCutClient";

export default function WeightCutPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Judo</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Competition weight cut</h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            Generate a safe, performance-preserving weight cut protocol for your next competition. Cuts over 5% bodyweight in under 14 days will be refused.
          </p>
        </div>
        <WeightCutClient />
      </div>
    </div>
  );
}
```

- [ ] Add `/weight-cut` to proxy.ts protected list:

In `src/proxy.ts`, update `isProtected`:
```ts
const isProtected = ["/dashboard", "/progress", "/plan", "/weight-cut"].some((p) =>
  pathname.startsWith(p)
);
```

- [ ] Add weight-cut link to Nav for judo users — in `src/components/layout/Nav.tsx`, add to `protected_` array:
```ts
{ label: "Weight Cut", href: "/weight-cut" },
```

- [ ] `npm run build` — fix TypeScript errors
- [ ] Commit: `feat: add judo competition weight cut planner`

---

## Task 8: Feature 7 — Shareable results card

**Files:**
- Create: `src/components/results/ShareCard.tsx`
- Modify: `src/app/coach/results/page.tsx`

- [ ] Create `src/components/results/ShareCard.tsx`:

```tsx
"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EstimateResult } from "@/lib/types";
import { WizardState } from "@/lib/types";

interface ShareCardProps {
  result: EstimateResult;
  state: WizardState;
}

export function ShareCard({ result, state }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    // Dynamic import avoids SSR issues with html2canvas
    const html2canvas = (await import("html2canvas")).default;
    if (!cardRef.current) { setGenerating(false); return; }

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#0f111a",
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement("a");
    link.download = "my-fitness-estimate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setGenerating(false);
  }

  const goalLabels: Record<string, string> = {
    fat_loss: "Fat loss",
    muscle_gain: "Muscle gain",
    recomposition: "Recomposition",
  };

  return (
    <div>
      {/* Hidden render card — html2canvas captures this */}
      <div
        ref={cardRef}
        className="pointer-events-none fixed -left-[9999px] top-0"
        style={{ width: 600, padding: 48, background: "#0f111a", fontFamily: "system-ui, sans-serif" }}
      >
        {/* Amber glow top strip */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #d97706, #f59e0b)", borderRadius: 2, marginBottom: 40 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#111", fontSize: 16, fontWeight: 700 }}>⚡</span>
          </div>
          <span style={{ color: "#ede9e0", fontSize: 14, fontWeight: 600 }}>Fitness Goal Coach</span>
        </div>

        <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          My transformation estimate
        </p>
        <p style={{ color: "#ede9e0", fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 4 }}>
          {result.timeframeMin}–{result.timeframeMax}
        </p>
        <p style={{ color: "#9ca3af", fontSize: 20, marginBottom: 40 }}>{result.timeframeUnit}</p>

        <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Goal", value: goalLabels[state.questionnaire.goalType ?? ""] ?? "General fitness" },
            { label: "Starting weight", value: `${state.onboarding.weightKg ?? "—"}kg` },
            { label: "Confidence", value: result.confidenceLevel.charAt(0).toUpperCase() + result.confidenceLevel.slice(1) },
          ].map(({ label, value }) => (
            <div key={label} style={{ flex: 1, background: "#1a1d2e", borderRadius: 10, padding: "16px 14px" }}>
              <p style={{ color: "#6b7280", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
              <p style={{ color: "#ede9e0", fontSize: 14, fontWeight: 600 }}>{value}</p>
            </div>
          ))}
        </div>

        <p style={{ color: "#4b5563", fontSize: 11, borderTop: "1px solid #1f2335", paddingTop: 16 }}>
          fitnessgoacoach.app · Evidence-based estimates, not promises.
        </p>
      </div>

      <Button variant="outline" size="sm" onClick={handleDownload} disabled={generating}>
        {generating ? "Generating…" : "⬇ Download results card"}
      </Button>
    </div>
  );
}
```

- [ ] Modify `src/app/coach/results/page.tsx` — add `ShareCard` after the Disclaimer `<motion.div>` block (before the upsell link):

```tsx
import { ShareCard } from "@/components/results/ShareCard";
// ...
// After </motion.div> for Disclaimer, before the upsell link:
{result && (
  <motion.div variants={fadeUp} className="flex justify-center">
    <ShareCard result={result} state={state} />
  </motion.div>
)}
```

- [ ] `npm run build` — fix TypeScript errors
- [ ] Commit: `feat: add shareable results card download`

---

## Task 9: Feature 8 — Dark mode

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/ThemeToggle.tsx`
- Modify: `src/components/layout/Nav.tsx`

- [ ] Modify `src/app/globals.css` — move current `:root` dark tokens to `.dark`, add new light `:root`:

After the `@layer base` block, add:

```css
/* ── Light theme (default :root) ──────────────── */
:root {
  --background: oklch(0.975 0.003 255);
  --foreground: oklch(0.12 0.008 255);
  --card: oklch(0.99 0.002 255);
  --card-foreground: oklch(0.12 0.008 255);
  --popover: oklch(0.97 0.003 255);
  --popover-foreground: oklch(0.12 0.008 255);
  --primary: oklch(0.62 0.19 58);
  --primary-foreground: oklch(0.99 0.002 255);
  --secondary: oklch(0.94 0.004 255);
  --secondary-foreground: oklch(0.12 0.008 255);
  --muted: oklch(0.94 0.004 255);
  --muted-foreground: oklch(0.48 0.007 255);
  --accent: oklch(0.62 0.19 58 / 10%);
  --accent-foreground: oklch(0.12 0.008 255);
  --destructive: oklch(0.55 0.22 27);
  --border: oklch(0.88 0.005 255);
  --input: oklch(0.96 0.003 255);
  --ring: oklch(0.62 0.19 58);
  --surface: oklch(0.97 0.003 255);
  --surface-raised: oklch(0.94 0.004 255);
  --border-strong: oklch(0.72 0.006 255);
  --accent-dim: oklch(0.62 0.19 58 / 10%);
  --success: oklch(0.52 0.16 148);
  --success-dim: oklch(0.52 0.16 148 / 12%);
  --warn: oklch(0.58 0.17 82);
  --warn-dim: oklch(0.58 0.17 82 / 12%);
  --chart-1: oklch(0.62 0.19 58);
  --chart-2: oklch(0.52 0.16 148);
  --chart-3: oklch(0.5 0.007 255);
  --chart-4: oklch(0.7 0.005 255);
  --chart-5: oklch(0.88 0.005 255);
  --sidebar: oklch(0.97 0.003 255);
  --sidebar-foreground: oklch(0.12 0.008 255);
  --sidebar-primary: oklch(0.62 0.19 58);
  --sidebar-primary-foreground: oklch(0.99 0.002 255);
  --sidebar-accent: oklch(0.94 0.004 255);
  --sidebar-accent-foreground: oklch(0.12 0.008 255);
  --sidebar-border: oklch(0.88 0.005 255);
  --sidebar-ring: oklch(0.62 0.19 58);
  --radius: 0.625rem;
  --r-input: 0.5rem;
  --r-card: 0.875rem;
  --r-button: 0.625rem;
  --r-pill: 9999px;
  --dur-instant: 120ms;
  --dur-fast: 200ms;
  --dur-medium: 320ms;
  --dur-slow: 480ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
}

/* ── Dark theme ────────────────────────────────── */
.dark {
  --background: oklch(0.097 0.006 255);
  --foreground: oklch(0.935 0.004 255);
  --card: oklch(0.135 0.005 255);
  --card-foreground: oklch(0.935 0.004 255);
  --popover: oklch(0.18 0.007 255);
  --popover-foreground: oklch(0.935 0.004 255);
  --primary: oklch(0.72 0.19 58);
  --primary-foreground: oklch(0.14 0.015 255);
  --secondary: oklch(0.165 0.006 255);
  --secondary-foreground: oklch(0.935 0.004 255);
  --muted: oklch(0.165 0.006 255);
  --muted-foreground: oklch(0.58 0.007 255);
  --accent: oklch(0.72 0.19 58 / 12%);
  --accent-foreground: oklch(0.935 0.004 255);
  --destructive: oklch(0.62 0.22 27);
  --border: oklch(0.23 0.007 255);
  --input: oklch(0.135 0.005 255);
  --ring: oklch(0.72 0.19 58);
  --surface: oklch(0.135 0.005 255);
  --surface-raised: oklch(0.165 0.006 255);
  --border-strong: oklch(0.32 0.008 255);
  --accent-dim: oklch(0.72 0.19 58 / 12%);
  --success: oklch(0.68 0.16 148);
  --success-dim: oklch(0.68 0.16 148 / 15%);
  --warn: oklch(0.76 0.17 82);
  --warn-dim: oklch(0.76 0.17 82 / 15%);
  --chart-1: oklch(0.72 0.19 58);
  --chart-2: oklch(0.68 0.16 148);
  --chart-3: oklch(0.62 0.007 255);
  --chart-4: oklch(0.44 0.005 255);
  --chart-5: oklch(0.23 0.007 255);
  --sidebar: oklch(0.135 0.005 255);
  --sidebar-foreground: oklch(0.935 0.004 255);
  --sidebar-primary: oklch(0.72 0.19 58);
  --sidebar-primary-foreground: oklch(0.14 0.015 255);
  --sidebar-accent: oklch(0.165 0.006 255);
  --sidebar-accent-foreground: oklch(0.935 0.004 255);
  --sidebar-border: oklch(0.23 0.007 255);
  --sidebar-ring: oklch(0.72 0.19 58);
}
```

Also remove the old `:root` block (lines 80–157 of current globals.css — the dark tokens block) since it's now replaced by `.dark` above.

- [ ] Create `src/components/layout/ThemeToggle.tsx`:

```tsx
"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-8" />;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex size-8 items-center justify-center rounded-[var(--r-button)] transition-colors hover:bg-muted"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {isDark
            ? <Moon size={16} style={{ color: "var(--muted-foreground)" }} />
            : <Sun size={16} style={{ color: "var(--muted-foreground)" }} />
          }
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
```

- [ ] Modify `src/app/layout.tsx` — add `ThemeProvider` and `suppressHydrationWarning`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WizardProvider } from "@/context/WizardContext";
import { Nav } from "@/components/layout/Nav";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fitness Goal Coach",
  description: "Get a realistic estimate of what your fitness goal may take.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <WizardProvider>
            <Nav />
            <div className="pt-12">{children}</div>
          </WizardProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] Modify `src/components/layout/Nav.tsx` — add `<ThemeToggle />` after the links:

```tsx
import { ThemeToggle } from "@/components/layout/ThemeToggle";
// In the nav JSX, at the end of the right-side div:
<div className="mx-1 h-4 w-px" style={{ background: "var(--border)" }} />
<ThemeToggle />
```

- [ ] `npm run build` — fix TypeScript errors
- [ ] Commit: `feat: add dark mode with system preference detection`

---

## Task 10: Feature 9 — GDPR account management

**Files:**
- Create: `src/app/(protected)/settings/account/page.tsx`
- Create: `src/app/api/account/export/route.ts`
- Create: `src/app/api/account/delete/route.ts`

- [ ] Create `src/app/api/account/export/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: entries }, { data: plans }, { data: profile }, { data: analyses }] =
    await Promise.all([
      supabase.from("progress_entries").select("*").eq("user_id", user.id),
      supabase.from("fitness_plans").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("wizard_state, estimate_result, created_at").eq("id", user.id).maybeSingle(),
      supabase.from("photo_analyses").select("created_at, analysis, revised_estimate").eq("user_id", user.id),
    ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    account: { email: user.email, created_at: user.created_at },
    profile,
    progress_entries: entries ?? [],
    fitness_plans: plans ?? [],
    photo_analyses: analyses ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="fitness-coach-export-${Date.now()}.json"`,
    },
  });
}
```

- [ ] Create `src/app/api/account/delete/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;
  const service = createServiceClient();

  // Delete in dependency order
  await service.from("photo_analyses").delete().eq("user_id", userId);
  await service.from("progress_entries").delete().eq("user_id", userId);
  await service.from("fitness_plans").delete().eq("user_id", userId);
  await service.from("profiles").delete().eq("id", userId);

  // Delete storage files
  const { data: files } = await service.storage.from("progress-photos").list(userId);
  if (files && files.length > 0) {
    const paths = files.map((f: { name: string }) => `${userId}/${f.name}`);
    await service.storage.from("progress-photos").remove(paths);
  }

  // Delete auth user (must be last)
  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });

  return NextResponse.json({ success: true });
}
```

- [ ] Create `src/app/(protected)/settings/account/page.tsx`:

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function fetchEmail() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) setEmail(user.email);
  }
  // Fetch email on mount
  useState(() => { fetchEmail(); });

  function handleExport() {
    window.location.href = "/api/account/export";
  }

  async function handleDelete() {
    if (confirmInput !== email) return;
    setDeleting(true);
    setDeleteError(null);

    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      const d = await res.json();
      setDeleteError(d.error ?? "Deletion failed.");
      setDeleting(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const canDelete = confirmInput === email && email.length > 0;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-10">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Settings</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Account</h1>
        </div>

        {/* Export */}
        <div className="space-y-4 rounded-[var(--r-card)] border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div>
            <h2 className="text-base font-semibold">Export my data</h2>
            <p className="mt-1 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
              Download all your progress entries, fitness plans, and profile data as JSON.
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>Download export.json</Button>
        </div>

        {/* Delete */}
        <div className="space-y-4 rounded-[var(--r-card)] border p-6" style={{ borderColor: "var(--destructive)", background: "oklch(0.62 0.22 27 / 4%)" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--destructive)" }}>Delete account</h2>
            <p className="mt-1 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
              Permanently deletes all your data: progress entries, fitness plans, photos, and your account. This cannot be undone.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Type your email to confirm: <span className="font-mono text-[0.8125rem]">{email}</span></Label>
            <Input
              id="confirm"
              type="email"
              placeholder={email}
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
            />
          </div>

          {deleteError && (
            <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>{deleteError}</p>
          )}

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            style={{
              opacity: canDelete ? 1 : 0.4,
              transition: "opacity var(--dur-medium) var(--ease-out)",
            }}
          >
            {deleting ? "Deleting…" : "Delete my account permanently"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Add settings link to Nav in `src/components/layout/Nav.tsx`:

In `protected_` array add:
```ts
{ label: "Settings", href: "/settings/account" },
```

Also add `/settings` to the proxy protected list in `src/proxy.ts`:
```ts
const isProtected = ["/dashboard", "/progress", "/plan", "/weight-cut", "/settings"].some(...)
```

- [ ] `npm run build` — fix TypeScript errors
- [ ] Commit: `feat: add GDPR account deletion and data export`

---

## Task 11: Final build + push

- [ ] `npm run build` — zero TypeScript errors, zero warnings
- [ ] Verify every API route that writes data has `supabase.auth.getUser()` + 401 guard
- [ ] `git push origin feat/full-feature-build`

---

## Post-build: What to do in Supabase dashboard

1. **Storage bucket:** Create bucket named `progress-photos`, toggle Public OFF
2. **Storage RLS policies** on `progress-photos`:
   - SELECT: `(storage.foldername(name))[1] = auth.uid()::text`
   - INSERT: `(storage.foldername(name))[1] = auth.uid()::text`  
   - DELETE: `(storage.foldername(name))[1] = auth.uid()::text`
3. **Run SQL:**
```sql
create table public.photo_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now() not null,
  week1_url text not null,
  current_url text not null,
  analysis text not null,
  revised_estimate text
);
alter table public.photo_analyses enable row level security;
create policy "photo_analyses: own data" on public.photo_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## New env vars to add to Vercel dashboard

| Variable | Where to get it |
|---|---|
| `CRON_SECRET` | Generate: `openssl rand -hex 16` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key |
| `RESEND_API_KEY` | resend.com → API Keys |
| `NEXT_PUBLIC_APP_URL` | Your Vercel production URL e.g. `https://fitness-goal-coach.vercel.app` |

---

## New files created (complete list)

```
src/components/layout/Nav.tsx
src/components/layout/ThemeToggle.tsx
src/components/progress/PhotoComparison.tsx
src/components/results/ShareCard.tsx
src/components/weight-cut/WeightCutClient.tsx
src/components/dashboard/ (existing, unchanged)
src/data/exercises.json
src/lib/calculators.ts
src/lib/supabase/service.ts
src/app/(protected)/progress/photos/page.tsx
src/app/(protected)/weight-cut/page.tsx
src/app/(protected)/settings/account/page.tsx
src/app/api/progress/photo-analysis/route.ts
src/app/api/weight-cut/route.ts
src/app/api/account/export/route.ts
src/app/api/account/delete/route.ts
src/app/api/cron/weekly-reminder/route.ts
src/app/tools/calculator/page.tsx
src/app/tools/exercises/page.tsx
vercel.json
```

Modified files:
```
src/app/globals.css         (dark mode tokens split)
src/app/layout.tsx          (ThemeProvider + Nav)
src/app/coach/results/page.tsx  (ShareCard)
src/app/api/progress/route.ts   (adaptive plan)
src/components/progress/ProgressForm.tsx  (plan_updated callout)
src/proxy.ts                (weight-cut + settings protected)
```
