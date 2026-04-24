# Fitness Goal Coach — Project Summary

**Status:** Alpha v1 complete — clean build, all routes verified, ready to deploy  
**Last updated:** 2026-04-24  
**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (New York) · @anthropic-ai/sdk · Vercel

---

## What This App Does

A fitness coaching web app where users:
1. Upload a photo of their current physique and a goal physique photo
2. Answer a questionnaire (personal info, goal type, injuries, sport)
3. Optionally complete a judo-specific sub-flow
4. Receive an AI-generated **timeframe estimate** (range in months, never exact)
5. See a **premium upsell screen** (placeholder — coming soon)

The app makes no medical claims. All estimates are clearly labelled as general guidance.

---

## Alpha Scope (Built)

| Feature | Status |
|---|---|
| Landing page | ✅ |
| Onboarding questionnaire (name, age, sex, height, weight, experience, activity) | ✅ |
| Photo upload with consent gate | ✅ |
| Goal questionnaire (goal type, workout setting, injuries, sport selector) | ✅ |
| Judo mode sub-flow (sessions, intensity, competition, weekly log) | ✅ |
| Claude API estimate (range + reasoning + training guidance + nutrition note) | ✅ |
| Results screen with confidence badge and disclaimer | ✅ |
| Premium upsell screen (disabled CTA — waitlist placeholder) | ✅ |

## Out of Alpha Scope (Not Built)

- Auth / user accounts
- Database / persistent progress tracking
- Full live coaching
- Dynamic nutrition planning
- Advanced computer vision (Claude does general visual assessment only)
- Complex long-term progress automation

---

## Route Map

```
/                          Landing page (CTA → /coach/onboarding)
/coach                     Redirect → /coach/onboarding
/coach/onboarding          Step 1: Personal info form
/coach/photos              Step 2: Consent gate + photo upload
/coach/questionnaire       Step 3: Goal type, workout setting, injuries, sport
/coach/judo                Step 3b: Judo sub-flow (only if sport = "judo")
/coach/results             Step 4: AI estimate + guidance (calls /api/estimate)
/coach/upsell              Step 5: Premium feature list + disabled CTA
/api/estimate              POST handler: receives wizard state → calls Claude API → returns EstimateResult JSON
```

---

## Data Flow

```
Browser (WizardContext) → /api/estimate (POST, server-side) → Claude API → EstimateResult JSON → Results page
```

Photos are encoded as base64 in the browser, included in the POST body, passed to Claude, and never persisted anywhere.  
The `ANTHROPIC_API_KEY` lives server-side only — never sent to the browser.

---

## File Structure

```
src/
  app/
    page.tsx                        Landing
    layout.tsx                      Root layout (Inter font, WizardProvider, dark bg)
    globals.css                     Tailwind v4 + shadcn CSS variables
    coach/
      layout.tsx                    Centered max-w-lg wrapper
      page.tsx                      Redirect to /coach/onboarding
      onboarding/page.tsx
      photos/page.tsx
      questionnaire/page.tsx
      judo/page.tsx
      results/page.tsx
      upsell/page.tsx
    api/estimate/route.ts           Claude API POST handler
  components/
    ui/                             shadcn primitives
    wizard/                         ProgressBar, StepHeader, NavButtons
    onboarding/                     PersonalInfoForm
    photos/                         ConsentGate, PhotoUpload
    questionnaire/                  GoalForm, SportSelector
    judo/                           JudoForm
    results/                        EstimateCard, ReasoningBlock, TrainingGuidance, NutritionNote, Disclaimer
    upsell/                         PremiumCard
  context/
    WizardContext.tsx               Global wizard state (no persistence)
  lib/
    types.ts                        All TypeScript interfaces
    prompts.ts                      Claude prompt builder
    estimate.ts                     Client-side fetchEstimate() helper
```
