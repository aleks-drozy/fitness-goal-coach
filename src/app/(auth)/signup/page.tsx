"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // After email confirmation, redirect back to /coach/results so the
    // results page can upsert wizard_state into the newly-created profile.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=/coach/results`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      // Immediate session (email confirmation disabled) — go back to results
      // so wizard_state gets upserted before the user navigates anywhere.
      router.refresh()
      router.push("/coach/results")
    } else {
      setShowConfirmation(true)
    }
  }

  if (showConfirmation) {
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
            We sent a confirmation link to{" "}
            <span className="text-foreground">{email}</span>. Click it to
            activate your account.
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
          <h1 className="text-xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Track your fitness goals over time
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

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
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
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-[0.875rem] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary transition-opacity hover:opacity-80"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
