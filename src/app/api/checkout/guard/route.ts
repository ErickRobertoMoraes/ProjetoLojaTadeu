import { NextResponse } from "next/server";
import { requireConfirmedEmailForCheckout } from "@/lib/identity/authorization";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// This is only the RN-001 authorization boundary. Checkout is not implemented by TASK-003.
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const decision = await requireConfirmedEmailForCheckout(supabase.auth);
    if (!decision.allowed) {
      const status = decision.reason === "unauthenticated" ? 401 : 403;
      return NextResponse.json({ error: decision.reason }, { status });
    }
    return NextResponse.json({ allowed: true });
  } catch (error) {
    const cause = error instanceof Error ? error.cause : undefined;
    const causeCode =
      typeof cause === "object" &&
      cause !== null &&
      "code" in cause &&
      typeof cause.code === "string"
        ? cause.code
        : undefined;

    console.error("[checkout-guard] auth lookup failed", {
      errorName: error instanceof Error ? error.name : typeof error,
      causeCode,
    });
    return NextResponse.json({ error: "auth_unavailable" }, { status: 503 });
  }
}
