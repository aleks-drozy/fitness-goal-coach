"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/config";

const tools = [
  { label: "Calculator", href: "/tools/calculator" },
  { label: "Exercises", href: "/tools/exercises" },
];
const protected_ = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Progress", href: "/progress" },
  { label: "Plan", href: "/plan" },
  { label: "Weight Cut", href: "/weight-cut" },
  { label: "Settings", href: "/settings/account" },
];

const allLinks = [...tools, ...protected_];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoggedIn(false);
    router.push("/");
  }

  if (pathname.startsWith("/coach")) return null;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <span
              className="text-[0.875rem] font-bold tracking-tight"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {tools.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-[var(--r-button)] px-3 py-1.5 text-[0.8125rem] transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
            <div aria-hidden="true" className="mx-1 h-4 w-px" style={{ background: "var(--border)" }} />
            {protected_.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-[var(--r-button)] px-3 py-1.5 text-[0.8125rem] transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
            <div aria-hidden="true" className="mx-1 h-4 w-px" style={{ background: "var(--border)" }} />
            <ThemeToggle />
            {loggedIn && (
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="flex items-center gap-1.5 rounded-[var(--r-button)] px-3 py-1.5 text-[0.8125rem] transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                <LogOut size={13} />
                Sign out
              </button>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex size-8 items-center justify-center rounded-[var(--r-button)] transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer — full-screen overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 pt-12 md:hidden"
          style={{ background: "var(--background)" }}
        >
          <nav className="flex flex-col px-4 py-6 space-y-1">
            {allLinks.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className="rounded-[var(--r-button)] px-3 py-3 text-[0.9375rem] transition-colors"
                  style={{
                    color: active ? "var(--foreground)" : "var(--muted-foreground)",
                    background: active ? "var(--surface)" : "transparent",
                  }}
                >
                  {t.label}
                </Link>
              );
            })}
            {loggedIn && (
              <button
                onClick={() => { setOpen(false); handleSignOut(); }}
                className="flex items-center gap-2 rounded-[var(--r-button)] px-3 py-3 text-[0.9375rem] transition-colors text-left"
                style={{ color: "var(--muted-foreground)" }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
