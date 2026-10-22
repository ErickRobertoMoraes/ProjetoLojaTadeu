import Link from "next/link";
import { RecoveryForm } from "@/components/identity/forms";

export default function RecoveryPage() {
  return (
    <main className="identity-page">
      <Link href="/entrar">Voltar ao login</Link>
      <h1>Recuperar senha</h1>
      <p>Enviaremos instruções ao e-mail cadastrado, caso exista uma conta.</p>
      <RecoveryForm />
    </main>
  );
}
