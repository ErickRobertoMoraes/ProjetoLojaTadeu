import Link from "next/link";
import { LoginForm } from "@/components/identity/forms";

export default function LoginPage() {
  return (
    <main className="identity-page">
      <Link href="/">FitStore</Link>
      <h1>Entrar</h1>
      <p>Acesse sua conta. O e-mail precisa estar confirmado para iniciar uma compra.</p>
      <LoginForm />
      <p><Link href="/recuperar-senha">Esqueci minha senha</Link></p>
      <p>Primeira visita? <Link href="/cadastro">Criar conta</Link></p>
    </main>
  );
}
