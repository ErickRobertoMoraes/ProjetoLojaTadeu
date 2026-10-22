import { NextResponse } from "next/server";
import { parseRegistrationInput } from "@/lib/identity/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = parseRegistrationInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "validation_failed", fields: parsed.errors }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const { data, error } = await supabase.auth.signUp({
      email: parsed.value.email,
      password: parsed.value.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/confirm?next=/perfil`,
        data: {
          name: parsed.value.name,
          phone: parsed.value.phone,
          cpf_formatted: parsed.value.cpf_formatted,
          address: parsed.value.address,
        },
      },
    });

    if (error || !data.user) {
      return NextResponse.json({ error: "signup_failed" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, confirmationRequired: !data.session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "auth_unavailable" }, { status: 503 });
  }
}
