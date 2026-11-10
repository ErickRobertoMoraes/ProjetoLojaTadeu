import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { orderEmail, requestEmail } from "@/lib/notifications/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("transition_order_status", {
      p_order_id: id,
      p_status: "cancelled",
    });
    if (error) {
      const responses: Record<string, { status: number; error: string }> = {
        unauthenticated: { status: 401, error: "unauthenticated" },
        order_forbidden: { status: 403, error: "order_forbidden" },
        order_not_found: { status: 404, error: "order_not_found" },
        invalid_order_transition: { status: 409, error: "invalid_order_transition" },
      };
      const mapped = responses[error.message];
      return NextResponse.json({ error: mapped?.error ?? "order_cancellation_unavailable" }, { status: mapped?.status ?? 503 });
    }
    if (!data?.unchanged) await notifyOrderCustomer(id);
    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: "order_cancellation_unavailable" }, { status: 503 });
  }
}

async function notifyOrderCustomer(orderId: string) {
  try {
    const admin = createSupabaseAdminClient();
    if (!admin) return;
    const { data } = await admin.from("orders").select("customer_id").eq("id", orderId).maybeSingle();
    if (!data) return;
    const { data: customer } = await admin.auth.admin.getUserById(data.customer_id);
    if (!customer.user?.email) return;
    await requestEmail(orderEmail(customer.user.email, orderId, "cancelled", "order.cancelled"));
  } catch {
    // The committed cancellation is authoritative even if recipient lookup or delivery is unavailable.
  }
}
