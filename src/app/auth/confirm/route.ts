import { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedTypes: EmailOtpType[] = ["signup", "email", "recovery", "invite", "magiclink", "email_change"];

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/perfil";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const next = safeNext(url.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, redirectOrigin));
  }

  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type && allowedTypes.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(next, redirectOrigin));
  }

  return NextResponse.redirect(new URL("/entrar?erro=confirmacao", redirectOrigin));
}
