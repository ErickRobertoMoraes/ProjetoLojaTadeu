"use client";

import { useState, type FormEvent } from "react";
import type { ShippingRegionCode } from "@/lib/shipping/shipping";

type RegionView = {
  code: ShippingRegionCode;
  name: string;
  id: string | null;
  price_cents: number | null;
  delivery_days: number | null;
  active: boolean;
};

type CouponView = {
  id: string;
  code: string;
  discount_percent: number;
  starts_at: string;
  ends_at: string;
  minimum_order_cents: number;
  usage_limit: number;
  usage_count: number;
  active: boolean;
};

type Props = { regions: RegionView[]; coupons: CouponView[] };
type ApiResponse = { error?: string; region?: RegionView; coupon?: CouponView };

const errorMessages: Record<string, string> = {
  validation_failed: "Revise os dados informados.",
  already_exists: "Já existe um registro com esse código.",
  unauthenticated: "Entre novamente para continuar.",
  forbidden: "Sua conta não tem permissão para essa ação.",
};

function centsFromInput(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

function moneyInputValue(cents: number | null): string {
  return cents === null ? "" : (cents / 100).toFixed(2);
}

function localDateTime(value: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function saoPauloDateTimeToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const wallTimeUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(wallTimeUtc));
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  const asLocalWallTime = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
  const offset = asLocalWallTime - wallTimeUtc;
  const instant = new Date(wallTimeUtc - offset);
  return Number.isNaN(instant.getTime()) ? null : instant.toISOString();
}

export function AdminShippingCoupons({ regions: initialRegions, coupons: initialCoupons }: Props) {
  const [regions, setRegions] = useState(initialRegions);
  const [coupons, setCoupons] = useState(initialCoupons);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"error" | "success">("success");
  const [busy, setBusy] = useState<string | null>(null);

  async function submit(url: string, method: string, body: unknown): Promise<ApiResponse | null> {
    setBusy(url);
    setNotice("");
    setNoticeType("success");
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as ApiResponse;
      if (!response.ok) {
        setNoticeType("error");
        setNotice(errorMessages[result.error ?? ""] ?? "Não foi possível salvar. Tente novamente.");
        return null;
      }
      return result;
    } catch {
      setNoticeType("error");
      setNotice("Não foi possível conectar ao servidor. Tente novamente.");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function saveRegion(event: FormEvent<HTMLFormElement>, region: RegionView) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const price = centsFromInput(form.get("price"));
    const deliveryDays = Number(form.get("delivery_days"));
    if (price === null || !Number.isSafeInteger(deliveryDays)) {
      setNoticeType("error");
      setNotice("Informe um valor válido em reais e um prazo em dias inteiros.");
      return;
    }
    const result = await submit(`/api/admin/shipping-regions/${region.code}`, "PATCH", {
      price_cents: price,
      delivery_days: deliveryDays,
    });
    if (result?.region) {
      setRegions((current) => current.map((item) => item.code === region.code ? result.region! : item));
      setNoticeType("success");
      setNotice("Frete da região salvo.");
    }
  }

  async function saveCoupon(event: FormEvent<HTMLFormElement>, couponId?: string) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const minimum = centsFromInput(form.get("minimum_order"));
    const startsAt = typeof form.get("starts_at") === "string" ? saoPauloDateTimeToIso(form.get("starts_at") as string) : null;
    const endsAt = typeof form.get("ends_at") === "string" ? saoPauloDateTimeToIso(form.get("ends_at") as string) : null;
    const percent = Number(form.get("discount_percent"));
    const usageLimit = Number(form.get("usage_limit"));
    if (minimum === null || !startsAt || !endsAt) {
      setNoticeType("error");
      setNotice("Informe valores monetários e datas válidas.");
      return;
    }
    const body = {
      code: form.get("code"),
      discount_percent: percent,
      starts_at: startsAt,
      ends_at: endsAt,
      minimum_order_cents: minimum,
      usage_limit: usageLimit,
      active: form.get("active") === "on",
    };
    const result = await submit(couponId ? `/api/admin/coupons/${couponId}` : "/api/admin/coupons", couponId ? "PATCH" : "POST", body);
    if (result?.coupon) {
      setCoupons((current) => couponId
        ? current.map((coupon) => coupon.id === couponId ? result.coupon! : coupon)
        : [result.coupon!, ...current]);
      if (!couponId) formElement.reset();
      setNoticeType("success");
      setNotice("Cupom salvo.");
    }
  }

  return (
    <div className="admin-catalog-content">
      {notice && <p className={noticeType === "error" ? "form-error" : "form-success"} role="status">{notice}</p>}
      <section className="admin-section" aria-labelledby="shipping-settings-title">
        <div className="section-heading"><div><p className="eyebrow">Entrega</p><h2 id="shipping-settings-title">Faixas de frete</h2></div></div>
        <div className="settings-grid">
          {regions.map((region) => (
            <form className="settings-card identity-form" key={region.code} onSubmit={(event) => void saveRegion(event, region)}>
              <h3>{region.name}</h3>
              <p>{region.active ? "Configurado" : "Ainda não configurado"}</p>
              <label className="form-field">Valor do frete (R$)
                <input name="price" type="number" min="0" max="21474836.47" step="0.01" required defaultValue={moneyInputValue(region.price_cents)} />
              </label>
              <label className="form-field">Prazo (dias)
                <input name="delivery_days" type="number" min="1" max="2147483647" step="1" required defaultValue={region.delivery_days ?? ""} />
              </label>
              <button type="submit" disabled={busy === `/api/admin/shipping-regions/${region.code}`}>
                {region.active ? "Salvar frete" : "Configurar região"}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="admin-section" aria-labelledby="coupon-settings-title">
        <div className="section-heading"><div><p className="eyebrow">Promoções</p><h2 id="coupon-settings-title">Cupons percentuais</h2></div></div>
        <CouponForm onSubmit={(event) => void saveCoupon(event)} busy={busy === "/api/admin/coupons"} />
        <div className="admin-list">
          {coupons.map((coupon) => (
            <details className="settings-card" key={coupon.id}>
              <summary>{coupon.code} · {coupon.discount_percent}% · {coupon.active ? "Ativo" : "Inativo"}</summary>
              <CouponForm coupon={coupon} onSubmit={(event) => void saveCoupon(event, coupon.id)} busy={busy === `/api/admin/coupons/${coupon.id}`} />
              <p>Usos: {coupon.usage_count} de {coupon.usage_limit}</p>
            </details>
          ))}
          {coupons.length === 0 && <p>Nenhum cupom cadastrado.</p>}
        </div>
      </section>
      <p className="settings-note">O desconto incide sobre o subtotal antes do frete. A data final não é incluída no período de validade.</p>
    </div>
  );
}

function CouponForm({ coupon, onSubmit, busy }: {
  coupon?: CouponView;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
}) {
  return (
    <form className="identity-form settings-coupon-form" onSubmit={onSubmit}>
      <label className="form-field">Código
        <input name="code" required minLength={2} maxLength={40} pattern="[A-Za-z0-9][A-Za-z0-9_-]{1,39}" defaultValue={coupon?.code ?? ""} />
      </label>
      <label className="form-field">Desconto (%)
        <input name="discount_percent" type="number" min="0.01" max="100" step="0.01" required defaultValue={coupon?.discount_percent ?? ""} />
      </label>
      <label className="form-field">Início (horário de São Paulo)
        <input name="starts_at" type="datetime-local" required defaultValue={coupon ? localDateTime(coupon.starts_at) : ""} />
      </label>
      <label className="form-field">Fim exclusivo (horário de São Paulo)
        <input name="ends_at" type="datetime-local" required defaultValue={coupon ? localDateTime(coupon.ends_at) : ""} />
      </label>
      <label className="form-field">Pedido mínimo (R$)
        <input name="minimum_order" type="number" min="0" max="21474836.47" step="0.01" required defaultValue={moneyInputValue(coupon?.minimum_order_cents ?? null)} />
      </label>
      <label className="form-field">Limite de usos
        <input name="usage_limit" type="number" min="1" max="2147483647" step="1" required defaultValue={coupon?.usage_limit ?? ""} />
      </label>
      <label className="checkbox-field"><input type="checkbox" name="active" defaultChecked={coupon?.active ?? true} /> Ativo</label>
      <button type="submit" disabled={busy}>{coupon ? "Salvar alterações" : "Criar cupom"}</button>
    </form>
  );
}
