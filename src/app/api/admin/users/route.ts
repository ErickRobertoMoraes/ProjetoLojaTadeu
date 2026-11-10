import { NextResponse } from "next/server";
import { getActiveAdminClient } from "@/lib/commerce/admin";

export async function GET() {
  const authorization = await getActiveAdminClient();
  if (authorization.response) return authorization.response;

  const { data, error } = await authorization.client.from("profiles")
    .select("id, name, role, active, created_at")
    .order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "admin_users_unavailable" }, { status: 503 });
  return NextResponse.json({ users: data ?? [] });
}
