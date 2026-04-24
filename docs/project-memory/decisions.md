# Fitness Goal Coach — Design Decisions

**Last updated:** 2026-04-24

---

## Architecture

### Client-side wizard state only (no database in alpha)
All form state lives in `WizardContext` (React context). Nothing is persisted to a database or localStorage.  
**Why:** Keeps alpha scope small. Users complete the flow in one session. No auth needed.  
**Trade-off:** Refreshing the page resets all state. Acceptable for alpha.  
**Future:** Add Supabase + auth when progress tracking is needed.

### Photos processed in-memory, never stored
Base64-encoded photos are sent in the POST body to `/api/estimate`, passed to Claude, then discarded.  
**Why:** Privacy-first. Users upload sensitive body photos. No server storage eliminates a privacy liability.  
**Trade-off:** Large photos increase request payload. Mitigated by JPEG compression at upload.

### Gemini API called server-side via Route Handler
`/api/estimate` is a Next.js Route Handler (runs on the server). The browser never sees the API key.  
**Why:** `GEMINI_API_KEY` must never be exposed to the client. Gemini 1.5 Flash used — free tier, supports image vision.  
**Trade-off:** Each estimate is a cold server call — no streaming in alpha.

### Single WizardContext for all steps
One React context holds all form state across the entire wizard.  
**Why:** Simple. No prop drilling. No state management library needed for the alpha.  
**Trade-off:** All state lost on refresh (acceptable for alpha).

---

## UI / Component Decisions

### buttonVariants on Link instead of Button asChild
The project uses shadcn New York style with Tailwind v4, which generates `@base-ui/react/button` — this does not support the `asChild` pattern.  
**Pattern used throughout:** `<Link href="..." className={cn(buttonVariants({ variant, size }), "extra-classes")}>text</Link>`  
**Why:** Functional equivalent, TypeScript-clean, no workarounds needed.

### Dark zinc-950 theme
`bg-zinc-950 text-zinc-50` as the global body style.  
**Why:** Health/fitness apps benefit from a premium, trustworthy feel. Dark mode with strong contrast signals seriousness.

### No external animation library
Loading spinner is a CSS `animate-spin` class on a `<div>` with a border.  
**Why:** No dependency added, Tailwind ships this out of the box, alpha scope doesn't need complex transitions.

---

## Product Decisions

### Age minimum: 16
**Why:** App provides general fitness guidance. Under-16 users may have different growth, hormonal, and nutritional needs that require professional supervision. Confirmed decision.

### Metric-only inputs (cm, kg)
**Why:** Simplifies the Claude prompt (no conversion needed), reduces complexity in alpha. Imperial toggle deferred to beta.

### All timeframe outputs in months
**Why:** Body composition changes happen over months, not weeks. Simpler display logic. Claude prompt is instructed to return months only. Confirmed decision.

### Sport selector: judo only in alpha
**Why:** The plan specifies judo as the only sport-specific mode for v1. Other sports (BJJ, wrestling, boxing, etc.) deferred to premium/beta.

### Estimate always a range (min–max), never exact
**Why:** Core safety principle. Exact dates create false expectations and could mislead users. The AI is instructed to never return a single number.

### Confidence level shown (low / medium / high)
**Why:** Honest communication. If the user's data is sparse or the goal is hard to predict, the UI should reflect that.

### "Coming soon" upsell CTA (disabled button)
**Why:** Alpha needs to show the premium path without building it. Disabled button with copy "Premium is not yet available" is honest and doesn't create false expectations.

---

## Health & Safety Decisions

### Non-medical wording throughout
The Claude prompt explicitly instructs: cautious wording, no medical claims, no guaranteed results.  
The results screen has a hardcoded disclaimer: "not medical advice, does not replace a doctor, physiotherapist, registered dietitian, or qualified coach."

### Physiotherapist referral in prompt
If the user reports injuries, the Claude prompt instructs Claude to recommend seeing a physiotherapist.  
**Why:** App cannot diagnose or treat injuries. Directing users to qualified professionals is the safe and responsible action.

### Consent gate before photo upload
Users must explicitly tick a checkbox before photo upload areas appear.  
**Why:** Explicit informed consent for processing body photos. Legal and ethical requirement.

### Goal photo disclaimer
The consent gate and photo upload hint both note: "Goal photos may depict different genetics, lighting, or editing."  
**Why:** Prevents users from setting unrealistic expectations based on another person's physique.
