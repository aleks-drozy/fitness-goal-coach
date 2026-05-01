import { createClient } from "@/lib/supabase/server";
import { getUserIsPremium } from "@/lib/premium";
import { WeightCutClient } from "@/components/weight-cut/WeightCutClient";
import { PremiumGate } from "@/components/PremiumGate";
import type { CompetitionContext, OnboardingData, Sport } from "@/lib/types";

export default async function WeightCutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, isPremium] = await Promise.all([
    supabase
      .from("profiles")
      .select("wizard_state")
      .eq("id", user!.id)
      .maybeSingle(),
    getUserIsPremium(),
  ]);

  const ws = profile?.wizard_state as Record<string, unknown> | null;
  const onboarding = (ws?.onboarding ?? {}) as Partial<OnboardingData>;
  const questionnaire = (ws?.questionnaire ?? {}) as Record<string, unknown>;
  const cc = (ws?.competitionContext ?? {}) as Partial<CompetitionContext>;

  const prefill = {
    currentWeight: onboarding.weightKg ?? null,
    weightClass: cc.weightClass ?? null,
    competitionDate: cc.competitionDate ?? null,
    sport: (questionnaire.sport ?? "none") as Sport,
    sex: onboarding.sex ?? null,
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--primary)" }}
          >
            Competition prep
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Competition weight cut
          </h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            Generate a safe, performance-preserving weight cut protocol. Cuts over 5% bodyweight in under 14 days are refused.
          </p>
        </div>

        {!isPremium ? (
          <PremiumGate
            feature="Weight Cut Protocol"
            description="A day-by-day water and nutrition cut plan tailored to your sport, competition date, and weight class — with hard safety limits built in."
          />
        ) : (
          <WeightCutClient prefill={prefill} />
        )}
      </div>
    </div>
  );
}
