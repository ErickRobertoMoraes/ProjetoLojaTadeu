import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getActiveAdminClient(): Promise<
  { client: SupabaseClient; response: null } | { client: null; response: NextResponse }
> {
  try {
    const client = await createSupabaseServerClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData.user) {
      return { client: null, response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }) };
    }

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("role, active")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (profileError || profile?.role !== "admin" || !profile.active) {
      return { client: null, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
    }

    return { client, response: null };
  } catch {
    return { client: null, response: NextResponse.json({ error: "admin_access_unavailable" }, { status: 503 }) };
  }
}

export function mapCommerceWriteError(code: string | undefined): NextResponse {
  if (code === "23505") return NextResponse.json({ error: "already_exists" }, { status: 409 });
  if (code === "23503") return NextResponse.json({ error: "reference_conflict" }, { status: 409 });
  if (code === "23514" || code === "23502" || code === "22P02" || code === "22003") {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  return NextResponse.json({ error: "settings_unavailable" }, { status: 503 });
}
