import { createClient } from "@/lib/supabase/server";
import { PlanClient } from "@/components/plan/PlanClient";

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: latestPlan }, { data: profile }] = await Promise.all([
    supabase
      .from("fitness_plans")
      .select("plan")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("wizard_state")
      .eq("id", user!.id)
      .maybeSingle(),
  ]);

  const hasProfile = !!(profile?.wizard_state);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--primary)" }}
          >
            Training plan
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your fitness plan</h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            AI-generated based on your goals, experience, and training context.
          </p>
        </div>

        <PlanClient
          initialPlan={latestPlan?.plan ?? null}
          hasProfile={hasProfile}
        />
      </div>
    </div>
  );
}
