import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xl space-y-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
          Fitness Goal Coach
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
          How long will your goal actually take?
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Upload a photo of your current physique and your goal, answer a few questions,
          and get a realistic, evidence-informed estimate — not a promise.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100 font-medium">
            <Link href="/coach/onboarding">Get my estimate →</Link>
          </Button>
        </div>
        <p className="text-xs text-zinc-600 max-w-sm mx-auto">
          This tool provides general fitness estimates only. It is not medical advice and does not
          replace a doctor, physiotherapist, or qualified coach.
        </p>
      </div>
    </main>
  );
}
