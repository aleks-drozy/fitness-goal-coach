import exercises from "@/data/exercises.json";

export const GRAPPLING_SPORTS = new Set(["judo", "bjj", "wrestling", "mma"]);

type Exercise = {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: string;
  sets?: number;
  reps?: string;
  duration?: string;
};

export function buildExercisePool(isGrappling: boolean, workoutSetting: string): string {
  const typed = exercises as Exercise[];

  const strength = typed
    .filter((e) => e.category === "Strength")
    .filter((e) => {
      if (workoutSetting === "home") {
        return e.equipment === "Bodyweight" || e.equipment === "Dumbbell";
      }
      return true;
    })
    .map((e) => `${e.name} (${e.sets ? `${e.sets}×` : ""}${e.reps ?? e.duration ?? ""}, ${e.equipment})`);

  const cardio = typed
    .filter((e) => e.category === "Cardio")
    .map((e) => `${e.name} (${e.sets ? `${e.sets}×` : ""}${e.duration ?? e.reps ?? ""}, ${e.equipment})`);

  const mobility = typed
    .filter((e) => e.category === "Mobility")
    .map((e) => `${e.name} (${e.duration ?? ""})`);

  const recovery = typed
    .filter((e) => e.category === "Recovery")
    .map((e) => `${e.name} (${e.duration ?? ""})`);

  let pool = `
EXERCISE LIBRARY — use these exact names in the plan so users can look them up:

Strength: ${strength.join(" | ")}

Cardio: ${cardio.join(" | ")}

Mobility: ${mobility.join(" | ")}

Recovery: ${recovery.join(" | ")}`;

  if (isGrappling) {
    const grappling = typed
      .filter((e) => e.category === "Judo Conditioning")
      .map((e) => `${e.name} (${e.sets ? `${e.sets}×` : ""}${e.reps ?? e.duration ?? ""}, ${e.equipment})`);
    pool += `\n\nGrappling Conditioning: ${grappling.join(" | ")}`;
  }

  return pool;
}
