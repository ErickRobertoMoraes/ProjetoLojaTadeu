import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>FitStore</h1>
      <p>Loja virtual de produtos para academia.</p>
      <section className="home-catalog" aria-labelledby="home-catalog-title">
        <h2 id="home-catalog-title">Explore o catálogo</h2>
        <nav className="category-links" aria-label="Categorias de produtos">
          <Link href="/produtos?category=roupas">Roupas</Link>
          <Link href="/produtos?category=suplementos">Suplementos</Link>
          <Link href="/produtos?category=acessorios">Acessórios</Link>
          <Link href="/produtos">Ver todos</Link>
        </nav>
      </section>
      <nav className="home-links" aria-label="Acesso à conta">
        <Link href="/cadastro">Criar conta</Link>
        <Link href="/entrar">Entrar</Link>
      </nav>
    </main>
  );
}
