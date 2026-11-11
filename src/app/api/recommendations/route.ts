import { NextResponse } from "next/server";
import { getCustomerRecommendations } from "@/lib/recommendations/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const result = await getCustomerRecommendations(supabase, authData.user.id);
    if (result.error) return NextResponse.json({ error: "recommendations_unavailable" }, { status: 503 });
    return NextResponse.json({ recommendations: result.recommendations });
  } catch {
    return NextResponse.json({ error: "recommendations_unavailable" }, { status: 503 });
  }
}
