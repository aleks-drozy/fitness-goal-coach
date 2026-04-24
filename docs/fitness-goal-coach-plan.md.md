Prompt:
Read `fitness-goal-coach-plan.md` and build the alpha version only.

Start by:
1. Writing a short product spec
2. Writing an MVP implementation plan
3. Defining the alpha user flow

Then begin implementation step by step.

Important:
- Stay strictly within the alpha scope in the note
- Do not add extra features
- Do not implement advanced computer vision in v1
- Keep all health-related wording cautious and non-medical
- Prioritize onboarding, estimate flow, and judo mode first

Use the workflow and tooling recommendations in the note, including Obsidian/Graphify for memory, strong front-end quality, structured task execution, and a Vercel-friendly setup.

Before coding, summarize your understanding of the project and list the first tasks you will do.

Important:
- Stay strictly within the alpha scope in the note
- Do not add extra features
- Do not implement advanced computer vision in v1
- Keep all health-related wording cautious and non-medical
- Prioritize onboarding, estimate flow, and judo mode first

Use the workflow and tooling recommendations in the note, including Obsidian/Graphify for memory, strong front-end quality, structured task execution, and a Vercel-friendly setup.

Before coding, summarize your understanding of the project and list the first tasks you will do.
# Fitness Goal Coach App

## Build Instructions for Claude
Read this note and build the **alpha version only**.

Follow this order:
1. Write a short product spec
2. Write an MVP plan
3. Define the alpha user flow
4. Build step by step
5. Stay within the alpha scope
6. Do not add extra features outside this note

---

## Goal
Build a fitness coaching app that helps users compare their current body and their target physique, then gives a realistic estimate of how long it may take to make similar progress.

The app must not guarantee results, diagnose injuries, or replace a doctor, physiotherapist, registered dietitian, or qualified coach.

All timelines should be estimates based on user data, consistency, training history, recovery, nutrition, and genetics.

---

## Core Concept
The user uploads:
- A photo of their current body
- A photo of their goal physique
- Their age
- Their sex
- Their height
- Their weight
- Their training experience
- Their activity level
- Their goal
- Their workout setting, for example gym or home
- Any injuries, limitations, or pain issues
- Whether they also do sport-specific training

The app then:
- Analyzes the difference between the current body and goal body
- Asks follow-up questions before giving any estimate
- Gives a realistic timeframe range, not a guaranteed exact date
- Explains what is likely required in training, nutrition, sleep, and consistency
- Adapts recommendations based on environment, injuries, and sport demands

---

## Important Safety Rules
- Do not claim to be a doctor, physiotherapist, or registered dietitian
- Do not guarantee that the user can achieve the exact body in the target photo
- Do not make extreme transformation promises
- Use cautious wording around body image and health
- Add a disclaimer that image-based analysis may be imperfect
- Require explicit consent before processing body photos
- Minimize photo storage and prefer deleting images after analysis
- If the user reports pain, disordered eating risk, or serious injury, direct them to a qualified professional

---

## Main Features
- Photo upload for current body and goal body
- User onboarding questionnaire
- Goal analysis summary
- Estimated timeframe range such as 4 to 6 months, 8 to 12 months, and so on
- Explanation of the factors that affect timeline
- Suggested weekly training structure
- Suggested calorie and protein guidance at a high level
- Progress tracker with check-ins and updated timeline estimates

### Premium Coaching Modes
- Personal trainer mode
- Nutrition guidance mode
- Combined coaching mode

---

## Personalization
The app should adapt to:
- Gym vs home workouts
- Equipment available
- Beginner vs intermediate vs advanced users
- Fat loss vs muscle gain vs body recomposition goals
- Injury limitations
- Sport training load

---

## Sport Mode
The alpha version should include a sport-specific mode for **judo**.

In judo mode, the app should:
- Ask how many judo sessions the user does per week
- Ask about intensity of training and competition schedule
- Adjust strength and conditioning around judo fatigue
- Ask what was done in judo training that week
- Reduce overload if judo workload is high
- Include mobility, grip, neck, pulling strength, core, and recovery considerations

---

## Free vs Premium

### Free Tier
- Goal estimate
- Basic training direction
- Basic progress tracking

### Premium Tier
- More detailed training plans
- Nutrition guidance
- Weekly AI check-ins
- Recovery adjustments
- Sport-specific coaching
- Injury-aware modifications
- Ongoing plan changes based on progress

---

## Output Style
The AI should sound like an experienced fitness coach, but it must stay evidence-based, careful, and realistic.

It should be:
- Supportive
- Clear
- Practical
- Non-judgmental

It should not be:
- Harsh
- Overly motivational
- Unrealistic
- Medical-sounding

---

## Product Rules
- Timeframe output must always be a range, not a single exact result
- Show a confidence level, for example low, medium, or high
- Explain why the estimate was given
- Never state that the app can perfectly predict body transformation from photos alone
- Include a clear privacy and consent flow for photos
- Include clear disclaimers for injuries, pain, and nutrition limitations

---

## Alpha Scope
For version 1, build only:
- Sign-up or simple onboarding
- Current body and goal photo upload
- Questionnaire
- Estimated timeframe range
- High-level training guidance
- Judo mode
- Basic premium upsell screen

Do not build:
- Full live coaching
- Medical advice
- Advanced computer vision
- Fully dynamic nutrition planning
- Complex long-term progress automation

---

## Definition of Done
The alpha is complete when:
- A user can onboard successfully
- A user can upload current and goal photos
- A user can complete the questionnaire
- The app returns an estimated timeframe range
- The app explains the reasoning behind the estimate
- The app provides high-level training guidance
- The app includes a judo-specific flow
- The app includes a premium upsell screen
- The UI feels polished, clear, and trustworthy

---

## Recommended Claude Code Workflow and Skills

### Memory and Context
- Use Obsidian as the long-term project memory
- Use Graphify to create a structural knowledge graph of the project
- Store product decisions, feature notes, user flows, constraints, research, and future ideas in the Obsidian vault
- Use Graphify so Claude can understand relationships between features, flows, files, and architecture without rereading everything each session

### Frontend and UI
- Use Emil Kowalski style and design-engineering principles for front-end quality
- Prioritize clean UI, excellent spacing, polished but restrained motion, strong typography, and modern product design
- Avoid generic AI-looking SaaS UI
- The product should feel premium, trustworthy, and health-focused
- Prefer simple, high-clarity UI over flashy animations

### Coding Workflow
- Use Superpowers or a similar structured Claude Code workflow for:
  - Brainstorming
  - Writing a spec
  - Generating a plan
  - Executing tasks step by step
  - Reviewing and refactoring code
- Break work into small, testable tasks
- Prefer maintainable architecture over rushed output
- Keep major implementation decisions documented in the Obsidian project notes

### Deployment
- Use Vercel for deployment
- Prefer a frontend stack that deploys easily on Vercel
- Use preview deployments during development
- Use environment variables correctly for AI, auth, database, and storage integrations

### Other Recommended Tools
- Use Git and GitHub for version control
- Write a clean product spec before building
- Use reusable UI components
- Add analytics and error monitoring later, not in the first alpha
- Use privacy-first image handling because users will upload sensitive body photos

---

## Build Guidance for Claude
When implementing this project:
- First create a short product spec
- Then create an MVP plan
- Then build only the alpha scope
- Do not overbuild advanced AI features in v1
- Keep photo analysis realistic and privacy-aware
- Use cautious health-related wording
- Prioritize onboarding, estimate flow, and judo-specific adaptation first

---

## Suggested Stack
- **Frontend:** Next.js
- **UI:** Tailwind CSS + component system
- **Auth:** Clerk or Supabase Auth
- **Database:** Supabase or PostgreSQL
- **Storage:** Secure cloud storage for images
- **AI:** Claude API for structured guidance and explanation
- **Deployment:** Vercel

---

## First Tasks for Claude
1. Write the product spec
2. Define the alpha user flow
3. Design the onboarding flow
4. Design the estimate results screen
5. Design the judo mode questionnaire
6. Build the MVP frontend
7. Add the premium upsell flow
8. Prepare Vercel deployment