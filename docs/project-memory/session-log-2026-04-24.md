# Session Log — 2026-04-24

**Session goal:** Build the Fitness Goal Coach alpha from the plan in `docs/fitness-goal-coach-plan.md.md`  
**Outcome:** Alpha v1 complete — clean build, all routes verified, ready to deploy

---

## What Was Built This Session

Full alpha implementation across 12 tasks using subagent-driven development:

| Task | Description | Commit |
|---|---|---|
| 1 | Next.js 16 + Tailwind v4 + shadcn + Anthropic SDK bootstrap | `feat: bootstrap Next.js + Tailwind + shadcn + Anthropic SDK` |
| 2 | TypeScript types (`types.ts`) + WizardContext | `feat: add shared types and WizardContext` |
| 3 | Root layout (Inter, WizardProvider, dark theme) + landing page | `feat: landing page with dark theme and CTA` |
| 4 | Wizard shell: ProgressBar, StepHeader, NavButtons, coach layout | `feat: wizard shell layout, ProgressBar, StepHeader, NavButtons` |
| 5 | Onboarding step: PersonalInfoForm | `feat: onboarding step with personal info form` |
| 6 | Photo step: ConsentGate + PhotoUpload (drag-drop, base64) | `feat: photo upload step with consent gate` |
| 7 | Questionnaire step: GoalForm + SportSelector (none/judo) | `feat: questionnaire step with goal form and sport selector` |
| 8 | Judo mode step: JudoForm (sessions, intensity, competition, weekly log) | `feat: judo mode step` |
| 9 | Claude API route handler + prompt builder | `feat: Claude API route handler and prompt builder` |
| 10 | Results screen: EstimateCard, ReasoningBlock, TrainingGuidance, NutritionNote, Disclaimer | `feat: results screen with estimate card, reasoning, training guidance` |
| 11 | Premium upsell screen: PremiumCard (disabled CTA) + upsell page | `feat: premium upsell screen` |
| 12 | Final polish: next.config.ts image config, verified all routes, final build | `feat: final alpha — full flow verified, clean build` |

---

## Key Decisions Made This Session

- Age minimum confirmed: **16**
- Units confirmed: **metric only (cm, kg)** for alpha
- Timeframe unit confirmed: **months only**
- Button pattern confirmed: **`buttonVariants` on `<Link>`** (not `Button asChild` — incompatible with @base-ui/react)
- Photo storage confirmed: **none — processed in memory only**
- Health wording confirmed: **cautious, non-medical throughout**

---

## Technical Discovery

**shadcn + Tailwind v4 = @base-ui/react/button**  
The `npx shadcn@latest init` with Tailwind v4 generates buttons using `@base-ui/react/button` instead of Radix. This component does not support the `asChild` prop used in older shadcn docs. All link-buttons were implemented as `<Link className={cn(buttonVariants(...), "...")}>`.

---

## Deploy Steps (Run After This Session)

### 1. Create GitHub repo and push

```bash
# On GitHub: create a new empty repo called "fitness-goal-coach"
# Then in the project directory (Git Bash or PowerShell):

git remote add origin https://github.com/YOUR_USERNAME/fitness-goal-coach.git
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `fitness-goal-coach`
4. Framework preset: **Next.js** (auto-detected)
5. Root directory: leave as default (`.`)
6. Click "Deploy" — first deploy will fail because the API key isn't set yet

### 3. Add environment variable

In Vercel dashboard → Project → Settings → Environment Variables:

| Name | Value | Environments |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (your real key) | Production, Preview |

### 4. Redeploy

After adding the env var, go to Deployments → click the latest deployment → "Redeploy".

**Yes, you must redeploy after adding environment variables.** Vercel injects env vars at build/runtime, but a new deployment is needed to pick them up.

### 5. Verify

Visit the production URL. Walk through:
- `/` → Landing (click "Get my estimate")
- `/coach/onboarding` → Fill all fields → Continue
- `/coach/photos` → Tick consent → Upload both photos → Continue
- `/coach/questionnaire` → Select goal + setting + sport → Continue
- (If judo selected) `/coach/judo` → Fill judo details → Get my estimate
- `/coach/results` → Wait for spinner → Read estimate → Click premium CTA
- `/coach/upsell` → Verify feature list + disabled button

---

## Manual Test Checklist (Before Sharing)

- [ ] Landing page loads with correct headline and CTA
- [ ] "Get my estimate" button navigates to onboarding
- [ ] Onboarding: Continue button stays disabled until all 7 fields are filled
- [ ] Photos: Upload areas hidden until consent checkbox is ticked
- [ ] Photos: Continue disabled until both photos are uploaded
- [ ] Questionnaire: Selecting "Judo" routes to /coach/judo; "No sport" routes to /coach/results
- [ ] Judo: "Get my estimate" disabled until sessions + intensity filled
- [ ] Results: Spinner shows, then estimate appears with a range (not a single number)
- [ ] Results: Confidence badge shows correct colour (low=grey, medium=yellow, high=green)
- [ ] Results: Disclaimer visible at the bottom
- [ ] Results: "See what's included in Premium" navigates to upsell
- [ ] Upsell: Feature list shows all 7 items including Judo S&C
- [ ] Upsell: CTA button is disabled with "Coming soon" text
- [ ] Upsell: "Back to my estimate" returns to results
- [ ] Back button on each step works correctly
- [ ] Refreshing any page during the flow resets state (expected for alpha)
