import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/identity/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) redirect("/entrar");
  if (!user.email_confirmed_at) redirect("/entrar?erro=email-nao-confirmado");

  const [{ data: profile }, { data: address }] = await Promise.all([
    supabase.from("profiles").select("name, phone, cpf_formatted").eq("id", user.id).maybeSingle(),
    supabase
      .from("addresses")
      .select("postal_code, street, number, complement, district, city, state, shipping_region")
      .eq("customer_id", user.id)
      .maybeSingle(),
  ]);

  if (!profile || !address) {
    return (
      <main className="identity-page">
        <h1>Perfil indisponível</h1>
        <p>Não foi possível carregar seus dados. Saia da conta e entre novamente.</p>
        <Link href="/">Voltar à página inicial</Link>
      </main>
    );
  }

  return (
    <main className="identity-page">
      <Link href="/">FitStore</Link>
      <h1>Meu perfil</h1>
      <p>Conta: {user.email}</p>
      <ProfileForm profile={profile} address={address} />
    </main>
  );
}
