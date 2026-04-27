"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  function handleExport() {
    window.location.href = "/api/account/export";
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
