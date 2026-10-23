import { NextResponse } from "next/server";
import { parseAdminAccessRequest } from "@/lib/identity/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const input = parseAdminAccessRequest(body);
  if (!input.ok) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { error } = await supabase.rpc("manage_admin_access", {
      p_target_user_id: input.targetUserId,
      p_action: input.action,
    });
    if (error) {
      if (error.code === "42501") return NextResponse.json({ error: "forbidden" }, { status: 403 });
      if (error.code === "P0001") return NextResponse.json({ error: "last_active_admin" }, { status: 409 });
      if (error.code === "P0002") return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
      if (error.code === "22023") return NextResponse.json({ error: "invalid_admin_action" }, { status: 400 });
      return NextResponse.json({ error: "admin_access_update_failed" }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "admin_access_unavailable" }, { status: 503 });
  }
}
