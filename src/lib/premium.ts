import { createClient } from "@/lib/supabase/server";

/**
 * Returns true if the current authenticated user has premium access.
 * Reads profiles.is_premium — flipped manually by admin now,
 * will be driven by Stripe webhook when billing is integrated.
 */
export async function getUserIsPremium(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .maybeSingle();

  return data?.is_premium === true;
}
