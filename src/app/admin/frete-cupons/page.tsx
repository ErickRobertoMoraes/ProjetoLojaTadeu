import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShippingCoupons } from "@/components/commerce/admin-shipping-coupons";
import { getActiveAdminClient } from "@/lib/commerce/admin";
import { SHIPPING_REGIONS } from "@/lib/shipping/shipping";

export default async function ShippingCouponsAdminPage() {
  const authorization = await getActiveAdminClient();
  if (authorization.response?.status === 401) redirect("/entrar");
  if (authorization.response?.status === 403) redirect("/");
  if (authorization.response) {
    return <main className="admin-page"><h1>Configurações indisponíveis</h1><p>Tente novamente em instantes.</p><Link href="/">Voltar</Link></main>;
  }

  const [regionResult, couponResult] = await Promise.all([
    authorization.client.from("shipping_regions")
      .select("id, code, name, price_cents, delivery_days, active").order("code"),
    authorization.client.from("coupons")
      .select("id, code, discount_percent, starts_at, ends_at, minimum_order_cents, usage_limit, usage_count, active")
      .order("created_at", { ascending: false }),
  ]);
  if (regionResult.error || couponResult.error) {
    return <main className="admin-page"><h1>Configurações indisponíveis</h1><p>Tente novamente em instantes.</p><Link href="/">Voltar</Link></main>;
  }

  const configuredRegions = new Map((regionResult.data ?? []).map((region) => [region.code, region]));
  const regions = SHIPPING_REGIONS.map((region) => ({
    ...region,
    ...(configuredRegions.get(region.code) ?? { id: null, price_cents: null, delivery_days: null, active: false }),
  }));

  return (
    <main className="admin-page">
      <Link href="/admin/catalogo" className="brand-link">Voltar ao catálogo</Link>
      <p className="eyebrow">Painel administrativo</p>
      <h1>Frete e cupons</h1>
      <p>Configure os valores e prazos das quatro regiões e gerencie cupons percentuais.</p>
      <AdminShippingCoupons regions={regions} coupons={couponResult.data ?? []} />
    </main>
  );
}
