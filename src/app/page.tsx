import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ paddingTop: "6rem", paddingBottom: "6rem" }}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-5">
          <p
            className="text-[0.6875rem] font-medium tracking-[0.1em] uppercase"
            style={{ color: "var(--primary)" }}
          >
            Fitness Goal Coach
          </p>
          <h1
            className="font-semibold leading-[1.1]"
            style={{
              fontSize: "clamp(2rem, 8vw, 2.75rem)",
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            How long will your goal actually take?
          </h1>
          <p
            className="text-base leading-relaxed mx-auto"
            style={{
              color: "var(--muted-foreground)",
              maxWidth: "30rem",
            }}
          >
            Upload a photo of your current physique and your goal, answer a few questions, and get a
            realistic evidence-informed estimate — not a promise.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/coach/onboarding"
            className={buttonVariants({ size: "lg" })}
            style={{ minWidth: "12rem" }}
          >
            Get my estimate →
          </Link>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--muted-foreground)", opacity: 0.6, maxWidth: "22rem" }}
          >
            General fitness estimates only. Not medical advice.
          </p>
        </div>
      </div>
    </main>
  );
}
