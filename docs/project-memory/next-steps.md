# Fitness Goal Coach — Next Steps

**Last updated:** 2026-04-24  
**Current state:** Alpha v1 deployed (or ready to deploy)

---

## Immediate (Before Sharing Alpha)

- [ ] Push to GitHub and deploy to Vercel (see `session-log-2026-04-24.md` for commands)
- [ ] Set `ANTHROPIC_API_KEY` in Vercel environment variables
- [ ] Test the full flow manually end-to-end (see test checklist below)
- [ ] Verify the results page returns a sensible estimate for a real use case

---

## Beta Priorities (Post-Alpha Feedback)

### Auth + persistence
- Add Clerk or Supabase Auth (email/password or OAuth)
- Store onboarding answers and results in Supabase so users can return
- Allow multiple estimates over time (progress tracking)

### Client-side image resize
- Resize uploaded photos to max 800px before base64 encoding
- Reduces POST payload size and Claude token usage
- Use `canvas` API — no library needed

### Streaming estimate response
- Switch from `client.messages.create` to `client.messages.stream`
- Stream reasoning tokens as they arrive using `ReadableStream` / `EventSource`
- Show estimate sections appearing progressively (better UX)

### Server-side MIME validation
- In `/api/estimate`, validate that uploaded base64 is a valid image MIME type before calling Claude
- Prevent non-image data from being sent to the API

### Rate limiting
- Add Vercel Edge rate limiting on `/api/estimate`
- Limit by IP: e.g. 5 estimates per hour per IP
- Add auth token check once auth is added

### Imperial unit toggle
- Add cm/ft and kg/lbs toggle in the onboarding form
- Convert to metric before building the Claude prompt (prompt stays metric)

---

## Premium Features (Revenue Layer)

### Detailed weekly training plan
- Claude generates a full weekly program (not just bullet points)
- Adapts to gym vs home, experience level, injuries, judo load
- Gated behind premium subscription

### Nutrition guidance with targets
- Claude generates calorie and protein targets based on goal and body stats
- Non-prescriptive, clearly labelled as general guidance
- Gated behind premium subscription

### Weekly AI check-ins
- User logs their week (training done, how they felt, weight change)
- Claude updates the timeline estimate and adjusts recommendations
- Requires Supabase persistence + auth

### Sport modes beyond judo
- BJJ, wrestling, boxing, MMA, rowing, cycling
- Each has its own fatigue and periodisation considerations
- Judo mode serves as the template

### Injury-aware modifications
- User describes injury in detail
- Claude suggests exercise alternatives (with physiotherapist referral for anything serious)
- Clear disclaimer: not physiotherapy advice

---

## Design / UX Improvements

- [ ] Add step number label (e.g. "Step 2 of 5") alongside progress bar
- [ ] Add keyboard navigation between wizard steps (Enter to advance)
- [ ] Mobile: ensure photo upload works on iOS Safari (test FileReader + drag-drop fallback)
- [ ] Add subtle fade-in animations between steps
- [ ] Add a "Start over" button on the results page for users who want to adjust their inputs
- [ ] Consider a summary review screen before submitting (shows all entered data)

---

## Monitoring & Analytics (Post-Launch)

- Vercel Analytics (free tier) for page views and Web Vitals
- Log Claude API errors to Vercel logs (already surfaced via 500 response)
- Track conversion: what % of users reach Results vs drop off at Photos
- Add Sentry for runtime error tracking (optional)
