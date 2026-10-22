import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>FitStore</h1>
      <p>Loja virtual de produtos para academia.</p>
      <nav className="home-links" aria-label="Acesso à conta">
        <Link href="/cadastro">Criar conta</Link>
        <Link href="/entrar">Entrar</Link>
      </nav>
    </main>
  );
}
