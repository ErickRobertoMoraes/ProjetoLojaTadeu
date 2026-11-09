import { NextResponse } from "next/server";
import { getActiveAdminClient } from "@/lib/commerce/admin";

const AUDIT_ENTITIES = new Set(["orders", "products", "product_variants", "categories", "coupons", "shipping_regions", "profiles"]);

export async function GET(request: Request) {
  const authorization = await getActiveAdminClient();
  if (authorization.response) return authorization.response;

  const params = new URL(request.url).searchParams;
  const entity = params.get("entity");
  if (entity && !AUDIT_ENTITIES.has(entity)) return NextResponse.json({ error: "invalid_entity" }, { status: 400 });
  const requestedLimit = Number(params.get("limit") ?? "50");
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 100) {
    return NextResponse.json({ error: "invalid_limit" }, { status: 400 });
  }

  let query = authorization.client.from("audit_logs")
    .select("id, actor_id, action, entity, entity_id, metadata, occurred_at, actor:profiles(name)")
    .order("occurred_at", { ascending: false }).limit(requestedLimit);
  if (entity) query = query.eq("entity", entity);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "audit_logs_unavailable" }, { status: 503 });
  return NextResponse.json({ audit_logs: data ?? [] });
}
