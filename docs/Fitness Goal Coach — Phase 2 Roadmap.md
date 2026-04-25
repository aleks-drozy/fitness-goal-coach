
## Build Instructions for Claude
We have finished and deployed the alpha MVP.

Do not jump straight into building random new features.

First:
1. Review the current app and summarize what already exists
2. Identify the most important product risks after MVP launch
3. Prioritize Phase 2 using a post-MVP approach
4. Recommend the top 3 features to build next based on impact vs effort
5. Create an implementation plan for only the first Phase 2 feature
6. Build in small iterations with checkpoints

Keep the roadmap realistic, startup-style, and focused on learning from users.

---

## Current Product Status
The alpha MVP is already live and includes:
- Landing page
- Onboarding flow
- Photo consent + upload
- Questionnaire
- Optional judo flow
- Results screen with AI-generated estimate
- Premium upsell screen
- Server-side Claude API route
- Vercel deployment
- Project memory notes saved for Obsidian

---

## Post-MVP Goal
The next stage is not broad expansion.

The goal of Phase 2 is to:
- Learn how real users behave
- Identify where users drop off
- Improve activation and retention
- Make the app more trustworthy and useful
- Build only the features most likely to improve user value and product traction

---

## Phase 2 Priorities

### Priority 1 — Analytics and Feedback
Add proper analytics and feedback capture before making major roadmap decisions.

We need to know:
- How many users start onboarding
- How many complete onboarding
- How many upload photos
- How many finish the questionnaire
- How many reach results
- How many click the premium upsell
- Where users drop off
- What users say is confusing or missing

Recommended additions:
- Funnel analytics
- Event tracking
- Basic feedback form after results
- Lightweight bug/report issue flow

### Priority 2 — UX Polish and Trust Improvements
Improve the current core experience before expanding features.

Focus areas:
- Reduce friction in onboarding
- Improve wording around estimates and confidence
- Make the result page easier to understand
- Improve loading states and feedback while the estimate is generating
- Improve trust signals, safety language, and privacy messaging

### Priority 3 — User Accounts and Saved Progress
Allow users to return and see previous estimates or progress over time.

Potential Phase 2 features:
- Authentication
- Saved estimate history
- Basic profile persistence
- Return-and-resume flow
- Past questionnaire/photo session summary

### Priority 4 — Premium Foundations
Build the real foundation for monetization, not just the upsell screen.

Potential additions:
- Locked premium result sections
- Subscription/paywall placeholder architecture
- Premium coaching dashboard shell
- “Detailed plan” page structure
- Follow-up check-in framework

---

## Features to Avoid for Now
Do not prioritize these yet unless real users clearly demand them:
- Advanced computer vision
- Full nutrition planning engine
- Large sport expansion beyond judo
- Social/community features
- Wearable integrations
- Complex habit/streak systems
- Fully automated long-term coaching

These may be valuable later, but not before we understand user behavior and retention.

---

## Success Metrics for Phase 2
Track:
- Onboarding completion rate
- Photo upload completion rate
- Questionnaire completion rate
- Result page completion rate
- Premium upsell click rate
- Day 1 / Day 7 / Day 30 retention
- User-reported confusion points
- Top requested improvements

---

## Suggested Phase 2 Build Order

### Phase 2.1 — Instrumentation
Build:
- Event tracking
- Funnel tracking
- Feedback collection
- Session summary capture

### Phase 2.2 — Core UX Polish
Improve:
- Form flow
- Validation clarity
- Upload friction
- Results interpretation
- Trust and privacy messaging

### Phase 2.3 — Accounts and Persistence
Build:
- Auth
- Saved results
- User history
- Resume flow

### Phase 2.4 — Premium Foundations
Build:
- Locked premium sections
- Premium feature shell
- Check-in architecture

---

## Decision Framework
When choosing what to build next, prioritize:
1. Biggest user pain
2. Highest drop-off point
3. Highest retention impact
4. Lowest implementation complexity
5. Strongest monetization potential after trust is improved

Do not prioritize features based only on novelty.

---

## Implementation Rules
- Build in small steps
- Validate each feature before moving on
- Keep health wording cautious and non-medical
- Keep all secrets server-side
- Keep the app privacy-aware
- Document all Phase 2 decisions in project memory
- Update Obsidian notes after each significant session

---

## First Task for Claude
Start by doing a Phase 2 planning pass.

Your first output should include:
1. A summary of the current app
2. The top product risks after MVP launch
3. A ranked list of the top 3 features to build next
4. A recommendation for which Phase 2 feature we should implement first
5. A step-by-step implementation plan for that first feature only