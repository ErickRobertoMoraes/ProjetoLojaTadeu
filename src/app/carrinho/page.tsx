import Link from "next/link";
import { CartPanel } from "@/components/cart/cart-panel";

export default function CartPage() {
  return <main className="cart-page">
    <header className="catalog-header"><Link href="/" className="brand-link">FitStore</Link>
      <nav className="catalog-account" aria-label="Navegação"><Link href="/produtos">Produtos</Link><Link href="/perfil">Minha conta</Link></nav>
    </header>
    <p className="eyebrow">FitStore · sua seleção</p>
    <h1>Seu carrinho</h1>
    <CartPanel />
  </main>;
}
