# Fitness Goal Coach — Bugs & Fixes

**Last updated:** 2026-04-24

---

## Resolved (Alpha Build)

### Node.js not in bash PATH on Windows
**Symptom:** `npx: command not found` in Git Bash  
**Root cause:** Node.js installed on Windows but not available in MSYS2/Git Bash PATH  
**Fix:** Use PowerShell for all npm/npx commands. Reload PATH before each command:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
```
Use `.cmd` shims: `& "C:\Program Files\nodejs\npm.cmd"` and `& "C:\Program Files\nodejs\npx.cmd"`

**Note:** PowerShell execution policy also blocks `.ps1` shims (`npm.ps1`), so `.cmd` shims are required.

---

### Button asChild not supported by @base-ui/react/button
**Symptom:** TypeScript error — `asChild` prop does not exist on Button  
**Root cause:** shadcn New York style with Tailwind v4 generates `@base-ui/react/button` instead of the Radix-based button. `@base-ui/react` does not support the `asChild` pattern.  
**Fix:** Use `buttonVariants` from `@/components/ui/button` applied directly to a `<Link>`:
```typescript
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

<Link href="..." className={cn(buttonVariants({ size: "lg" }), "bg-white text-zinc-950")}>
  text
</Link>
```
**Status:** All components updated to use this pattern. Applied to: `page.tsx` (landing), `results/page.tsx`, `upsell/page.tsx`.

---

### globals.css Tailwind directive mismatch
**Symptom:** Could have broken styles if wrong Tailwind import used  
**Root cause:** Tailwind v4 uses `@import "tailwindcss"` instead of the v3 `@tailwind base/components/utilities` directives  
**Fix:** The scaffolded globals.css already used the correct v4 import. Custom additions (`:root` font variables) were appended below it without overwriting the existing import.  
**Status:** Resolved — no action needed.

---

## Known Limitations (Not Bugs — Alpha Scope)

### State lost on page refresh
WizardContext is in-memory only. Refreshing any step resets the entire wizard.  
**This is expected for alpha.** Future: persist to localStorage or Supabase session.

### No input sanitisation on photo MIME type
`PhotoUpload` accepts `image/*` via the file input attribute, but does not validate the actual MIME type of the uploaded file server-side.  
**Risk level:** Low for alpha (no server storage, photos are passed to Claude which handles invalid images gracefully).  
**Future:** Add MIME type check in the Route Handler before sending to Claude.

### Claude response is not streamed
The results page shows a spinner and waits for the full Claude response before rendering anything.  
**This is expected for alpha.** Claude API streaming could be added later for better UX.

### No rate limiting on /api/estimate
Any client can POST to `/api/estimate` without authentication or rate limiting.  
**Risk level:** Medium once deployed publicly (API costs).  
**Future:** Add Vercel Edge rate limiting or simple API key header check once auth is added.

### Photos sent as full base64 in request body
Large photos (e.g. 5MB JPEG) will create very large POST bodies and may approach Claude's token limit for images.  
**Mitigation for now:** Browser FileReader encodes as-is. No resize step in alpha.  
**Future:** Client-side canvas resize before encoding (target ~800px max dimension).
