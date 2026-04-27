import { WeightCutClient } from "@/components/weight-cut/WeightCutClient";

export default function WeightCutPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Judo</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Competition weight cut</h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            Generate a safe, performance-preserving weight cut protocol for your next competition. Cuts over 5% bodyweight in under 14 days will be refused.
          </p>
        </div>
        <WeightCutClient />
      </div>
    </div>
  );
}
