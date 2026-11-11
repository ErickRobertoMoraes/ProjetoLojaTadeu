import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { orderEmail, requestEmail } from "@/lib/notifications/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const allowedStatuses = new Set(["preparing", "shipped", "delivered", "cancelled"]);
const errorStatuses: Record<string, number> = {
  unauthenticated: 401,
  order_forbidden: 403,
  order_not_found: 404,
  invalid_order_transition: 409,
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "validation_failed" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body) ||
    typeof (body as Record<string, unknown>).status !== "string" ||
    !allowedStatuses.has((body as Record<string, string>).status)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("transition_order_status", {
      p_order_id: id,
      p_status: (body as { status: string }).status,
    });
    if (error) {
      const status = errorStatuses[error.message] ?? (error.code === "42501" ? 403 : error.code === "22023" ? 400 : 503);
      return NextResponse.json({ error: errorStatuses[error.message] ? error.message : status === 503 ? "order_status_unavailable" : error.message }, { status });
    }
    if (!data?.unchanged) await notifyOrderCustomer(id, String(data?.status ?? ""));
    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: "order_status_unavailable" }, { status: 503 });
  }
}

async function notifyOrderCustomer(orderId: string, status: string) {
  try {
    const admin = createSupabaseAdminClient();
    if (!admin) return;
    const { data } = await admin.from("orders").select("customer_id").eq("id", orderId).maybeSingle();
    if (!data) return;
    const { data: customer } = await admin.auth.admin.getUserById(data.customer_id);
    if (!customer.user?.email) return;
    const event = status === "cancelled" ? "order.cancelled" : "order.status_changed";
    await requestEmail(orderEmail(customer.user.email, orderId, status, event));
  } catch {
    // The committed status is authoritative even if recipient lookup or delivery is unavailable.
  }
}
