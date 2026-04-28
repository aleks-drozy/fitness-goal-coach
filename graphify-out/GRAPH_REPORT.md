# 📊 Graph Analysis Report

**Root:** `.`

## Summary

| Metric | Value |
|--------|-------|
| Nodes | 461 |
| Edges | 383 |
| Communities | 81 |
| Hyperedges | 0 |

### Confidence Breakdown

| Level | Count | Percentage |
|-------|-------|------------|
| EXTRACTED | 380 | 99.2% |
| INFERRED | 3 | 0.8% |
| AMBIGUOUS | 0 | 0.0% |

## 🌟 God Nodes (Most Connected)

| Node | Degree | Community |
|------|--------|-----------|
| page | 21 | 0 |
| page | 15 | 1 |
| select | 15 | 2 |
| JudoForm | 12 | 3 |
| PersonalInfoForm | 12 | 4 |
| GoalForm | 11 | 5 |
| WizardContext | 11 | 6 |
| page | 9 | 7 |
| page | 9 | 8 |
| page | 9 | 9 |

## 🔮 Surprising Connections

- **src_components_photos_photoupload_tsx_handlechange** → **src_components_photos_photoupload_tsx_handlefile** (calls)
- **src_components_photos_photoupload_tsx_handledrop** → **src_components_photos_photoupload_tsx_handlefile** (calls)
- **src_components_ui_card_tsx_cardaction** → **src_components_ui_card_tsx_cn** (calls)

## 🏘️ Communities

### Community 0 — react/useState (22 nodes, cohesion: 0.09)

- page
- @/components/results/Disclaimer/Disclaimer
- @/components/results/EstimateCard/EstimateCard
- @/components/results/NutritionNote/NutritionNote
- @/components/results/ReasoningBlock/ReasoningBlock
- @/components/results/ShareCard/ShareCard
- @/components/results/TrainingGuidance/TrainingGuidance
- @/components/ui/button/Button
- @/components/ui/button/buttonVariants
- @/components/wizard/ProgressBar/ProgressBar
- @/components/wizard/StepHeader/StepHeader
- @/context/WizardContext/useWizard
- framer-motion/AnimatePresence
- framer-motion/motion
- framer-motion/useReducedMotion
- @/lib/estimate/fetchEstimate
- @/lib/supabase/client/createClient
- @/lib/types/EstimateResult
- @/lib/utils/cn
- next/link/Link
- _…and 2 more_

### Community 1 — calculate() (16 nodes, cohesion: 0.13)

- page
- calculate()
- @/components/ui/button/Button
- @/components/ui/button/buttonVariants
- @/components/ui/input/Input
- @/components/ui/label/Label
- framer-motion/AnimatePresence
- framer-motion/motion
- framer-motion/useReducedMotion
- @/lib/calculators/activityOptions
- @/lib/calculators/bmi
- @/lib/calculators/bodyFat
- @/lib/calculators/idealWeight
- @/lib/calculators/tdee
- next/link/Link
- react/useState

### Community 2 — SelectValue() (16 nodes, cohesion: 0.13)

- select
- @base-ui/react/select/Select
- @/lib/utils/cn
- lucide-react/CheckIcon
- lucide-react/ChevronDownIcon
- lucide-react/ChevronUpIcon
- react
- SelectContent()
- SelectGroup()
- SelectItem()
- SelectLabel()
- SelectScrollDownButton()
- SelectScrollUpButton()
- SelectSeparator()
- SelectTrigger()
- SelectValue()

### Community 3 — JudoForm() (13 nodes, cohesion: 0.15)

- JudoForm
- @/components/ui/checkbox/Checkbox
- @/components/ui/input/Input
- @/components/ui/label/Label
- @/components/ui/select/Select
- @/components/ui/select/SelectContent
- @/components/ui/select/SelectItem
- @/components/ui/select/SelectTrigger
- @/components/ui/select/SelectValue
- @/components/ui/textarea/Textarea
- @/context/WizardContext/useWizard
- @/lib/types/JudoIntensity
- JudoForm()

### Community 4 — PersonalInfoForm() (13 nodes, cohesion: 0.15)

- PersonalInfoForm
- @/components/ui/input/Input
- @/components/ui/label/Label
- @/components/ui/select/Select
- @/components/ui/select/SelectContent
- @/components/ui/select/SelectItem
- @/components/ui/select/SelectTrigger
- @/components/ui/select/SelectValue
- @/context/WizardContext/useWizard
- @/lib/types/ActivityLevel
- @/lib/types/ExperienceLevel
- @/lib/types/Sex
- PersonalInfoForm()

### Community 5 — GoalForm() (12 nodes, cohesion: 0.17)

- GoalForm
- GoalForm()
- @/components/ui/label/Label
- @/components/ui/select/Select
- @/components/ui/select/SelectContent
- @/components/ui/select/SelectItem
- @/components/ui/select/SelectTrigger
- @/components/ui/select/SelectValue
- @/components/ui/textarea/Textarea
- @/context/WizardContext/useWizard
- @/lib/types/GoalType
- @/lib/types/WorkoutSetting

### Community 6 — WizardProvider() (12 nodes, cohesion: 0.17)

- WizardContext
- @/lib/types/JudoData
- @/lib/types/OnboardingData
- @/lib/types/PhotoData
- @/lib/types/QuestionnaireData
- @/lib/types/WizardState
- react/createContext
- react/ReactNode
- react/useContext
- react/useState
- useWizard()
- WizardProvider()

### Community 7 — handleExport() (10 nodes, cohesion: 0.20)

- page
- handleDelete()
- handleExport()
- @/components/ui/button/Button
- @/components/ui/input/Input
- @/components/ui/label/Label
- @/lib/supabase/client/createClient
- next/navigation/useRouter
- react/useEffect
- react/useState

### Community 8 — handleSubmit() (8) (10 nodes, cohesion: 0.20)

- page
- handleSubmit()
- @/components/ui/button/Button
- @/components/ui/input/Input
- @/components/ui/label/Label
- @/lib/supabase/client/createClient
- lucide-react/Zap
- next/link/Link
- next/navigation/useRouter
- react/useState

### Community 9 — handleSubmit() (10 nodes, cohesion: 0.20)

- page
- handleSubmit()
- @/components/ui/button/Button
- @/components/ui/input/Input
- @/components/ui/label/Label
- @/lib/supabase/client/createClient
- lucide-react/Zap
- next/link/Link
- next/navigation/useRouter
- react/useState

### Community 10 — ThemeToggle() (9 nodes, cohesion: 0.22)

- ThemeToggle
- framer-motion/AnimatePresence
- framer-motion/motion
- lucide-react/Moon
- lucide-react/Sun
- next-themes/useTheme
- react/useEffect
- react/useState
- ThemeToggle()

### Community 11 — QuestionnairePage() (9 nodes, cohesion: 0.22)

- page
- @/components/questionnaire/GoalForm/GoalForm
- @/components/questionnaire/SportSelector/SportSelector
- @/components/wizard/NavButtons/NavButtons
- @/components/wizard/ProgressBar/ProgressBar
- @/components/wizard/StepHeader/StepHeader
- @/context/WizardContext/useWizard
- next/navigation/useRouter
- QuestionnairePage()

### Community 12 — POST() (12) (8 nodes, cohesion: 0.25)

- route
- groq-sdk/Groq
- @/lib/prompts/buildEstimatePrompt
- @/lib/types/EstimateResult
- @/lib/types/WizardState
- next/server/NextRequest
- next/server/NextResponse
- POST()

### Community 13 — handleFile() (8 nodes, cohesion: 0.25)

- PhotoComparison
- handleAnalyze()
- handleFile()
- @/components/ui/button/Button
- @/components/ui/label/Label
- @/lib/supabase/client/createClient
- next/navigation/useRouter
- react/useState

### Community 14 — handleSubmit() (14) (8 nodes, cohesion: 0.25)

- WeightCutClient
- handleSubmit()
- @/components/ui/button/Button
- @/components/ui/input/Input
- @/components/ui/label/Label
- framer-motion/motion
- framer-motion/useReducedMotion
- react/useState

### Community 15 — next/link/Link (15) (8 nodes, cohesion: 0.25)

- page
- @/components/dashboard/FeedbackCallout/FeedbackCallout
- @/components/dashboard/ProgressChart/ProgressChart
- @/components/dashboard/SummaryCard/SummaryCard
- @/components/ui/button/buttonVariants
- @/lib/supabase/server/createClient
- @/lib/utils/cn
- next/link/Link

### Community 16 — handleSubmit() (16) (8 nodes, cohesion: 0.25)

- ProgressForm
- handleSubmit()
- @/components/ui/button/Button
- @/components/ui/input/Input
- @/components/ui/label/Label
- @/components/ui/textarea/Textarea
- next/navigation/useRouter
- react/useState

### Community 17 — PhotosPage() (8 nodes, cohesion: 0.25)

- page
- @/components/photos/ConsentGate/ConsentGate
- @/components/photos/PhotoUpload/PhotoUpload
- @/components/wizard/NavButtons/NavButtons
- @/components/wizard/ProgressBar/ProgressBar
- @/components/wizard/StepHeader/StepHeader
- @/context/WizardContext/useWizard
- PhotosPage()

### Community 18 — recharts/YAxis (8 nodes, cohesion: 0.25)

- ProgressChart
- recharts/CartesianGrid
- recharts/Line
- recharts/LineChart
- recharts/ResponsiveContainer
- recharts/Tooltip
- recharts/XAxis
- recharts/YAxis

### Community 19 — RootLayout() (8 nodes, cohesion: 0.25)

- layout
- @/components/layout/Nav/Nav
- @/context/WizardContext/WizardProvider
- ./globals.css
- next/font/google/Inter
- next/Metadata
- next-themes/ThemeProvider
- RootLayout()

### Community 20 — Badge() (7 nodes, cohesion: 0.29)

- badge
- Badge()
- @base-ui/react/merge-props/mergeProps
- @base-ui/react/use-render/useRender
- class-variance-authority/cva
- class-variance-authority/VariantProps
- @/lib/utils/cn

### Community 21 — JudoPage() (7 nodes, cohesion: 0.29)

- page
- @/components/judo/JudoForm/JudoForm
- @/components/wizard/NavButtons/NavButtons
- @/components/wizard/ProgressBar/ProgressBar
- @/components/wizard/StepHeader/StepHeader
- @/context/WizardContext/useWizard
- JudoPage()

### Community 22 — handleDownload() (7 nodes, cohesion: 0.29)

- ShareCard
- handleDownload()
- @/components/ui/button/Button
- @/lib/types/EstimateResult
- @/lib/types/WizardState
- react/useRef
- react/useState

### Community 23 — handleFile() (23) (7 nodes, cohesion: 0.38)

- PhotoUpload
- handleChange()
- handleDrop()
- handleFile()
- next/image/Image
- react/useRef
- react/useState

### Community 24 — UpsellPage() (7 nodes, cohesion: 0.29)

- page
- @/components/ui/button/buttonVariants
- @/components/upsell/PremiumCard/PremiumCard
- @/components/wizard/StepHeader/StepHeader
- @/lib/utils/cn
- next/link/Link
- UpsellPage()

### Community 25 — OnboardingPage() (7 nodes, cohesion: 0.29)

- page
- @/components/onboarding/PersonalInfoForm/PersonalInfoForm
- @/components/wizard/NavButtons/NavButtons
- @/components/wizard/ProgressBar/ProgressBar
- @/components/wizard/StepHeader/StepHeader
- @/context/WizardContext/useWizard
- OnboardingPage()

### Community 26 — POST() (26) (7 nodes, cohesion: 0.29)

- route
- groq-sdk/Groq
- @/lib/supabase/server/createClient
- @/lib/supabase/service/createServiceClient
- next/server/NextRequest
- next/server/NextResponse
- POST()

### Community 27 — RadioGroupItem() (6 nodes, cohesion: 0.33)

- radio-group
- @base-ui/react/radio-group/RadioGroup
- @base-ui/react/radio/Radio
- @/lib/utils/cn
- RadioGroup()
- RadioGroupItem()

### Community 28 — GET() (28) (6 nodes, cohesion: 0.33)

- route
- GET()
- @/lib/supabase/service/createServiceClient
- next/server/NextRequest
- next/server/NextResponse
- resend/Resend

### Community 29 — cn() (29) (6 nodes, cohesion: 0.33)

- button
- cn()
- @base-ui/react/button/Button
- class-variance-authority/cva
- class-variance-authority/VariantProps
- @/lib/utils/cn

### Community 30 — diffColor() (6 nodes, cohesion: 0.33)

- page
- diffColor()
- @/components/ui/input/Input
- @/data/exercises.json/exercises
- react/useMemo
- react/useState

### Community 31 — POST() (31) (6 nodes, cohesion: 0.33)

- route
- groq-sdk/Groq
- @/lib/supabase/server/createClient
- next/server/NextRequest
- next/server/NextResponse
- POST()

### Community 32 — next/navigation/usePathname (6 nodes, cohesion: 0.33)

- Nav
- @/components/layout/ThemeToggle/ThemeToggle
- @/lib/utils/cn
- lucide-react/Zap
- next/link/Link
- next/navigation/usePathname

### Community 33 — POST() (33) (6 nodes, cohesion: 0.33)

- route
- groq-sdk/Groq
- @/lib/supabase/server/createClient
- next/server/NextRequest
- next/server/NextResponse
- POST()

### Community 34 — POST() (6 nodes, cohesion: 0.33)

- route
- groq-sdk/Groq
- @/lib/supabase/server/createClient
- next/server/NextRequest
- next/server/NextResponse
- POST()

### Community 35 — PhotosPage() (35) (5 nodes, cohesion: 0.40)

- page
- @/components/progress/PhotoComparison/PhotoComparison
- @/lib/supabase/server/createClient
- next/navigation/redirect
- PhotosPage()

### Community 36 — POST() (36) (5 nodes, cohesion: 0.40)

- route
- @/lib/supabase/server/createClient
- @/lib/supabase/service/createServiceClient
- next/server/NextResponse
- POST()

### Community 37 — Checkbox() (5 nodes, cohesion: 0.40)

- checkbox
- Checkbox()
- @base-ui/react/checkbox/Checkbox
- @/lib/utils/cn
- lucide-react/CheckIcon

### Community 38 — @/lib/types/EstimateResult (5 nodes, cohesion: 0.40)

- EstimateCard
- class-variance-authority/VariantProps
- @/components/ui/badge/Badge
- @/components/ui/badge/badgeVariants
- @/lib/types/EstimateResult

### Community 39 — generatePlan() (5 nodes, cohesion: 0.40)

- PlanClient
- generatePlan()
- @/components/plan/PlanDisplay/PlanDisplay
- @/components/ui/button/Button
- react/useState

### Community 40 — Input() (5 nodes, cohesion: 0.40)

- input
- @base-ui/react/input/Input
- @/lib/utils/cn
- react
- Input()

### Community 41 — tdee() (5 nodes, cohesion: 0.40)

- calculators
- bmi()
- bodyFat()
- idealWeight()
- tdee()

### Community 42 — next/link/Link (42) (5 nodes, cohesion: 0.40)

- page
- @/components/progress/EntryTimeline/EntryTimeline
- @/components/progress/ProgressForm/ProgressForm
- @/lib/supabase/server/createClient
- next/link/Link

### Community 43 — cn() (43) (5 nodes, cohesion: 0.50)

- card
- CardAction()
- cn()
- @/lib/utils/cn
- react

### Community 44 — proxy() (5 nodes, cohesion: 0.40)

- proxy
- next/server/NextRequest
- next/server/NextResponse
- @supabase/ssr/createServerClient
- proxy()

### Community 45 — cn() (5 nodes, cohesion: 0.40)

- utils
- cn()
- clsx/ClassValue
- clsx/clsx
- tailwind-merge/twMerge

### Community 46 — ProgressTrack() (5 nodes, cohesion: 0.40)

- progress
- @base-ui/react/progress/Progress
- @/lib/utils/cn
- Progress()
- ProgressTrack()

### Community 47 — cn() (47) (4 nodes, cohesion: 0.50)

- textarea
- cn()
- @/lib/utils/cn
- react

### Community 48 — cn() (48) (4 nodes, cohesion: 0.50)

- label
- cn()
- @/lib/utils/cn
- react

### Community 49 — GET() (49) (4 nodes, cohesion: 0.50)

- route
- GET()
- @/lib/supabase/server/createClient
- next/server/NextResponse

### Community 50 — handleNext() (4 nodes, cohesion: 0.50)

- NavButtons
- handleNext()
- @/components/ui/button/Button
- next/navigation/useRouter

### Community 51 — fetchEstimate() (4 nodes, cohesion: 0.50)

- estimate
- fetchEstimate()
- ./types/EstimateResult
- ./types/WizardState

### Community 52 — GET() (4 nodes, cohesion: 0.50)

- route
- GET()
- @/lib/supabase/server/createClient
- next/server/NextResponse

### Community 53 — createClient() (53) (4 nodes, cohesion: 0.50)

- server
- createClient()
- next/headers/cookies
- @supabase/ssr/createServerClient

### Community 54 — cn() (54) (4 nodes, cohesion: 0.50)

- separator
- cn()
- @base-ui/react/separator/Separator
- @/lib/utils/cn

### Community 55 — ProtectedLayout() (4 nodes, cohesion: 0.50)

- layout
- @/lib/supabase/server/createClient
- next/navigation/redirect
- ProtectedLayout()

### Community 56 — @/context/WizardContext/useWizard (4 nodes, cohesion: 0.50)

- ConsentGate
- @/components/ui/checkbox/Checkbox
- @/components/ui/label/Label
- @/context/WizardContext/useWizard

### Community 57 — headers() (3 nodes, cohesion: 0.67)

- next.config
- headers()
- next/NextConfig

### Community 58 — @/lib/supabase/server/createClient (3 nodes, cohesion: 0.67)

- page
- @/components/plan/PlanClient/PlanClient
- @/lib/supabase/server/createClient

### Community 59 — @/context/WizardContext/useWizard (59) (3 nodes, cohesion: 0.67)

- SportSelector
- @/components/ui/label/Label
- @/context/WizardContext/useWizard

### Community 60 — createClient() (3 nodes, cohesion: 0.67)

- client
- createClient()
- @supabase/ssr/createBrowserClient

### Community 61 — buildEstimatePrompt() (3 nodes, cohesion: 0.67)

- prompts
- buildEstimatePrompt()
- ./types/WizardState

### Community 62 — WeightCutPage() (3 nodes, cohesion: 0.67)

- page
- @/components/weight-cut/WeightCutClient/WeightCutClient
- WeightCutPage()

### Community 63 — next/link/Link (3 nodes, cohesion: 0.67)

- page
- @/components/ui/button/buttonVariants
- next/link/Link

### Community 64 — createServiceClient() (3 nodes, cohesion: 0.67)

- service
- createServiceClient()
- @supabase/supabase-js/createClient

### Community 65 — CoachPage() (3 nodes, cohesion: 0.67)

- page
- CoachPage()
- next/navigation/redirect

### Community 66 — SectionLabel() (2 nodes, cohesion: 1.00)

- PlanDisplay
- SectionLabel()

### Community 67 — ./.next/types/routes.d.ts (2 nodes, cohesion: 1.00)

- next-env.d
- ./.next/types/routes.d.ts

### Community 68 — CoachLayout() (2 nodes, cohesion: 1.00)

- layout
- CoachLayout()

### Community 69 — AuthLayout() (2 nodes, cohesion: 1.00)

- layout
- AuthLayout()

### Community 70 — @/components/ui/button/Button (2 nodes, cohesion: 1.00)

- PremiumCard
- @/components/ui/button/Button

### Community 71 — Disclaimer() (2 nodes, cohesion: 1.00)

- Disclaimer
- Disclaimer()

### Community 72 — types (1 nodes, cohesion: 1.00)

- types

### Community 73 — NutritionNote (1 nodes, cohesion: 1.00)

- NutritionNote

### Community 74 — SummaryCard (1 nodes, cohesion: 1.00)

- SummaryCard

### Community 75 — FeedbackCallout (1 nodes, cohesion: 1.00)

- FeedbackCallout

### Community 76 — EntryTimeline (1 nodes, cohesion: 1.00)

- EntryTimeline

### Community 77 — StepHeader (1 nodes, cohesion: 1.00)

- StepHeader

### Community 78 — ReasoningBlock (1 nodes, cohesion: 1.00)

- ReasoningBlock

### Community 79 — ProgressBar (1 nodes, cohesion: 1.00)

- ProgressBar

### Community 80 — TrainingGuidance (1 nodes, cohesion: 1.00)

- TrainingGuidance

## 🕳️ Knowledge Gaps

**Isolated nodes** (9):
- FeedbackCallout
- SummaryCard
- EntryTimeline
- NutritionNote
- ReasoningBlock
- TrainingGuidance
- ProgressBar
- StepHeader
- types

**Thin communities** (< 3 nodes): 15 communities

## 💰 Token Cost

| File | Tokens |
|------|--------|
| output | 0 |
| input | 0 |
| **Total** | **0** |

## ❓ Suggested Questions

1. What role does 'SummaryCard' play? It has no connections in the graph.
1. What role does 'FeedbackCallout' play? It has no connections in the graph.
1. What role does 'EntryTimeline' play? It has no connections in the graph.
1. What role does 'NutritionNote' play? It has no connections in the graph.
1. What role does 'ProgressBar' play? It has no connections in the graph.
1. What role does 'StepHeader' play? It has no connections in the graph.
1. What role does 'ReasoningBlock' play? It has no connections in the graph.

---
_Generated by graphify-rs_
