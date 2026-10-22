import Link from "next/link";
import { PasswordUpdateForm } from "@/components/identity/forms";

export default function PasswordResetPage() {
  return (
    <main className="identity-page">
      <Link href="/entrar">Voltar ao login</Link>
      <h1>Definir nova senha</h1>
      <p>Use a sessão aberta pelo link de recuperação enviado por e-mail.</p>
      <PasswordUpdateForm />
    </main>
  );
}
