"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const tools = [
  { label: "Calculator", href: "/tools/calculator" },
  { label: "Exercises", href: "/tools/exercises" },
];
const protected_ = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Progress", href: "/progress" },
  { label: "Plan", href: "/plan" },
  { label: "Weight Cut", href: "/weight-cut" },
];

export function Nav() {
  const pathname = usePathname();
  // Hide nav inside wizard
  if (pathname.startsWith("/coach")) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 inset-x-0 z-50 border-b"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex size-6 items-center justify-center rounded-full"
            style={{ background: "var(--primary)" }}
          >
            <Zap size={12} fill="var(--primary-foreground)" color="var(--primary-foreground)" />
          </div>
          <span className="text-[0.8125rem] font-semibold">Fitness Coach</span>
        </Link>

        <div className="flex items-center gap-1">
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
        </div>
      </div>
    </nav>
  );
}
