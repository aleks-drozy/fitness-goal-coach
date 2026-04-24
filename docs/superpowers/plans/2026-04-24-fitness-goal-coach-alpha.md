# Fitness Goal Coach — Alpha Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working alpha that lets a user onboard, upload body photos with consent, answer a questionnaire (including judo mode), receive an AI-generated estimate range with reasoning, and see a premium upsell screen.

**Architecture:** Multi-step wizard using Next.js App Router with a single `WizardContext` holding all form state client-side; the estimate is generated server-side via a Next.js Route Handler that calls the Claude API; photos are sent as base64 in the API call and never persisted server-side.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Claude API (`@anthropic-ai/sdk`), TypeScript, Vercel deployment.

---

## File Map

```
src/
  app/
    layout.tsx                    — root layout, font, global CSS
    page.tsx                      — landing page
    coach/
      layout.tsx                  — wizard shell (progress bar, step wrapper)
      page.tsx                    — redirects to /coach/onboarding
      onboarding/page.tsx         — step 1: personal info form
      photos/page.tsx             — step 2: consent + photo upload
      questionnaire/page.tsx      — step 3: goal + training questions
      judo/page.tsx               — step 3b: judo sub-flow (conditional)
      results/page.tsx            — step 4: estimate output
      upsell/page.tsx             — step 5: premium CTA
  components/
    ui/                           — shadcn primitives (button, input, card, etc.)
    wizard/
      StepHeader.tsx              — title + subtitle for each step
      ProgressBar.tsx             — step indicator
      NavButtons.tsx              — back / next / submit
    onboarding/
      PersonalInfoForm.tsx        — age, sex, height, weight, experience, activity
    photos/
      ConsentGate.tsx             — consent checkbox + disclaimer
      PhotoUpload.tsx             — drag-drop / click-to-upload, preview
    questionnaire/
      GoalForm.tsx                — goal type, workout setting, injuries
      SportSelector.tsx           — sport picker (judo is the only alpha option)
    judo/
      JudoForm.tsx                — sessions/week, intensity, competition, weekly log
    results/
      EstimateCard.tsx            — timeframe range + confidence badge
      ReasoningBlock.tsx          — bullet explanation of estimate
      TrainingGuidance.tsx        — weekly training structure
      NutritionNote.tsx           — high-level calorie/protein note
      Disclaimer.tsx              — safety + non-medical footer
    upsell/
      PremiumCard.tsx             — feature list + CTA
  context/
    WizardContext.tsx             — React context + provider holding all wizard state
  lib/
    types.ts                      — shared TypeScript interfaces
    prompts.ts                    — Claude prompt builder
    estimate.ts                   — server-side estimate fetcher (calls Route Handler)
  app/api/
    estimate/route.ts             — POST handler: receives wizard state, calls Claude API, returns structured JSON
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Bootstrap Next.js app with TypeScript and Tailwind**

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

Expected output: project files generated, `npm run dev` works.

- [ ] **Step 2: Install shadcn/ui**

```bash
npx shadcn@latest init -d
```

Select: New York style, Zinc base color, CSS variables yes.

- [ ] **Step 3: Add required shadcn components**

```bash
npx shadcn@latest add button input label card badge progress textarea select checkbox radio-group separator
```

- [ ] **Step 4: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 5: Create `.env.local`**

```bash
cat > .env.local << 'EOF'
ANTHROPIC_API_KEY=sk-ant-REPLACE_ME
EOF
```

- [ ] **Step 6: Verify dev server runs**

```bash
npm run dev
```

Expected: `http://localhost:3000` returns the default Next.js page with no errors.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: bootstrap Next.js + Tailwind + shadcn + Anthropic SDK"
```

---

## Task 2: Shared Types + Wizard Context

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/context/WizardContext.tsx`

- [ ] **Step 1: Write types**

Create `src/lib/types.ts`:

```typescript
export type Sex = "male" | "female" | "other";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type GoalType = "fat_loss" | "muscle_gain" | "recomposition";
export type WorkoutSetting = "gym" | "home" | "both";
export type JudoIntensity = "light" | "moderate" | "hard";

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
  sport: "judo" | "none";
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

- [ ] **Step 2: Write WizardContext**

Create `src/context/WizardContext.tsx`:

```typescript
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { WizardState, OnboardingData, PhotoData, QuestionnaireData, JudoData } from "@/lib/types";

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
    sport: "none",
  },
  judo: {
    sessionsPerWeek: null,
    intensity: null,
    hasCompetitionSoon: false,
    weeklySessionLog: "",
  },
};

interface WizardContextValue {
  state: WizardState;
  setOnboarding: (data: Partial<OnboardingData>) => void;
  setPhotos: (data: Partial<PhotoData>) => void;
  setQuestionnaire: (data: Partial<QuestionnaireData>) => void;
  setJudo: (data: Partial<JudoData>) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(defaultState);

  const setOnboarding = (data: Partial<OnboardingData>) =>
    setState((s) => ({ ...s, onboarding: { ...s.onboarding, ...data } }));

  const setPhotos = (data: Partial<PhotoData>) =>
    setState((s) => ({ ...s, photos: { ...s.photos, ...data } }));

  const setQuestionnaire = (data: Partial<QuestionnaireData>) =>
    setState((s) => ({ ...s, questionnaire: { ...s.questionnaire, ...data } }));

  const setJudo = (data: Partial<JudoData>) =>
    setState((s) => ({ ...s, judo: { ...s.judo, ...data } }));

  return (
    <WizardContext.Provider value={{ state, setOnboarding, setPhotos, setQuestionnaire, setJudo }}>
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

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/context/WizardContext.tsx
git commit -m "feat: add shared types and WizardContext"
```

---

## Task 3: Root Layout + Landing Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update root layout with Inter font and WizardProvider**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WizardProvider } from "@/context/WizardContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fitness Goal Coach",
  description: "Get a realistic estimate of what your fitness goal may take.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-zinc-950 text-zinc-50 font-sans antialiased">
        <WizardProvider>{children}</WizardProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update globals.css**

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-inter: "Inter", sans-serif;
}

body {
  font-family: var(--font-inter);
}
```

- [ ] **Step 3: Write landing page**

Replace `src/app/page.tsx`:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xl space-y-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
          Fitness Goal Coach
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
          How long will your goal actually take?
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Upload a photo of your current physique and your goal, answer a few questions,
          and get a realistic, evidence-informed estimate — not a promise.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100 font-medium">
            <Link href="/coach/onboarding">Get my estimate →</Link>
          </Button>
        </div>
        <p className="text-xs text-zinc-600 max-w-sm mx-auto">
          This tool provides general fitness estimates only. It is not medical advice and does not
          replace a doctor, physiotherapist, or qualified coach.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify landing renders**

```bash
npm run dev
```

Visit `http://localhost:3000`. Expected: dark background, headline, CTA button, disclaimer text.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat: landing page with dark theme and CTA"
```

---

## Task 4: Wizard Shell (Layout + Progress Bar)

**Files:**
- Create: `src/app/coach/layout.tsx`
- Create: `src/components/wizard/ProgressBar.tsx`
- Create: `src/components/wizard/StepHeader.tsx`
- Create: `src/components/wizard/NavButtons.tsx`

- [ ] **Step 1: Create ProgressBar component**

Create `src/components/wizard/ProgressBar.tsx`:

```typescript
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const pct = Math.round((currentStep / totalSteps) * 100);
  return (
    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-white rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create StepHeader component**

Create `src/components/wizard/StepHeader.tsx`:

```typescript
interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-zinc-400 text-sm leading-relaxed">{subtitle}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Create NavButtons component**

Create `src/components/wizard/NavButtons.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface NavButtonsProps {
  backHref?: string;
  onNext?: () => void;
  nextLabel?: string;
  nextHref?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function NavButtons({
  backHref,
  onNext,
  nextLabel = "Continue",
  nextHref,
  disabled,
  isLoading,
}: NavButtonsProps) {
  const router = useRouter();

  const handleNext = () => {
    if (onNext) onNext();
    if (nextHref) router.push(nextHref);
  };

  return (
    <div className="flex items-center justify-between pt-6">
      {backHref ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-500 hover:text-zinc-200"
          onClick={() => router.push(backHref)}
        >
          ← Back
        </Button>
      ) : (
        <div />
      )}
      <Button
        onClick={handleNext}
        disabled={disabled || isLoading}
        className="bg-white text-zinc-950 hover:bg-zinc-100 font-medium"
      >
        {isLoading ? "Loading…" : nextLabel}
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Create coach layout**

Create `src/app/coach/layout.tsx`:

```typescript
export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-12">
      <div className="w-full max-w-lg space-y-8">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create coach index redirect**

Create `src/app/coach/page.tsx`:

```typescript
import { redirect } from "next/navigation";
export default function CoachPage() {
  redirect("/coach/onboarding");
}
```

- [ ] **Step 6: Verify `/coach` redirects to `/coach/onboarding` (404 is expected for now)**

```bash
npm run dev
```

Visit `http://localhost:3000/coach`. Expected: redirect attempt (onboarding not built yet → 404 page).

- [ ] **Step 7: Commit**

```bash
git add src/app/coach/ src/components/wizard/
git commit -m "feat: wizard shell layout, ProgressBar, StepHeader, NavButtons"
```

---

## Task 5: Onboarding Step (Personal Info)

**Files:**
- Create: `src/components/onboarding/PersonalInfoForm.tsx`
- Create: `src/app/coach/onboarding/page.tsx`

- [ ] **Step 1: Create PersonalInfoForm**

Create `src/components/onboarding/PersonalInfoForm.tsx`:

```typescript
"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sex, ExperienceLevel, ActivityLevel } from "@/lib/types";

export function PersonalInfoForm() {
  const { state, setOnboarding } = useWizard();
  const { onboarding } = state;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name">First name</Label>
          <Input
            id="name"
            placeholder="Alex"
            value={onboarding.name}
            onChange={(e) => setOnboarding({ name: e.target.value })}
            className="bg-zinc-900 border-zinc-800"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={16}
            max={80}
            placeholder="25"
            value={onboarding.age ?? ""}
            onChange={(e) => setOnboarding({ age: e.target.value ? Number(e.target.value) : null })}
            className="bg-zinc-900 border-zinc-800"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sex</Label>
          <Select
            value={onboarding.sex ?? ""}
            onValueChange={(v) => setOnboarding({ sex: v as Sex })}
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="175"
            value={onboarding.heightCm ?? ""}
            onChange={(e) => setOnboarding({ heightCm: e.target.value ? Number(e.target.value) : null })}
            className="bg-zinc-900 border-zinc-800"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="75"
            value={onboarding.weightKg ?? ""}
            onChange={(e) => setOnboarding({ weightKg: e.target.value ? Number(e.target.value) : null })}
            className="bg-zinc-900 border-zinc-800"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Training experience</Label>
          <Select
            value={onboarding.experience ?? ""}
            onValueChange={(v) => setOnboarding({ experience: v as ExperienceLevel })}
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (0–1 yr)</SelectItem>
              <SelectItem value="intermediate">Intermediate (1–3 yrs)</SelectItem>
              <SelectItem value="advanced">Advanced (3+ yrs)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Activity level</Label>
          <Select
            value={onboarding.activityLevel ?? ""}
            onValueChange={(v) => setOnboarding({ activityLevel: v as ActivityLevel })}
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (desk job, little exercise)</SelectItem>
              <SelectItem value="light">Light (1–2 sessions/week)</SelectItem>
              <SelectItem value="moderate">Moderate (3–4 sessions/week)</SelectItem>
              <SelectItem value="active">Active (5–6 sessions/week)</SelectItem>
              <SelectItem value="very_active">Very active (daily + sport)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create onboarding page**

Create `src/app/coach/onboarding/page.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useWizard } from "@/context/WizardContext";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { NavButtons } from "@/components/wizard/NavButtons";
import { PersonalInfoForm } from "@/components/onboarding/PersonalInfoForm";

export default function OnboardingPage() {
  const { state } = useWizard();
  const router = useRouter();
  const { onboarding } = state;

  const isValid =
    onboarding.name.trim().length > 0 &&
    onboarding.age !== null &&
    onboarding.sex !== null &&
    onboarding.heightCm !== null &&
    onboarding.weightKg !== null &&
    onboarding.experience !== null &&
    onboarding.activityLevel !== null;

  return (
    <>
      <ProgressBar currentStep={1} totalSteps={5} />
      <StepHeader
        title="Tell us about yourself"
        subtitle="This helps us give you a more accurate estimate. All information stays on your device."
      />
      <PersonalInfoForm />
      <NavButtons
        nextHref="/coach/photos"
        disabled={!isValid}
        nextLabel="Continue"
      />
    </>
  );
}
```

- [ ] **Step 3: Verify onboarding page renders and form validation works**

```bash
npm run dev
```

Visit `http://localhost:3000/coach/onboarding`. Expected: form with all fields, Continue button disabled until all fields filled.

- [ ] **Step 4: Commit**

```bash
git add src/app/coach/onboarding/ src/components/onboarding/
git commit -m "feat: onboarding step with personal info form"
```

---

## Task 6: Photo Upload Step (Consent + Upload)

**Files:**
- Create: `src/components/photos/ConsentGate.tsx`
- Create: `src/components/photos/PhotoUpload.tsx`
- Create: `src/app/coach/photos/page.tsx`

- [ ] **Step 1: Create ConsentGate**

Create `src/components/photos/ConsentGate.tsx`:

```typescript
"use client";

import { useWizard } from "@/context/WizardContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function ConsentGate() {
  const { state, setPhotos } = useWizard();
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      <p className="text-sm font-medium text-zinc-200">Before you upload</p>
      <ul className="text-sm text-zinc-400 space-y-1.5 list-disc list-inside">
        <li>Photos are used only to analyse your starting point and goal.</li>
        <li>They are not stored on our servers after analysis.</li>
        <li>Goal photos may depict different genetics, lighting, or editing — we will note this.</li>
        <li>Image analysis may be imperfect and is not a medical assessment.</li>
      </ul>
      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          id="consent"
          checked={state.photos.consentGiven}
          onCheckedChange={(v) => setPhotos({ consentGiven: Boolean(v) })}
        />
        <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
          I understand and consent to my photos being processed for this estimate.
        </Label>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create PhotoUpload component**

Create `src/components/photos/PhotoUpload.tsx`:

```typescript
"use client";

import { useRef } from "react";
import Image from "next/image";

interface PhotoUploadProps {
  label: string;
  hint?: string;
  base64Value: string | null;
  onChange: (base64: string) => void;
}

export function PhotoUpload({ label, hint, base64Value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-200">{label}</p>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border border-dashed border-zinc-700 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors"
        style={{ minHeight: 200 }}
      >
        {base64Value ? (
          <Image
            src={base64Value}
            alt={label}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-zinc-500 gap-2 p-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-sm">Click or drag to upload</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create photos page**

Create `src/app/coach/photos/page.tsx`:

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

  const isValid =
    photos.consentGiven &&
    photos.currentPhotoBase64 !== null &&
    photos.goalPhotoBase64 !== null;

  return (
    <>
      <ProgressBar currentStep={2} totalSteps={5} />
      <StepHeader
        title="Your photos"
        subtitle="Upload a current photo and a goal physique photo. Read the notice below first."
      />
      <ConsentGate />
      {photos.consentGiven && (
        <div className="space-y-6">
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
      )}
      <NavButtons
        backHref="/coach/onboarding"
        nextHref="/coach/questionnaire"
        disabled={!isValid}
      />
    </>
  );
}
```

- [ ] **Step 4: Verify photos step: consent must be given before upload appears, both photos required to continue**

```bash
npm run dev
```

Visit `http://localhost:3000/coach/photos`. Expected: consent box shown, upload areas appear only after checking consent, Continue disabled until both photos uploaded.

- [ ] **Step 5: Commit**

```bash
git add src/app/coach/photos/ src/components/photos/
git commit -m "feat: photo upload step with consent gate"
```

---

## Task 7: Questionnaire Step + Sport Selector

**Files:**
- Create: `src/components/questionnaire/GoalForm.tsx`
- Create: `src/components/questionnaire/SportSelector.tsx`
- Create: `src/app/coach/questionnaire/page.tsx`

- [ ] **Step 1: Create GoalForm**

Create `src/components/questionnaire/GoalForm.tsx`:

```typescript
"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoalType, WorkoutSetting } from "@/lib/types";

export function GoalForm() {
  const { state, setQuestionnaire } = useWizard();
  const { questionnaire } = state;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Primary goal</Label>
        <Select
          value={questionnaire.goalType ?? ""}
          onValueChange={(v) => setQuestionnaire({ goalType: v as GoalType })}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="Select your goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fat_loss">Fat loss</SelectItem>
            <SelectItem value="muscle_gain">Muscle gain</SelectItem>
            <SelectItem value="recomposition">Body recomposition (both)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Workout setting</Label>
        <Select
          value={questionnaire.workoutSetting ?? ""}
          onValueChange={(v) => setQuestionnaire({ workoutSetting: v as WorkoutSetting })}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="Where do you train?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gym">Gym</SelectItem>
            <SelectItem value="home">Home (limited equipment)</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="injuries">
          Any injuries, pain, or limitations?
          <span className="ml-1 text-xs text-zinc-500 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="injuries"
          placeholder="e.g. left knee pain, lower back issues, avoid overhead pressing"
          value={questionnaire.injuries}
          onChange={(e) => setQuestionnaire({ injuries: e.target.value })}
          className="bg-zinc-900 border-zinc-800 resize-none"
          rows={3}
        />
        <p className="text-xs text-zinc-600">
          If you have a serious injury or pain, please consult a qualified physiotherapist.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SportSelector**

Create `src/components/questionnaire/SportSelector.tsx`:

```typescript
"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";

export function SportSelector() {
  const { state, setQuestionnaire } = useWizard();
  const { sport } = state.questionnaire;

  const options: { value: "none" | "judo"; label: string; description: string }[] = [
    { value: "none", label: "No sport", description: "Just gym or general fitness training" },
    { value: "judo", label: "Judo", description: "I train judo regularly alongside my fitness goals" },
  ];

  return (
    <div className="space-y-2">
      <Label>Do you also train a sport?</Label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setQuestionnaire({ sport: opt.value })}
            className={`text-left rounded-xl border p-4 transition-colors ${
              sport === opt.value
                ? "border-white bg-zinc-800"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
            }`}
          >
            <p className="text-sm font-medium">{opt.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create questionnaire page**

Create `src/app/coach/questionnaire/page.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useWizard } from "@/context/WizardContext";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { NavButtons } from "@/components/wizard/NavButtons";
import { GoalForm } from "@/components/questionnaire/GoalForm";
import { SportSelector } from "@/components/questionnaire/SportSelector";

export default function QuestionnairePage() {
  const { state } = useWizard();
  const router = useRouter();
  const { questionnaire } = state;

  const isValid =
    questionnaire.goalType !== null &&
    questionnaire.workoutSetting !== null;

  const handleNext = () => {
    if (questionnaire.sport === "judo") {
      router.push("/coach/judo");
    } else {
      router.push("/coach/results");
    }
  };

  return (
    <>
      <ProgressBar currentStep={3} totalSteps={5} />
      <StepHeader
        title="Your goal and training"
        subtitle="A few more details help us tailor the estimate to your situation."
      />
      <GoalForm />
      <SportSelector />
      <NavButtons
        backHref="/coach/photos"
        onNext={handleNext}
        disabled={!isValid}
      />
    </>
  );
}
```

- [ ] **Step 4: Verify questionnaire renders, sport selection works, routing branches correctly**

```bash
npm run dev
```

Visit `http://localhost:3000/coach/questionnaire`. Expected: goal + setting dropdowns, sport selector tiles, Continue button routes to /coach/judo or /coach/results based on selection.

- [ ] **Step 5: Commit**

```bash
git add src/app/coach/questionnaire/ src/components/questionnaire/
git commit -m "feat: questionnaire step with goal form and sport selector"
```

---

## Task 8: Judo Mode Step

**Files:**
- Create: `src/components/judo/JudoForm.tsx`
- Create: `src/app/coach/judo/page.tsx`

- [ ] **Step 1: Create JudoForm**

Create `src/components/judo/JudoForm.tsx`:

```typescript
"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JudoIntensity } from "@/lib/types";

export function JudoForm() {
  const { state, setJudo } = useWizard();
  const { judo } = state;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="sessions">Judo sessions per week</Label>
        <Input
          id="sessions"
          type="number"
          min={1}
          max={14}
          placeholder="3"
          value={judo.sessionsPerWeek ?? ""}
          onChange={(e) => setJudo({ sessionsPerWeek: e.target.value ? Number(e.target.value) : null })}
          className="bg-zinc-900 border-zinc-800"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Average session intensity</Label>
        <Select
          value={judo.intensity ?? ""}
          onValueChange={(v) => setJudo({ intensity: v as JudoIntensity })}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="Select intensity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light (technique, drilling)</SelectItem>
            <SelectItem value="moderate">Moderate (randori, mixed)</SelectItem>
            <SelectItem value="hard">Hard (competition prep, heavy sparring)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="competition"
          checked={judo.hasCompetitionSoon}
          onCheckedChange={(v) => setJudo({ hasCompetitionSoon: Boolean(v) })}
        />
        <Label htmlFor="competition" className="text-sm leading-relaxed cursor-pointer">
          I have a competition or grading within the next 8 weeks
        </Label>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="weeklog">
          What did you do in judo this week?
          <span className="ml-1 text-xs text-zinc-500 font-normal">(optional but helpful)</span>
        </Label>
        <Textarea
          id="weeklog"
          placeholder="e.g. 2 randori sessions, worked on grip fighting, uchi-komi sets, drills"
          value={judo.weeklySessionLog}
          onChange={(e) => setJudo({ weeklySessionLog: e.target.value })}
          className="bg-zinc-900 border-zinc-800 resize-none"
          rows={3}
        />
        <p className="text-xs text-zinc-600">
          This helps us estimate how much training volume and fatigue to factor in when suggesting S&amp;C work.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create judo page**

Create `src/app/coach/judo/page.tsx`:

```typescript
"use client";

import { useWizard } from "@/context/WizardContext";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { NavButtons } from "@/components/wizard/NavButtons";
import { JudoForm } from "@/components/judo/JudoForm";

export default function JudoPage() {
  const { state } = useWizard();
  const { judo } = state;

  const isValid =
    judo.sessionsPerWeek !== null &&
    judo.intensity !== null;

  return (
    <>
      <ProgressBar currentStep={4} totalSteps={5} />
      <StepHeader
        title="Judo training details"
        subtitle="We'll factor your judo load into the S&C recommendations so the plan supports — not fights — your mat time."
      />
      <JudoForm />
      <NavButtons
        backHref="/coach/questionnaire"
        nextHref="/coach/results"
        disabled={!isValid}
        nextLabel="Get my estimate"
      />
    </>
  );
}
```

- [ ] **Step 3: Verify judo page renders and validates**

```bash
npm run dev
```

Visit `http://localhost:3000/coach/judo`. Expected: all four judo fields, Get my estimate button disabled until sessions + intensity filled.

- [ ] **Step 4: Commit**

```bash
git add src/app/coach/judo/ src/components/judo/
git commit -m "feat: judo mode step"
```

---

## Task 9: Claude API Route Handler + Prompt

**Files:**
- Create: `src/lib/prompts.ts`
- Create: `src/app/api/estimate/route.ts`

- [ ] **Step 1: Create prompt builder**

Create `src/lib/prompts.ts`:

```typescript
import { WizardState } from "./types";

export function buildEstimatePrompt(state: WizardState): string {
  const { onboarding, questionnaire, judo } = state;

  const judoSection =
    questionnaire.sport === "judo"
      ? `
JUDO TRAINING:
- Sessions per week: ${judo.sessionsPerWeek}
- Intensity: ${judo.intensity}
- Competition soon (within 8 weeks): ${judo.hasCompetitionSoon ? "yes" : "no"}
- Weekly session log: ${judo.weeklySessionLog || "not provided"}
`
      : "";

  return `You are an experienced, evidence-based fitness coach. You give realistic, honest estimates — never false promises.

USER PROFILE:
- Name: ${onboarding.name}
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
${judoSection}
PHOTO CONTEXT:
The user has uploaded a current body photo and a goal physique photo. Acknowledge that the goal photo may show different genetics, lighting, or editing. Do not over-promise based on photos.

TASK:
Return a JSON object with this exact structure. Do not include any text outside the JSON.

{
  "timeframeMin": <integer months>,
  "timeframeMax": <integer months>,
  "timeframeUnit": "months",
  "confidenceLevel": "low" | "medium" | "high",
  "reasoning": [<3-5 short bullet strings explaining the estimate>],
  "trainingGuidance": [<3-5 short bullet strings about weekly training structure>],
  "nutritionNote": "<1-2 sentence high-level nutrition guidance — NOT a meal plan, NOT calorie counting>",
  "disclaimer": "This estimate is for general guidance only. It is not medical advice and does not replace a doctor, physiotherapist, registered dietitian, or qualified coach."
}

Rules:
- timeframeMin and timeframeMax must form a realistic range (e.g. 6 and 12), never exact
- confidenceLevel reflects how complete the data is and how predictable the goal is
- reasoning must be honest and mention limiting factors (genetics, consistency, recovery)
- If injuries are reported, note the recommendation to see a physiotherapist
- If judo sport is selected, factor judo fatigue into training guidance
- Wording must be cautious, supportive, and non-medical
- Never claim the app can perfectly predict body transformation`;
}
```

- [ ] **Step 2: Create estimate Route Handler**

Create `src/app/api/estimate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildEstimatePrompt } from "@/lib/prompts";
import { WizardState, EstimateResult } from "@/lib/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const body = await req.json() as { state: WizardState };
  const { state } = body;

  const prompt = buildEstimatePrompt(state);

  const images: Anthropic.ImageBlockParam[] = [];

  if (state.photos.currentPhotoBase64) {
    const base64Data = state.photos.currentPhotoBase64.split(",")[1];
    images.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: base64Data,
      },
    });
  }

  if (state.photos.goalPhotoBase64) {
    const base64Data = state.photos.goalPhotoBase64.split(",")[1];
    images.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: base64Data,
      },
    });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          ...images,
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const rawText = (message.content[0] as Anthropic.TextBlock).text;

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

- [ ] **Step 3: Verify the route handler compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds (no TypeScript errors in the API route).

- [ ] **Step 4: Commit**

```bash
git add src/lib/prompts.ts src/app/api/estimate/
git commit -m "feat: Claude API route handler and prompt builder"
```

---

## Task 10: Results Screen

**Files:**
- Create: `src/components/results/EstimateCard.tsx`
- Create: `src/components/results/ReasoningBlock.tsx`
- Create: `src/components/results/TrainingGuidance.tsx`
- Create: `src/components/results/NutritionNote.tsx`
- Create: `src/components/results/Disclaimer.tsx`
- Create: `src/lib/estimate.ts`
- Create: `src/app/coach/results/page.tsx`

- [ ] **Step 1: Create client-side estimate fetcher**

Create `src/lib/estimate.ts`:

```typescript
import { WizardState, EstimateResult } from "./types";

export async function fetchEstimate(state: WizardState): Promise<EstimateResult> {
  const res = await fetch("/api/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) throw new Error("Failed to fetch estimate");
  return res.json();
}
```

- [ ] **Step 2: Create EstimateCard**

Create `src/components/results/EstimateCard.tsx`:

```typescript
import { EstimateResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const confidenceLabel = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

const confidenceColor = {
  low: "bg-zinc-700 text-zinc-300",
  medium: "bg-yellow-900 text-yellow-300",
  high: "bg-green-900 text-green-300",
};

interface EstimateCardProps {
  result: EstimateResult;
}

export function EstimateCard({ result }: EstimateCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Estimated timeframe</p>
      <p className="text-5xl font-semibold tracking-tight">
        {result.timeframeMin}–{result.timeframeMax}
        <span className="text-2xl font-normal text-zinc-400 ml-2">months</span>
      </p>
      <Badge
        className={`text-xs font-medium px-3 py-1 rounded-full ${confidenceColor[result.confidenceLevel]}`}
      >
        {confidenceLabel[result.confidenceLevel]}
      </Badge>
    </div>
  );
}
```

- [ ] **Step 3: Create ReasoningBlock**

Create `src/components/results/ReasoningBlock.tsx`:

```typescript
interface ReasoningBlockProps {
  reasoning: string[];
}

export function ReasoningBlock({ reasoning }: ReasoningBlockProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">Why this estimate?</p>
      <ul className="space-y-2">
        {reasoning.map((point, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600 shrink-0">—</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Create TrainingGuidance**

Create `src/components/results/TrainingGuidance.tsx`:

```typescript
interface TrainingGuidanceProps {
  guidance: string[];
}

export function TrainingGuidance({ guidance }: TrainingGuidanceProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">Suggested training structure</p>
      <ul className="space-y-2">
        {guidance.map((point, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600 shrink-0 font-medium">{i + 1}.</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Create NutritionNote**

Create `src/components/results/NutritionNote.tsx`:

```typescript
interface NutritionNoteProps {
  note: string;
}

export function NutritionNote({ note }: NutritionNoteProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Nutrition (general)</p>
      <p className="text-sm text-zinc-300 leading-relaxed">{note}</p>
    </div>
  );
}
```

- [ ] **Step 6: Create Disclaimer**

Create `src/components/results/Disclaimer.tsx`:

```typescript
export function Disclaimer() {
  return (
    <p className="text-xs text-zinc-600 leading-relaxed border-t border-zinc-800 pt-4">
      This estimate is for general guidance only. It is not medical advice and does not replace a
      doctor, physiotherapist, registered dietitian, or qualified coach. Timelines depend on
      many individual factors including genetics, consistency, sleep, stress, and nutrition.
      Progress will vary.
    </p>
  );
}
```

- [ ] **Step 7: Create results page**

Create `src/app/coach/results/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWizard } from "@/context/WizardContext";
import { fetchEstimate } from "@/lib/estimate";
import { EstimateResult } from "@/lib/types";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { EstimateCard } from "@/components/results/EstimateCard";
import { ReasoningBlock } from "@/components/results/ReasoningBlock";
import { TrainingGuidance } from "@/components/results/TrainingGuidance";
import { NutritionNote } from "@/components/results/NutritionNote";
import { Disclaimer } from "@/components/results/Disclaimer";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const { state } = useWizard();
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstimate(state)
      .then(setResult)
      .catch(() => setError("Something went wrong generating your estimate. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-400">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        <p className="text-sm">Generating your estimate…</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-sm">{error}</p>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <ProgressBar currentStep={5} totalSteps={5} />
      <StepHeader
        title={`${state.onboarding.name ? state.onboarding.name + "'s" : "Your"} estimate`}
        subtitle="Based on what you've told us. This is a realistic range, not a guarantee."
      />
      <div className="space-y-6">
        <EstimateCard result={result} />
        <ReasoningBlock reasoning={result.reasoning} />
        <TrainingGuidance guidance={result.trainingGuidance} />
        <NutritionNote note={result.nutritionNote} />
        <Disclaimer />
        <div className="pt-2">
          <Button asChild className="w-full bg-white text-zinc-950 hover:bg-zinc-100 font-medium">
            <Link href="/coach/upsell">See what's included in Premium →</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 8: Verify results page renders the loading state and calls the API**

```bash
npm run dev
```

Visit `http://localhost:3000/coach/results` (with ANTHROPIC_API_KEY set). Expected: spinner → estimate card + reasoning + training guidance + nutrition note + disclaimer.

- [ ] **Step 9: Commit**

```bash
git add src/app/coach/results/ src/components/results/ src/lib/estimate.ts
git commit -m "feat: results screen with estimate card, reasoning, training guidance"
```

---

## Task 11: Premium Upsell Screen

**Files:**
- Create: `src/components/upsell/PremiumCard.tsx`
- Create: `src/app/coach/upsell/page.tsx`

- [ ] **Step 1: Create PremiumCard**

Create `src/components/upsell/PremiumCard.tsx`:

```typescript
import { Button } from "@/components/ui/button";

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
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 space-y-5">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Premium Coaching</p>
        <p className="text-2xl font-semibold">Everything you need to actually get there</p>
      </div>
      <ul className="space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-300">
            <span className="text-green-400 shrink-0">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        className="w-full bg-white text-zinc-950 hover:bg-zinc-100 font-medium"
        size="lg"
        disabled
      >
        Coming soon — join the waitlist
      </Button>
      <p className="text-xs text-zinc-600 text-center">
        Premium is not yet available. You will be notified when it launches.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create upsell page**

Create `src/app/coach/upsell/page.tsx`:

```typescript
import Link from "next/link";
import { StepHeader } from "@/components/wizard/StepHeader";
import { PremiumCard } from "@/components/upsell/PremiumCard";
import { Button } from "@/components/ui/button";

export default function UpsellPage() {
  return (
    <div className="space-y-8">
      <StepHeader
        title="Want a full plan?"
        subtitle="Your free estimate is ready. Upgrade to get a detailed, personalised coaching plan."
      />
      <PremiumCard />
      <div className="text-center">
        <Button variant="ghost" asChild className="text-zinc-500 hover:text-zinc-300 text-sm">
          <Link href="/coach/results">← Back to my estimate</Link>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify upsell page renders with feature list and disabled CTA**

```bash
npm run dev
```

Visit `http://localhost:3000/coach/upsell`. Expected: premium feature list, disabled "Coming soon" button, back link.

- [ ] **Step 4: Commit**

```bash
git add src/app/coach/upsell/ src/components/upsell/
git commit -m "feat: premium upsell screen"
```

---

## Task 12: Final Polish + Vercel Deploy

**Files:**
- Modify: `next.config.ts`
- Create: `.vercelignore`, `vercel.json` (if needed)

- [ ] **Step 1: Ensure Next.js image config allows data URIs**

Edit `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: false,
    remotePatterns: [],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Run full build and fix any TypeScript/lint errors**

```bash
npm run build
```

Expected: clean build, 0 errors. Fix any type errors before proceeding.

- [ ] **Step 3: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/fitness-goal-coach.git
git branch -M main
git push -u origin main
```

- [ ] **Step 4: Deploy to Vercel**

```bash
npx vercel --prod
```

When prompted: link to existing project or create new, set project name, confirm framework detection (Next.js).

- [ ] **Step 5: Set environment variable in Vercel**

```bash
npx vercel env add ANTHROPIC_API_KEY production
```

Paste the API key when prompted.

- [ ] **Step 6: Verify production deployment**

Visit the Vercel deployment URL. Walk through the full flow:
- Landing → Onboarding (fill all fields) → Photos (consent + two uploads) → Questionnaire → (optionally Judo) → Results (wait for AI) → Upsell

Expected: all steps work, results page returns a real Claude-generated estimate.

- [ ] **Step 7: Final commit**

```bash
git add next.config.ts
git commit -m "feat: final alpha — full flow working on Vercel"
```

---

## Self-Review Checklist

### Spec Coverage

| Alpha requirement | Covered by |
|---|---|
| Sign-up / simple onboarding | Task 5 (PersonalInfoForm) |
| Photo upload with consent | Task 6 (ConsentGate + PhotoUpload) |
| Questionnaire | Task 7 (GoalForm + SportSelector) |
| Estimated timeframe range | Task 9 (Claude API) + Task 10 (EstimateCard) |
| High-level training guidance | Task 10 (TrainingGuidance) |
| Judo mode | Task 8 (JudoForm + JudoPage) |
| Basic premium upsell | Task 11 (PremiumCard + UpsellPage) |
| Non-medical wording | All tasks — prompt + Disclaimer |
| Privacy / consent for photos | Task 6 (ConsentGate) |
| Photo deleted after analysis | Route handler never persists photos |
| Vercel deployment | Task 12 |

### Things NOT built (by design — out of alpha scope)

- Full live coaching
- Dynamic nutrition planning
- Complex long-term progress automation
- Advanced computer vision (Claude sees photos but does general assessment, not body-fat measurement)
- Auth / user accounts
- Database / persistence
