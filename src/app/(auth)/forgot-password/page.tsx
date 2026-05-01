"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/settings/account`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <div
          className="rounded-[var(--r-card)] border border-border bg-card px-8 py-12"
          style={{ boxShadow: "0 0 0 1px oklch(0.72 0.19 58 / 4%), 0 8px 32px oklch(0 0 0 / 28%)" }}
        >
          <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--success)" }}>Reset link sent</p>
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="mt-2 text-[0.875rem] text-muted-foreground">
            We sent a reset link to{" "}
            <span className="text-foreground">{email}</span>. It expires in 1 hour.
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
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight">Reset password</h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Enter your email and we&apos;ll send a reset link
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
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-[0.875rem] text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-primary transition-opacity hover:opacity-80">
          Sign in
        </Link>
      </p>
    </div>
  )
}
