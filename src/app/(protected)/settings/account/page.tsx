"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/config";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      if (user.email) setEmail(user.email);
      supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => setIsPremium(data?.is_premium ?? false));
    });
  }, []);

  function handleExport() {
    window.location.href = "/api/account/export";
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDelete() {
    if (confirmInput !== email) return;
    setDeleting(true);
    setDeleteError(null);

    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      const d = await res.json();
      setDeleteError(d.error ?? "Deletion failed.");
      setDeleting(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const canDelete = confirmInput === email && email.length > 0;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-10">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Settings</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Account</h1>
        </div>

        {/* Plan */}
        <div className="space-y-4 rounded-[var(--r-card)] border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div>
            <h2 className="text-base font-semibold">Plan</h2>
            <p className="mt-1 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
              {isPremium === null
                ? "Loading…"
                : isPremium
                ? "Premium"
                : `Free. Early access to ${APP_NAME}.`}
            </p>
          </div>
          {isPremium === false && (
            <Link href="/upgrade" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Upgrade to Premium
            </Link>
          )}
        </div>

        {/* Sign out */}
        <div className="space-y-4 rounded-[var(--r-card)] border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div>
            <h2 className="text-base font-semibold">Sign out</h2>
            <p className="mt-1 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
              Sign out of your account on this device.
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
        </div>

        {/* Export */}
        <div className="space-y-4 rounded-[var(--r-card)] border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div>
            <h2 className="text-base font-semibold">Export my data</h2>
            <p className="mt-1 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
              Download all your progress entries, fitness plans, and profile data as JSON.
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>Download export.json</Button>
        </div>

        {/* Delete */}
        <div className="space-y-4 rounded-[var(--r-card)] border p-6" style={{ borderColor: "var(--destructive)", background: "oklch(0.62 0.22 27 / 4%)" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--destructive)" }}>Delete account</h2>
            <p className="mt-1 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
              Permanently deletes all your data: progress entries, fitness plans, photos, and your account. This cannot be undone.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">
              Type your email to confirm: <span className="font-mono text-[0.8125rem]">{email}</span>
            </Label>
            <Input
              id="confirm"
              type="email"
              placeholder={email}
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
            />
          </div>

          {deleteError && (
            <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>{deleteError}</p>
          )}

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            style={{ opacity: canDelete ? 1 : 0.4, transition: "opacity var(--dur-medium) var(--ease-out)" }}
          >
            {deleting ? "Deleting…" : "Delete my account permanently"}
          </Button>
        </div>
      </div>
    </div>
  );
}
