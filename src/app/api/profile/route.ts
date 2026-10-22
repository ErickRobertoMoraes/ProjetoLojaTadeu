import { NextResponse } from "next/server";
import { isValidProfileUpdate, parseRegistrationInput } from "@/lib/identity/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!isValidProfileUpdate(body)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  const parsed = parseRegistrationInput({
    ...body,
    email: "profile@example.test",
    password: "profile-update-placeholder",
  });
  if (!parsed.ok) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  const input = parsed.value;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { error: profileError } = await supabase.rpc("update_customer_profile", {
      p_name: input.name,
      p_phone: input.phone,
      p_cpf_formatted: input.cpf_formatted,
    });
    if (profileError) return NextResponse.json({ error: "profile_update_failed" }, { status: 400 });

    const { error: addressError } = await supabase
      .from("addresses")
      .upsert({ customer_id: user.id, ...input.address }, { onConflict: "customer_id" });
    if (addressError) return NextResponse.json({ error: "address_update_failed" }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "profile_unavailable" }, { status: 503 });
  }
}
