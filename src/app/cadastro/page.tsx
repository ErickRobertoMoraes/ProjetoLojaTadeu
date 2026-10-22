import Link from "next/link";
import { RegistrationForm } from "@/components/identity/forms";

export default function RegistrationPage() {
  return (
    <main className="identity-page">
      <Link href="/">FitStore</Link>
      <h1>Criar conta</h1>
      <p>Cadastre seus dados para acessar seu perfil e acompanhar suas compras.</p>
      <RegistrationForm />
      <p>Já tem conta? <Link href="/entrar">Entrar</Link></p>
    </main>
  );
}
