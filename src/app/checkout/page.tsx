import Link from "next/link";
import { CheckoutQuote } from "@/components/checkout/checkout-quote";

export default function CheckoutPage() {
  return <main className="cart-page">
    <header className="catalog-header"><Link href="/" className="brand-link">FitStore</Link>
      <nav className="catalog-account" aria-label="Navegação"><Link href="/carrinho">Carrinho</Link><Link href="/perfil">Minha conta</Link></nav>
    </header>
    <p className="eyebrow">FitStore · checkout</p>
    <h1>Revisar pedido</h1>
    <CheckoutQuote />
  </main>;
}
