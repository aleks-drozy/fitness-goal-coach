# Comprehensive Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 15 distinct issues across product integrity, retention, technical quality, and UX as identified in the comprehensive assessment.

**Architecture:** Fixes are organized in dependency order — data/type layer first, then API routes, then UI components. Each task is independently committable. No new infrastructure is required; the existing Supabase, Groq, and Next.js stack handles everything.

**Tech Stack:** Next.js 16, TypeScript, Supabase, Groq SDK (llama-3.3-70b-versatile + llama-4-scout for vision), Framer Motion, Tailwind v4, Vitest (added in Task 15)

---

## Task 1: Remove dead dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove dead deps and move shadcn to devDependencies**

Replace the relevant sections in `package.json`:

```json
"dependencies": {
  "@base-ui/react": "^1.4.1",
  "@supabase/ssr": "^0.10.2",
  "@supabase/supabase-js": "^2.104.1",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "framer-motion": "^12.38.0",
  "groq-sdk": "^1.1.2",
  "html2canvas": "^1.4.1",
  "lucide-react": "^1.9.0",
  "next": "16.2.4",
  "next-themes": "^0.4.6",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "recharts": "^3.8.1",
  "resend": "^6.12.2",
  "tailwind-merge": "^3.5.0",
  "tw-animate-css": "^1.4.0"
},
"devDependencies": {
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "16.2.4",
  "shadcn": "^4.4.0",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: remove dead deps (@anthropic-ai/sdk, @google/generative-ai), move shadcn to devDependencies"
```

---

## Task 2: Fix types — make photos optional, expand sport field

**Files:**
- Modify: `src/lib/types.ts`

The `sport` field is currently `"judo" | "none"`, which makes every non-judo user identical. Expanding to include combat sports, team sports, and a generic "other" bucket gives the AI coach meaningful differentiation. Photos are made optional at the type level (not required to proceed).

- [ ] **Step 1: Update types.ts**

Replace `src/lib/types.ts` entirely:

```typescript
export type Sex = "male" | "female" | "other";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type GoalType = "fat_loss" | "muscle_gain" | "recomposition";
export type WorkoutSetting = "gym" | "home" | "both";
export type JudoIntensity = "light" | "moderate" | "hard";
export type Sport = "none" | "judo" | "bjj" | "boxing" | "mma" | "wrestling" | "running" | "cycling" | "football" | "other";

export interface OnboardingData {
  name: string;
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  experience: ExperienceLevel | null;
  activityLevel: ActivityLevel | null;
}

export interface PhotoData {
  consentGiven: boolean;
  currentPhotoBase64: string | null;
  goalPhotoBase64: string | null;
}

export interface QuestionnaireData {
  goalType: GoalType | null;
  workoutSetting: WorkoutSetting | null;
  injuries: string;
  sport: Sport;
}

export interface JudoData {
  sessionsPerWeek: number | null;
  intensity: JudoIntensity | null;
  hasCompetitionSoon: boolean;
  weeklySessionLog: string;
}

export interface WizardState {
  onboarding: OnboardingData;
  photos: PhotoData;
  questionnaire: QuestionnaireData;
  judo: JudoData;
}

export interface EstimateResult {
  timeframeMin: number;
  timeframeMax: number;
  timeframeUnit: "weeks" | "months";
  confidenceLevel: "low" | "medium" | "high";
  reasoning: string[];
  trainingGuidance: string[];
  nutritionNote: string;
  disclaimer: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: expand sport type beyond judo|none, photos already optional at type level"
```

---

## Task 3: WizardContext — localStorage persistence

**Files:**
- Modify: `src/context/WizardContext.tsx`

Without persistence, refreshing mid-wizard loses all data. This adds localStorage read on mount and write on every state change. Base64 photo data is excluded from storage (too large; photos are re-uploaded on refresh).

- [ ] **Step 1: Replace WizardContext.tsx**

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WizardState, OnboardingData, PhotoData, QuestionnaireData, JudoData, Sport } from "@/lib/types";

const STORAGE_KEY = "fitness-wizard-state";

const defaultState: WizardState = {
  onboarding: {
    name: "",
    age: null,
    sex: null,
    heightCm: null,
    weightKg: null,
    experience: null,
    activityLevel: null,
  },
  photos: {
    consentGiven: false,
    currentPhotoBase64: null,
    goalPhotoBase64: null,
  },
  questionnaire: {
    goalType: null,
    workoutSetting: null,
    injuries: "",
    sport: "none" as Sport,
  },
  judo: {
    sessionsPerWeek: null,
    intensity: null,
    hasCompetitionSoon: false,
    weeklySessionLog: "",
  },
};

function loadFromStorage(): WizardState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    return {
      ...defaultState,
      ...parsed,
      // Never restore base64 blobs — too large and stale
      photos: {
        ...(parsed.photos ?? defaultState.photos),
        currentPhotoBase64: null,
        goalPhotoBase64: null,
      },
    };
  } catch {
    return defaultState;
  }
}

function saveToStorage(state: WizardState) {
  try {
    const toSave = {
      ...state,
      photos: { consentGiven: state.photos.consentGiven, currentPhotoBase64: null, goalPhotoBase64: null },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // storage quota exceeded or private mode — silently ignore
  }
}

interface WizardContextValue {
  state: WizardState;
  setOnboarding: (data: Partial<OnboardingData>) => void;
  setPhotos: (data: Partial<PhotoData>) => void;
  setQuestionnaire: (data: Partial<QuestionnaireData>) => void;
  setJudo: (data: Partial<JudoData>) => void;
  clearWizard: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveToStorage(state);
  }, [state, hydrated]);

  const setOnboarding = (data: Partial<OnboardingData>) =>
    setState((s) => ({ ...s, onboarding: { ...s.onboarding, ...data } }));

  const setPhotos = (data: Partial<PhotoData>) =>
    setState((s) => ({ ...s, photos: { ...s.photos, ...data } }));

  const setQuestionnaire = (data: Partial<QuestionnaireData>) =>
    setState((s) => ({ ...s, questionnaire: { ...s.questionnaire, ...data } }));

  const setJudo = (data: Partial<JudoData>) =>
    setState((s) => ({ ...s, judo: { ...s.judo, ...data } }));

  const clearWizard = () => {
    setState(defaultState);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <WizardContext.Provider value={{ state, setOnboarding, setPhotos, setQuestionnaire, setJudo, clearWizard }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside WizardProvider");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/WizardContext.tsx
git commit -m "feat: persist wizard state to localStorage, exclude base64 photos from storage"
```

---

## Task 4: Fix the photo lie — make photos optional + vision in estimate

**Files:**
- Modify: `src/app/coach/photos/page.tsx`
- Modify: `src/lib/prompts.ts`
- Modify: `src/app/api/estimate/route.ts`

The estimate prompt currently has a hardcoded `PHOTO CONTEXT:` section claiming photos were analyzed, even though the images are never passed to the API. Fix: (1) remove the hard gate so photos are optional, (2) update the prompt to only include photo context if images were actually provided, (3) pass base64 images to `llama-4-scout-17b-16e-instruct` when available.

- [ ] **Step 1: Make photos optional in the wizard step**

Replace `src/app/coach/photos/page.tsx`:

```typescript
"use client";

import { useWizard } from "@/context/WizardContext";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { NavButtons } from "@/components/wizard/NavButtons";
import { ConsentGate } from "@/components/photos/ConsentGate";
import { PhotoUpload } from "@/components/photos/PhotoUpload";

export default function PhotosPage() {
  const { state, setPhotos } = useWizard();
  const { photos } = state;

  return (
    <>
      <ProgressBar currentStep={2} totalSteps={5} />
      <StepHeader
        title="Your photos (optional)"
        subtitle="Upload photos for visual context — your estimate works without them too."
        step={2}
        totalSteps={5}
      />
      <ConsentGate />
      <div
        className="space-y-6 overflow-hidden"
        style={{
          maxHeight: photos.consentGiven ? "1000px" : "0px",
          opacity: photos.consentGiven ? 1 : 0,
          transition: `max-height var(--dur-slow) var(--ease-out), opacity var(--dur-medium) var(--ease-out)`,
        }}
      >
        <PhotoUpload
          label="Current body photo"
          hint="A clear, well-lit photo helps us understand your starting point."
          base64Value={photos.currentPhotoBase64}
          onChange={(b64) => setPhotos({ currentPhotoBase64: b64 })}
        />
        <PhotoUpload
          label="Goal physique photo"
          hint="This may depict a different person's genetics, lighting, or editing. We will account for this."
          base64Value={photos.goalPhotoBase64}
          onChange={(b64) => setPhotos({ goalPhotoBase64: b64 })}
        />
      </div>
      {/* Always allow proceeding — photos are optional */}
      <NavButtons
        backHref="/coach/onboarding"
        nextHref="/coach/questionnaire"
        disabled={false}
      />
    </>
  );
}
```

- [ ] **Step 2: Update prompts.ts to conditionally include photo context**

Replace `src/lib/prompts.ts`:

```typescript
import { WizardState } from "./types";

const JUDO_SPORTS = new Set(["judo", "bjj", "wrestling", "mma"]);
const COMBAT_SPORTS = new Set(["boxing", "mma"]);

export function buildEstimatePrompt(state: WizardState, hasPhotos: boolean): string {
  const { onboarding, questionnaire, judo } = state;
  const sport = questionnaire.sport;

  const isGrappling = JUDO_SPORTS.has(sport);
  const isCombat = COMBAT_SPORTS.has(sport);

  const sportSection = sport === "judo" || sport === "bjj" || sport === "wrestling" || sport === "mma"
    ? `
GRAPPLING SPORT TRAINING:
- Sport: ${sport}
- Sessions per week: ${judo.sessionsPerWeek}
- Intensity: ${judo.intensity}
- Competition soon (within 8 weeks): ${judo.hasCompetitionSoon ? "yes" : "no"}
- Weekly session log: ${judo.weeklySessionLog || "not provided"}
Factor grappling fatigue (grip exhaustion, uchikomi, randori) into training load calculations.
`
    : sport !== "none"
    ? `
SPORT TRAINING:
- Sport: ${sport}
Factor sport-specific fatigue into training load calculations.
`
    : "";

  const photoSection = hasPhotos
    ? `
PHOTO CONTEXT:
The user has uploaded a current body photo and a goal physique photo. Acknowledge that the goal photo may show different genetics, lighting, or editing. Do not over-promise based on photos. Use the visual information to inform your assessment of their current physique.
`
    : "";

  return `You are an experienced, evidence-based fitness coach. You give realistic, honest estimates — never false promises.

USER PROFILE:
- Name: ${onboarding.name || "the user"}
- Age: ${onboarding.age}
- Sex: ${onboarding.sex}
- Height: ${onboarding.heightCm} cm
- Weight: ${onboarding.weightKg} kg
- Training experience: ${onboarding.experience}
- Activity level: ${onboarding.activityLevel}

GOAL:
- Goal type: ${questionnaire.goalType}
- Workout setting: ${questionnaire.workoutSetting}
- Injuries/limitations: ${questionnaire.injuries || "none reported"}
- Sport: ${questionnaire.sport}
${sportSection}${photoSection}
TASK:
Return a JSON object with this exact structure. Do not include any text outside the JSON.

{
  "timeframeMin": <integer months>,
  "timeframeMax": <integer months>,
  "timeframeUnit": "months",
  "confidenceLevel": "low" | "medium" | "high",
  "reasoning": [<3-5 short bullet strings explaining the estimate, referencing their specific data>],
  "trainingGuidance": [<3-5 short bullet strings about weekly training structure, specific to their goal, setting, and sport>],
  "nutritionNote": "<1-2 sentence high-level nutrition guidance — NOT a meal plan, NOT calorie counting>",
  "disclaimer": "This estimate is for general guidance only. It is not medical advice and does not replace a doctor, physiotherapist, registered dietitian, or qualified coach."
}

Rules:
- timeframeMin and timeframeMax must form a realistic range (e.g. 6 and 12), never exact
- confidenceLevel reflects how complete the data is and how predictable the goal is
- reasoning must be honest and mention limiting factors specific to this user (genetics, consistency, recovery, sport fatigue if applicable)
- If injuries are reported, note the recommendation to see a physiotherapist
- If a grappling sport is selected, explicitly factor grappling fatigue into training guidance
- Wording must be cautious, supportive, and non-medical
- Never claim the app can perfectly predict body transformation`;
}
```

- [ ] **Step 3: Update estimate route to use vision when photos provided**

Replace `src/app/api/estimate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildEstimatePrompt } from "@/lib/prompts";
import { WizardState, EstimateResult } from "@/lib/types";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// This route is intentionally public (wizard runs before account creation).
// Abuse mitigation: set a spending cap in the Groq dashboard, and enforce a
// request body size limit so the prompt can't be bloated arbitrarily.
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 200_000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const body = await req.json() as { state: WizardState };
  const { state } = body;

  const currentPhoto = state.photos.currentPhotoBase64;
  const goalPhoto = state.photos.goalPhotoBase64;
  const hasPhotos = !!(currentPhoto && goalPhoto);

  const promptText = buildEstimatePrompt(state, hasPhotos);

  type MessageContent =
    | string
    | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

  let messageContent: MessageContent;

  if (hasPhotos) {
    messageContent = [
      { type: "text", text: promptText },
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${currentPhoto}` } },
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${goalPhoto}` } },
    ];
  } else {
    messageContent = promptText;
  }

  const model = hasPhotos ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile";

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: messageContent as string }],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const rawText = (completion.choices[0].message.content ?? "").trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "");

  let result: EstimateResult;
  try {
    result = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse estimate from AI response" },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
```

Note: The Groq SDK's TypeScript types for multimodal messages may require a cast. If TypeScript complains about `messageContent as string`, change the `.create()` call to pass the content directly:
```typescript
messages: [{ role: "user", content: messageContent as Parameters<typeof client.chat.completions.create>[0]["messages"][0]["content"] }],
```

- [ ] **Step 4: Update lib/estimate.ts to pass photos in payload**

Read `src/lib/estimate.ts` and confirm it passes `state` (including photos) in the POST body. It should already do so — if `state.photos.currentPhotoBase64` is included, the route will receive it. No change needed if the full `state` is already serialized.

- [ ] **Step 5: Commit**

```bash
git add src/app/coach/photos/page.tsx src/lib/prompts.ts src/app/api/estimate/route.ts
git commit -m "feat: make photos optional in wizard; use llama-4-scout vision when photos provided; fix hardcoded photo context claim"
```

---

## Task 5: Fix silent error in results page

**Files:**
- Modify: `src/app/coach/results/page.tsx`

The `catch {}` block at line 47 silently sets `isLoggedIn=false` on any error including network failures, making logged-in users see "Create free account" instead of "Results saved."

- [ ] **Step 1: Fix the catch block**

In `src/app/coach/results/page.tsx`, replace the upsert try/catch block (lines 33–49):

```typescript
.then(async (r) => {
  setResult(r);
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  setIsLoggedIn(!!user);
  if (user) {
    // Best-effort save — failure doesn't affect the displayed results
    supabase.from("profiles").upsert({
      id: user.id,
      wizard_state: {
        ...state,
        photos: { consentGiven: state.photos.consentGiven, currentPhotoBase64: null, goalPhotoBase64: null },
      },
      estimate_result: r,
    }).then(({ error }) => {
      if (error) console.error("Profile upsert failed:", error.message);
    });
  }
})
```

This separates auth detection (synchronous, must succeed) from profile saving (fire-and-forget, logged on failure). `isLoggedIn` is now set based on the auth result, not on whether the upsert succeeded.

- [ ] **Step 2: Commit**

```bash
git add src/app/coach/results/page.tsx
git commit -m "fix: decouple isLoggedIn from profile upsert; log upsert failures instead of swallowing them"
```

---

## Task 6: Add forgot password flow to login

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/forgot-password/page.tsx`

- [ ] **Step 1: Add forgot password link to login page**

In `src/app/(auth)/login/page.tsx`, add a link below the password field. Insert after the password `<div className="space-y-1.5">` block and before the error display:

```typescript
<div className="flex justify-end">
  <Link
    href="/forgot-password"
    className="text-[0.8125rem] transition-opacity hover:opacity-80"
    style={{ color: "var(--muted-foreground)" }}
  >
    Forgot password?
  </Link>
</div>
```

- [ ] **Step 2: Create forgot-password page**

Create `src/app/(auth)/forgot-password/page.tsx`:

```typescript
"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/settings/account`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div
          className="rounded-[var(--r-card)] border border-border bg-card px-8 py-12"
          style={{ boxShadow: "0 0 0 1px oklch(0.72 0.19 58 / 4%), 0 8px 32px oklch(0 0 0 / 28%)" }}
        >
          <div
            className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full"
            style={{ background: "var(--success-dim)" }}
          >
            <Zap size={20} color="var(--success)" />
          </div>
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="mt-2 text-[0.875rem] text-muted-foreground">
            We sent a reset link to <span className="text-foreground">{email}</span>. It expires in 1 hour.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-[0.875rem] text-primary transition-opacity hover:opacity-80"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div
        className="rounded-[var(--r-card)] border border-border bg-card px-8 py-10"
        style={{ boxShadow: "0 0 0 1px oklch(0.72 0.19 58 / 4%), 0 8px 32px oklch(0 0 0 / 28%)" }}
      >
        <div className="mb-8 text-center">
          <div
            className="mb-4 inline-flex size-10 items-center justify-center rounded-full"
            style={{ background: "var(--primary)" }}
          >
            <Zap size={18} fill="var(--primary-foreground)" color="var(--primary-foreground)" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Reset password</h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Enter your email and we'll send a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {error && (
            <p
              className="rounded-[var(--r-input)] border px-3 py-2 text-[0.8125rem]"
              style={{
                borderColor: "var(--destructive)",
                background: "oklch(0.62 0.22 27 / 8%)",
                color: "var(--destructive)",
              }}
            >
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-[0.875rem] text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-primary transition-opacity hover:opacity-80">
          Sign in
        </Link>
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(auth)/login/page.tsx src/app/(auth)/forgot-password/page.tsx
git commit -m "feat: add forgot password link to login and reset password page"
```

---

## Task 7: Expand SportSelector to include more sports

**Files:**
- Modify: `src/components/questionnaire/SportSelector.tsx`

Replace the binary judo/none selector with a grid that covers the full `Sport` type from Task 2.

- [ ] **Step 1: Replace SportSelector.tsx**

```typescript
"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";
import { Sport } from "@/lib/types";

const SPORT_OPTIONS: { value: Sport; label: string; description: string }[] = [
  { value: "none", label: "No sport", description: "Gym or general fitness" },
  { value: "judo", label: "Judo", description: "Mat sessions + S&C" },
  { value: "bjj", label: "BJJ", description: "Rolling + strength work" },
  { value: "wrestling", label: "Wrestling", description: "Mat + conditioning" },
  { value: "boxing", label: "Boxing / Kickboxing", description: "Striking + cardio" },
  { value: "mma", label: "MMA", description: "Mixed training load" },
  { value: "running", label: "Running", description: "Road or trail" },
  { value: "cycling", label: "Cycling", description: "Road or MTB" },
  { value: "football", label: "Football / Soccer", description: "Team sport" },
  { value: "other", label: "Other sport", description: "I play another sport" },
];

export function SportSelector() {
  const { state, setQuestionnaire } = useWizard();
  const { sport } = state.questionnaire;

  return (
    <div className="space-y-2">
      <Label>Do you also train a sport?</Label>
      <div className="grid grid-cols-2 gap-2">
        {SPORT_OPTIONS.map((opt) => {
          const isSelected = sport === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setQuestionnaire({ sport: opt.value })}
              className="text-left rounded-[var(--r-card)] border p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
              style={{
                background: isSelected ? "var(--accent-dim)" : "var(--surface)",
                borderColor: isSelected ? "var(--primary)" : "var(--border)",
                transition: `border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)`,
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: isSelected ? "var(--primary)" : "var(--foreground)" }}
              >
                {opt.label}
              </p>
              <p
                className="text-xs mt-0.5 leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update JudoForm page to only show for grappling sports**

In `src/app/coach/questionnaire/page.tsx`, the JudoForm conditional needs updating. Read the file and confirm the judo step at `/coach/judo` is shown when `sport === "judo"`. Update the condition in `NavButtons` `nextHref` logic to route to `/coach/judo` for all grappling sports:

In `src/app/coach/questionnaire/page.tsx`, change the `nextHref` logic so grappling sports go to the judo step:

```typescript
// In the questionnaire page, update nextHref:
const isGrappling = ["judo", "bjj", "wrestling", "mma"].includes(state.questionnaire.sport ?? "");
// nextHref={isGrappling ? "/coach/judo" : "/coach/results"}
```

Also update `src/app/coach/judo/page.tsx` `StepHeader` title from "Judo training" to "Grappling training" to accommodate BJJ/wrestling/MMA users.

- [ ] **Step 3: Commit**

```bash
git add src/components/questionnaire/SportSelector.tsx src/app/coach/questionnaire/page.tsx src/app/coach/judo/page.tsx
git commit -m "feat: expand sport selector to 10 sports; route all grappling sports through judo training step"
```

---

## Task 8: Upsell page — replace dead button with working waitlist

**Files:**
- Modify: `src/components/upsell/PremiumCard.tsx`
- Create: `src/app/api/waitlist/route.ts`

The disabled "Coming soon" button with no email capture converts at 0%. Replace with a price anchor ($9/month) and a working email form that inserts to Supabase.

- [ ] **Step 1: Create waitlist API route**

Create `src/app/api/waitlist/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json() as { email: string };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("waitlist")
    .insert({ email })
    .select()
    .single();

  if (error) {
    // Duplicate email — treat as success so we don't leak whether email is already registered
    if (error.code === "23505") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

Note: Run this SQL in Supabase dashboard before deploying:
```sql
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);
alter table waitlist enable row level security;
-- No RLS policies needed — insert only via service role in API route
```

- [ ] **Step 2: Replace PremiumCard.tsx**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const features = [
  "Detailed weekly training plan tailored to your goal",
  "Nutrition guidance with calorie and protein targets",
  "Weekly AI check-ins with updated timeline",
  "Recovery and sleep recommendations",
  "Injury-aware exercise modifications",
  "Judo S&C integration — strength work around your mat sessions",
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
      <div className="px-6 py-6 space-y-1" style={{ background: "var(--accent-dim)" }}>
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
        <p
          className="text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
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
            className="rounded-[var(--r-card)] border px-4 py-3 text-center"
            style={{ borderColor: "var(--success)", background: "var(--success-dim)" }}
          >
            <p className="text-[0.875rem] font-medium" style={{ color: "var(--success)" }}>
              You're on the list.
            </p>
            <p className="text-[0.8125rem] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              We'll email you when Premium launches.
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
              {loading ? "Joining…" : "Join waitlist — get early access"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/upsell/PremiumCard.tsx src/app/api/waitlist/route.ts
git commit -m "feat: replace upsell dead button with $9/mo price anchor and working waitlist form"
```

---

## Task 9: Fix ProgressForm — layout bug + week backfill

**Files:**
- Modify: `src/components/progress/ProgressForm.tsx`
- Modify: `src/app/(protected)/progress/page.tsx`

The current form has a `grid-cols-2` layout where the weight input takes one column but the textarea is `col-span-2`, creating a broken layout. Also, users can't backfill missed weeks — `nextWeek` is always `max + 1` with no override.

- [ ] **Step 1: Update progress/page.tsx to pass existing week numbers**

```typescript
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProgressForm } from "@/components/progress/ProgressForm";
import { EntryTimeline } from "@/components/progress/EntryTimeline";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("progress_entries")
    .select("*")
    .eq("user_id", user!.id)
    .order("week_number", { ascending: true });

  const loggedWeeks = (entries ?? []).map((e) => e.week_number as number);
  const maxWeek = loggedWeeks.length > 0 ? Math.max(...loggedWeeks) : 0;
  const nextWeek = maxWeek + 1;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--primary)" }}
          >
            Progress
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Weekly check-in</h1>
          <Link href="/progress/photos" className="mt-2 inline-block text-[0.8125rem]" style={{ color: "var(--primary)" }}>
            Photo comparison →
          </Link>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            Log your weight and how the week went. Your AI coach will review your trajectory.
          </p>
        </div>

        <ProgressForm nextWeek={nextWeek} loggedWeeks={loggedWeeks} />

        {entries && entries.length > 0 && (
          <EntryTimeline entries={entries} />
        )}

        {(!entries || entries.length === 0) && (
          <div
            className="rounded-[var(--r-card)] border p-8 text-center"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
              No check-ins yet. Log your first week above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace ProgressForm.tsx with fixed layout + week picker**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProgressFormProps {
  nextWeek: number;
  loggedWeeks: number[];
}

interface SuccessData {
  on_track: boolean;
  revised_estimate: string;
  ai_feedback: string;
  plan_updated: boolean;
}

export function ProgressForm({ nextWeek, loggedWeeks }: ProgressFormProps) {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(nextWeek);
  const [currentWeight, setCurrentWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  // Offer backfill: weeks 1..nextWeek that haven't been logged yet
  const availableWeeks = Array.from({ length: nextWeek }, (_, i) => i + 1).filter(
    (w) => !loggedWeeks.includes(w)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekNumber,
        currentWeight: parseFloat(currentWeight),
        notes,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSuccess({
      on_track: data.on_track,
      revised_estimate: data.revised_estimate,
      ai_feedback: data.ai_feedback,
      plan_updated: data.plan_updated ?? false,
    });
    router.refresh();
  }

  if (success) {
    return (
      <div
        className="rounded-[var(--r-card)] border p-6 space-y-4"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="size-2 rounded-full"
            style={{ background: success.on_track ? "var(--success)" : "var(--warn)" }}
          />
          <span className="text-[0.8125rem] font-medium" style={{ color: success.on_track ? "var(--success)" : "var(--warn)" }}>
            {success.on_track ? "You're on track" : "Needs attention"}
          </span>
        </div>

        <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
          {success.ai_feedback}
        </p>

        {success.revised_estimate && success.revised_estimate !== "On track with original estimate" && (
          <div
            className="rounded-[var(--r-input)] border px-3 py-2 text-[0.8125rem]"
            style={{ borderColor: "var(--border-strong)", color: "var(--foreground)" }}
          >
            Revised estimate: <span className="font-medium">{success.revised_estimate}</span>
          </div>
        )}

        {success.plan_updated && (
          <div
            className="rounded-[var(--r-input)] border px-3 py-2.5 text-[0.8125rem]"
            style={{ borderColor: "var(--primary)", background: "var(--accent-dim)" }}
          >
            <span className="font-medium" style={{ color: "var(--primary)" }}>Your plan was automatically updated</span>
            {" — "}
            <a href="/plan" style={{ color: "var(--primary)", textDecoration: "underline" }}>view updated plan</a>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSuccess(null);
            setCurrentWeight("");
            setNotes("");
            setWeekNumber(nextWeek + 1);
          }}
        >
          Log another week
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--r-card)] border p-6 space-y-5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {availableWeeks.length > 1 && (
        <div className="space-y-1.5">
          <Label htmlFor="week">Week</Label>
          <select
            id="week"
            value={weekNumber}
            onChange={(e) => setWeekNumber(Number(e.target.value))}
            className="w-full rounded-[var(--r-input)] border px-3 py-2 text-sm bg-transparent"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {availableWeeks.map((w) => (
              <option key={w} value={w}>Week {w}{w === nextWeek ? " (current)" : " (backfill)"}</option>
            ))}
          </select>
        </div>
      )}

      {availableWeeks.length <= 1 && (
        <p className="text-[0.8125rem] font-medium" style={{ color: "var(--muted-foreground)" }}>
          Week {weekNumber}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="weight">Current weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="20"
          max="300"
          placeholder="74.5"
          value={currentWeight}
          onChange={(e) => setCurrentWeight(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">How did the week go?</Label>
        <Textarea
          id="notes"
          placeholder="Training consistency, diet adherence, energy levels, anything notable…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {error && (
        <p
          className="text-[0.8125rem] rounded-[var(--r-input)] border px-3 py-2"
          style={{
            borderColor: "var(--destructive)",
            background: "oklch(0.62 0.22 27 / 8%)",
            color: "var(--destructive)",
          }}
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Analyzing…" : "Log this week"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/progress/ProgressForm.tsx src/app/(protected)/progress/page.tsx
git commit -m "fix: progress form layout bug; add week picker for backfilling missed weeks"
```

---

## Task 10: Dashboard — chart empty state + streak/milestone card

**Files:**
- Modify: `src/app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Update dashboard page**

In `src/app/(protected)/dashboard/page.tsx`, replace the weight chart section and add a milestone card after it:

```typescript
{/* Weight chart — always show the card, empty state when < 2 entries */}
<div
  className="rounded-[var(--r-card)] border p-5 space-y-4"
  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
>
  <p
    className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
    style={{ color: "var(--primary)" }}
  >
    Weight over time
  </p>
  {chartData.length >= 2 ? (
    <ProgressChart data={chartData} />
  ) : (
    <p className="text-[0.875rem] py-6 text-center" style={{ color: "var(--muted-foreground)" }}>
      {chartData.length === 0
        ? "Log your first check-in to start tracking."
        : "Log one more week to see your weight trend."}
    </p>
  )}
</div>

{/* Milestone card — show streak and progress percentage */}
{sortedEntries.length > 0 && estimate && (() => {
  const weeksLogged = sortedEntries.length;
  const totalWeeks = Math.round(((estimate.timeframeMin + estimate.timeframeMax) / 2) * 4.33);
  const pct = Math.min(100, Math.round((weeksLogged / totalWeeks) * 100));
  return (
    <div
      className="rounded-[var(--r-card)] border p-5 space-y-3"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <p
        className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--primary)" }}
      >
        Progress milestone
      </p>
      <div className="flex items-center justify-between">
        <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
          {weeksLogged} week{weeksLogged !== 1 ? "s" : ""} logged
        </p>
        <p className="text-[0.875rem] font-semibold" style={{ color: "var(--foreground)" }}>
          {pct}% of estimate
        </p>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "var(--border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "var(--primary)" }}
        />
      </div>
      {weeksLogged >= 4 && (
        <p className="text-[0.8125rem]" style={{ color: "var(--success)" }}>
          {weeksLogged >= 12 ? "Exceptional commitment — 12+ weeks in." : weeksLogged >= 8 ? "8 weeks strong. You're building a real habit." : "4 weeks consistent. Keep the momentum."}
        </p>
      )}
    </div>
  );
})()}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(protected)/dashboard/page.tsx
git commit -m "feat: always show weight chart card with empty state; add milestone progress bar and streak message"
```

---

## Task 11: Deepen progress feedback prompt

**Files:**
- Modify: `src/app/api/progress/route.ts`

The current feedback is capped at "2-3 sentences" — too shallow for the primary engagement surface. Expand to 4-6 sentences with specific actionable guidance.

- [ ] **Step 1: Update the feedback prompt in /api/progress/route.ts**

Find the line:
```
"feedback": "2-3 sentences of specific, honest, actionable coaching feedback based on their actual progress data"
```

Replace with:
```
"feedback": "4-6 sentences of specific, evidence-based coaching feedback. Reference their actual weight numbers and trajectory. If they shared notes, respond to what they said specifically. Give one concrete action to take this week. Be direct but supportive — not generic."
```

- [ ] **Step 2: Increase max_tokens from 512 to 1024 for the progress route**

In the same file, change:
```typescript
max_tokens: 512,
```
to:
```typescript
max_tokens: 1024,
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/progress/route.ts
git commit -m "feat: deepen progress feedback prompt from 2-3 to 4-6 sentences with concrete weekly action"
```

---

## Task 12: Integrate exercise library into plan generator

**Files:**
- Modify: `src/app/api/plan/route.ts`

The curated 60-exercise library in `exercises.json` is currently disconnected from the plan generator — Groq invents its own exercises. Feed the curated library as the preferred exercise pool so plans reference exercises users can find in the library page.

- [ ] **Step 1: Update /api/plan/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import exercises from "@/data/exercises.json";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Exercise = {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: string;
  sets?: number;
  reps?: string;
  duration?: string;
};

const GRAPPLING_SPORTS = new Set(["judo", "bjj", "wrestling", "mma"]);

function buildExercisePool(isGrappling: boolean, workoutSetting: string): string {
  const typedExercises = exercises as Exercise[];

  const strength = typedExercises
    .filter((e) => e.category === "Strength")
    .filter((e) => {
      if (workoutSetting === "home") return e.equipment === "Bodyweight" || e.equipment === "Dumbbell";
      return true;
    })
    .map((e) => `${e.name} (${e.sets ? `${e.sets}×` : ""}${e.reps ?? e.duration ?? ""}, ${e.equipment})`);

  const cardio = typedExercises
    .filter((e) => e.category === "Cardio")
    .map((e) => `${e.name} (${e.sets ? `${e.sets}×` : ""}${e.duration ?? e.reps ?? ""}, ${e.equipment})`);

  const mobility = typedExercises
    .filter((e) => e.category === "Mobility")
    .map((e) => `${e.name} (${e.duration ?? ""})`);

  const recovery = typedExercises
    .filter((e) => e.category === "Recovery")
    .map((e) => `${e.name} (${e.duration ?? ""})`);

  const grappling = isGrappling
    ? typedExercises
        .filter((e) => e.category === "Judo Conditioning")
        .map((e) => `${e.name} (${e.sets ? `${e.sets}×` : ""}${e.reps ?? e.duration ?? ""}, ${e.equipment})`)
    : [];

  let pool = `
EXERCISE LIBRARY (use these names exactly in the plan — users can look them up):

Strength: ${strength.join(" | ")}

Cardio: ${cardio.join(" | ")}

Mobility: ${mobility.join(" | ")}

Recovery: ${recovery.join(" | ")}`;

  if (grappling.length > 0) {
    pool += `\n\nGrappling Conditioning: ${grappling.join(" | ")}`;
  }

  return pool;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("wizard_state")
    .eq("id", user.id)
    .maybeSingle();

  const ws = profile?.wizard_state as Record<string, unknown> | null;
  const onboarding = (ws?.onboarding ?? {}) as Record<string, unknown>;
  const questionnaire = (ws?.questionnaire ?? {}) as Record<string, unknown>;
  const judo = (ws?.judo ?? {}) as Record<string, unknown>;

  const sport = String(questionnaire.sport ?? "none");
  const isGrappling = GRAPPLING_SPORTS.has(sport);
  const workoutSetting = String(questionnaire.workoutSetting ?? "gym");

  const judoLine = isGrappling
    ? `\nGrappling sport (${sport}): ${judo.sessionsPerWeek} sessions/week, ${judo.intensity} intensity${judo.hasCompetitionSoon ? ", competition within 8 weeks" : ""}`
    : "";

  const exercisePool = buildExercisePool(isGrappling, workoutSetting);

  const prompt = `You are an expert fitness and strength coach. Create a detailed, personalized weekly training plan.

User profile:
- Goal: ${questionnaire.goalType ?? "general fitness"}
- Sport: ${sport}${judoLine}
- Experience: ${onboarding.experience ?? "intermediate"}
- Activity level: ${onboarding.activityLevel ?? "moderate"}
- Age: ${onboarding.age ?? "unknown"}, Sex: ${onboarding.sex ?? "unknown"}
- Current weight: ${onboarding.weightKg ?? "unknown"}kg
- Workout setting: ${workoutSetting}
- Injuries/limitations: ${questionnaire.injuries || "none"}
${exercisePool}

IMPORTANT: Use exercise names exactly as they appear in the library above. Do not invent new exercise names.
Include sets and reps in the format: "Exercise Name — 3×8-10".

Return ONLY valid JSON (no markdown fences):
{
  "weekly_schedule": [
    { "day": "Day name", "focus": "Session focus", "exercises": ["Exercise Name — sets×reps", "Exercise Name — duration"] }
  ],
  "nutrition": {
    "calories_guidance": "Concise calorie strategy for their goal",
    "protein_target": "Daily protein target with rationale",
    "meal_timing": "When to eat relative to training"
  },
  "judo_specific": ${isGrappling ? `{ "technical_focus": "Which techniques to prioritize for ${sport}", "conditioning_priority": "Specific conditioning focus for ${sport}" }` : "null"},
  "recovery": {
    "sleep": "Sleep recommendation",
    "active_recovery": "Active recovery activities from the library"
  }
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 2048,
  });

  const rawText = (completion.choices[0].message.content ?? "")
    .trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "");

  let plan: Record<string, unknown>;
  try {
    plan = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const { data: saved, error: insertError } = await supabase
    .from("fitness_plans")
    .insert({ user_id: user.id, plan })
    .select("id, plan, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ plan: saved.plan });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/plan/route.ts
git commit -m "feat: wire exercise library into plan generator — Groq now picks from curated exercises"
```

---

## Task 13: Fix cron listUsers pagination

**Files:**
- Modify: `src/app/api/cron/weekly-reminder/route.ts`

`admin.listUsers()` fetches only the first 1000 users by default and breaks silently above that.

- [ ] **Step 1: Replace the listUsers call with a paginated loop**

In `src/app/api/cron/weekly-reminder/route.ts`, replace:

```typescript
const { data: { users } } = await supabase.auth.admin.listUsers();
```

With:

```typescript
const users: { id: string; email?: string }[] = [];
let page = 1;
const perPage = 1000;
while (true) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
  if (error || !data?.users?.length) break;
  users.push(...data.users);
  if (data.users.length < perPage) break;
  page++;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/cron/weekly-reminder/route.ts
git commit -m "fix: paginate admin.listUsers() in cron route to handle >1000 users"
```

---

## Task 14: Fix TypeScript unsafe casts

**Files:**
- Modify: `src/app/(protected)/dashboard/page.tsx`

The `as { timeframeMin: number; ... }` cast on JSONB data is unsafe. Replace with a runtime-safe type guard.

- [ ] **Step 1: Add a type guard and replace the cast in dashboard/page.tsx**

In `src/app/(protected)/dashboard/page.tsx`, replace:

```typescript
const estimate = profile?.estimate_result as {
  timeframeMin: number;
  timeframeMax: number;
  timeframeUnit: string;
  confidenceLevel: "low" | "medium" | "high";
} | null;
```

With:

```typescript
function parseEstimate(raw: unknown): { timeframeMin: number; timeframeMax: number; timeframeUnit: string; confidenceLevel: "low" | "medium" | "high" } | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.timeframeMin !== "number" || typeof r.timeframeMax !== "number") return null;
  return {
    timeframeMin: r.timeframeMin,
    timeframeMax: r.timeframeMax,
    timeframeUnit: typeof r.timeframeUnit === "string" ? r.timeframeUnit : "months",
    confidenceLevel: (r.confidenceLevel as "low" | "medium" | "high") ?? "medium",
  };
}

const estimate = parseEstimate(profile?.estimate_result);
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(protected)/dashboard/page.tsx
git commit -m "fix: replace unsafe JSONB cast with runtime type guard in dashboard"
```

---

## Task 15: Responsive mobile nav

**Files:**
- Modify: `src/components/layout/Nav.tsx`

The current nav puts 7+ links + theme toggle in a single horizontal row, which overflows below ~400px with no fallback.

- [ ] **Step 1: Replace Nav.tsx with a responsive version**

```typescript
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const tools = [
  { label: "Calculator", href: "/tools/calculator" },
  { label: "Exercises", href: "/tools/exercises" },
];
const protected_ = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Progress", href: "/progress" },
  { label: "Plan", href: "/plan" },
  { label: "Weight Cut", href: "/weight-cut" },
  { label: "Settings", href: "/settings/account" },
];

const allLinks = [...tools, ...protected_];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/coach")) return null;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div
              className="flex size-6 items-center justify-center rounded-full"
              style={{ background: "var(--primary)" }}
            >
              <Zap size={12} fill="var(--primary-foreground)" color="var(--primary-foreground)" />
            </div>
            <span className="text-[0.8125rem] font-semibold">Fitness Coach</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {tools.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-[var(--r-button)] px-3 py-1.5 text-[0.8125rem] transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
            <div aria-hidden="true" className="mx-1 h-4 w-px" style={{ background: "var(--border)" }} />
            {protected_.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-[var(--r-button)] px-3 py-1.5 text-[0.8125rem] transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
            <div aria-hidden="true" className="mx-1 h-4 w-px" style={{ background: "var(--border)" }} />
            <ThemeToggle />
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex size-8 items-center justify-center rounded-[var(--r-button)] transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 pt-12 md:hidden"
          style={{ background: "var(--background)" }}
        >
          <nav className="flex flex-col px-4 py-6 space-y-1">
            {allLinks.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className="rounded-[var(--r-button)] px-3 py-3 text-[0.9375rem] transition-colors"
                  style={{
                    color: active ? "var(--foreground)" : "var(--muted-foreground)",
                    background: active ? "var(--surface)" : "transparent",
                  }}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Nav.tsx
git commit -m "feat: responsive nav with hamburger menu for mobile"
```

---

## Task 16: Add unit tests for calculators

**Files:**
- Modify: `package.json` (add vitest)
- Create: `src/lib/calculators.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Add vitest to package.json**

Add to `devDependencies`:
```json
"vitest": "^2.0.0"
```

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Run: `npm install`

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Create src/lib/calculators.test.ts**

```typescript
import { describe, it, expect } from "vitest";
import { bmi, tdee, bodyFat, idealWeight } from "./calculators";

describe("bmi", () => {
  it("calculates BMI correctly for a 70kg 175cm person", () => {
    const result = bmi(70, 175);
    expect(result.value).toBe(22.9);
    expect(result.category).toBe("Normal");
  });

  it("classifies underweight correctly", () => {
    expect(bmi(50, 180).category).toBe("Underweight");
  });

  it("classifies overweight correctly", () => {
    expect(bmi(90, 175).category).toBe("Overweight");
  });

  it("classifies obese correctly", () => {
    expect(bmi(120, 175).category).toBe("Obese");
  });
});

describe("tdee", () => {
  it("calculates male TDEE with Mifflin-St Jeor correctly", () => {
    // Male, 80kg, 180cm, 25yo, sedentary (×1.2)
    // BMR = 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
    // TDEE = 1805 * 1.2 = 2166
    expect(tdee(80, 180, 25, "male", 1.2)).toBe(2166);
  });

  it("calculates female TDEE with Mifflin-St Jeor correctly", () => {
    // Female, 60kg, 165cm, 30yo, moderate (×1.55)
    // BMR = 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    // TDEE = 1320.25 * 1.55 = 2046.39 → 2046
    expect(tdee(60, 165, 30, "female", 1.55)).toBe(2046);
  });

  it("returns a higher TDEE for more active users", () => {
    const sedentary = tdee(70, 170, 28, "male", 1.2);
    const active = tdee(70, 170, 28, "male", 1.725);
    expect(active).toBeGreaterThan(sedentary);
  });
});

describe("bodyFat", () => {
  it("calculates male body fat % using US Navy formula", () => {
    // Male, 180cm, waist 85cm, neck 38cm
    // log10(85-38) = log10(47) ≈ 1.6721
    // log10(180) ≈ 2.2553
    // result = 495 / (1.0324 - 0.19077*1.6721 + 0.15456*2.2553) - 450
    const result = bodyFat("male", 180, 85, 38);
    expect(result).toBeGreaterThan(10);
    expect(result).toBeLessThan(25);
  });

  it("calculates female body fat % using US Navy formula", () => {
    const result = bodyFat("female", 165, 75, 33, 97);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(18);
    expect(result!).toBeLessThan(40);
  });

  it("returns null for female with no hips measurement", () => {
    expect(bodyFat("female", 165, 75, 33)).toBeNull();
  });
});

describe("idealWeight", () => {
  it("calculates male ideal weight range using Devine formula", () => {
    // Male, 180cm = 70.9 inches, inches over 5ft = 10.9
    // base = 50, mid = 50 + 2.3*10.9 = 75.07
    const result = idealWeight(180, "male");
    expect(result.min).toBeLessThan(result.max);
    expect(result.min).toBeCloseTo(67.6, 0);
    expect(result.max).toBeCloseTo(82.6, 0);
  });

  it("calculates female ideal weight range using Devine formula", () => {
    // Female, 165cm = 64.96 inches, over 5ft = 4.96
    // base = 45.5, mid = 45.5 + 2.3*4.96 = 56.9
    const result = idealWeight(165, "female");
    expect(result.min).toBeLessThan(result.max);
    expect(result.min).toBeCloseTo(51.2, 0);
  });

  it("returns equal min/max for someone exactly 5ft tall", () => {
    const result = idealWeight(152.4, "male"); // exactly 5ft
    expect(result.min).toBeLessThanOrEqual(result.max);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected output: All 12 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculators.test.ts vitest.config.ts package.json package-lock.json
git commit -m "test: add vitest unit tests for all calculator functions (bmi, tdee, bodyFat, idealWeight)"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Photo lie fixed (Task 4)
- ✅ Upsell dead end (Task 8)
- ✅ Silent upsert error (Task 5)
- ✅ Wizard localStorage (Task 3)
- ✅ Week backfill (Task 9)
- ✅ Dashboard chart empty state + milestone (Task 10)
- ✅ Feedback depth (Task 11)
- ✅ Calculator tests (Task 16)
- ✅ TypeScript unsafe cast in dashboard (Task 14)
- ✅ Cron pagination (Task 13)
- ✅ Dead dependencies (Task 1)
- ✅ Sport field expansion (Task 2 + 7)
- ✅ Forgot password (Task 6)
- ✅ Mobile nav (Task 15)
- ✅ ProgressForm layout (Task 9)
- ✅ Exercise library integration (Task 12)

**Type consistency:** `Sport` type defined in Task 2, imported in Task 3 (WizardContext) and Task 7 (SportSelector). `buildEstimatePrompt` signature `(state, hasPhotos: boolean)` defined in Task 4 and must match wherever called — only called from `lib/estimate.ts`, verify that file passes `hasPhotos`.

**Remaining risk:** `lib/estimate.ts` needs to pass `hasPhotos` to `buildEstimatePrompt`. Check Task 4 Step 4 note — if `estimate.ts` calls `buildEstimatePrompt(state)` directly, update it to `buildEstimatePrompt(state, !!(state.photos.currentPhotoBase64 && state.photos.goalPhotoBase64))`.
