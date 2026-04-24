import { WizardState, EstimateResult } from "./types";

export async function fetchEstimate(state: WizardState): Promise<EstimateResult> {
  const res = await fetch("/api/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) throw new Error("Failed to fetch estimate");
  return res.json();
}
