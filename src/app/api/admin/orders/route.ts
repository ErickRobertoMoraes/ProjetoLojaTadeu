import { NextResponse } from "next/server";
import { getActiveAdminClient } from "@/lib/commerce/admin";

const ORDER_STATUSES = new Set(["pending", "payment_approved", "preparing", "shipped", "delivered", "cancelled"]);

export async function GET(request: Request) {
  const authorization = await getActiveAdminClient();
  if (authorization.response) return authorization.response;

  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  if (status && !ORDER_STATUSES.has(status)) {
    return NextResponse.json({ error: "invalid_order_status" }, { status: 400 });
  }
  const requestedPage = Number(params.get("page") ?? "1");
  if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > 10_000) {
    return NextResponse.json({ error: "invalid_page" }, { status: 400 });
  }

  const from = (requestedPage - 1) * 50;
  let query = authorization.client.from("orders")
    .select("id, customer_id, status, payment_method, payment_status, total_cents, created_at, updated_at, customer:profiles(name)", { count: "exact" })
    .order("created_at", { ascending: false }).range(from, from + 49);
  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: "admin_orders_unavailable" }, { status: 503 });
  return NextResponse.json({ orders: data ?? [], page: requestedPage, page_size: 50, total: count ?? 0 });
}
