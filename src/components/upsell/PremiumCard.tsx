import { Button } from "@/components/ui/button";

const features = [
  "Detailed weekly training plan tailored to your goal",
  "Nutrition guidance with calorie and protein targets",
  "Weekly AI check-ins with updated timeline",
  "Recovery and sleep recommendations",
  "Injury-aware exercise modifications",
  "Judo S&C integration — strength work around your mat sessions",
  "Plan adjustments as your progress changes",
];

export function PremiumCard() {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 space-y-5">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Premium Coaching</p>
        <p className="text-2xl font-semibold">Everything you need to actually get there</p>
      </div>
      <ul className="space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex gap-3 text-sm text-zinc-300">
            <span className="text-green-400 shrink-0">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        className="w-full bg-white text-zinc-950 hover:bg-zinc-100 font-medium"
        size="lg"
        disabled
      >
        Coming soon — join the waitlist
      </Button>
      <p className="text-xs text-zinc-600 text-center">
        Premium is not yet available. You will be notified when it launches.
      </p>
    </div>
  );
}
