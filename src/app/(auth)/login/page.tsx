"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-sm">
      <div
        className="rounded-[var(--r-card)] border border-border bg-card px-8 py-10"
        style={{ boxShadow: "0 0 0 1px oklch(0.72 0.19 58 / 4%), 0 8px 32px oklch(0 0 0 / 28%)" }}
      >
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Sign in to your account
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[0.8125rem] transition-opacity hover:opacity-80"
                style={{ color: "var(--muted-foreground)" }}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-[0.875rem] text-muted-foreground">
        No account?{" "}
        <Link
          href="/signup"
          className="text-primary transition-opacity hover:opacity-80"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
