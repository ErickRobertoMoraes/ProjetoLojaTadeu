import { NextResponse } from "next/server";
import { isValidCredentialsInput } from "@/lib/identity/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!isValidCredentialsInput(body)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email.trim().toLowerCase(),
      password: body.password,
    });
    if (error || !data.user) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "email_unconfirmed" }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "auth_unavailable" }, { status: 503 });
  }
}
