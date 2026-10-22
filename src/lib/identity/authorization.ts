import type { User } from "@supabase/supabase-js";

export type CheckoutAuthorization =
  | { allowed: true; user: User }
  | { allowed: false; reason: "unauthenticated" | "email_unconfirmed" };

export async function requireConfirmedEmailForCheckout(
  auth: { getUser: () => Promise<{ data: { user: User | null } }> },
): Promise<CheckoutAuthorization> {
  const { data } = await auth.getUser();
  if (!data.user) return { allowed: false, reason: "unauthenticated" };
  if (!data.user.email_confirmed_at) return { allowed: false, reason: "email_unconfirmed" };
  return { allowed: true, user: data.user };
}
