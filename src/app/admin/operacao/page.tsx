import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminOperationsPanel } from "@/components/commerce/admin-operations-panel";
import { getActiveAdminClient } from "@/lib/commerce/admin";

export default async function AdminOperationsPage() {
  const authorization = await getActiveAdminClient();
  if (authorization.response?.status === 401) redirect("/entrar");
  if (authorization.response?.status === 403) redirect("/");
  if (authorization.response) return <main className="admin-page"><h1>Operação indisponível</h1><p>Tente novamente em instantes.</p></main>;

  const [{ data: authData }, ordersResult, usersResult, logsResult] = await Promise.all([
    authorization.client.auth.getUser(),
    authorization.client.from("orders").select("id, customer_id, status, payment_method, payment_status, total_cents, created_at, customer:profiles(name)")
      .order("created_at", { ascending: false }).limit(50),
    authorization.client.from("profiles").select("id, name, role, active, created_at")
      .order("created_at", { ascending: false }).limit(100),
    authorization.client.from("audit_logs").select("id, action, entity, entity_id, metadata, occurred_at, actor:profiles(name)")
      .order("occurred_at", { ascending: false }).limit(100),
  ]);

  if (ordersResult.error || usersResult.error || logsResult.error || !authData.user) {
    return <main className="admin-page"><h1>Operação indisponível</h1><p>Não foi possível carregar os dados administrativos.</p><Link href="/">Voltar</Link></main>;
  }

  return <main className="admin-page">
    <Link href="/" className="brand-link">FitStore</Link>
    <p className="eyebrow">Painel administrativo</p>
    <h1>Operação e auditoria</h1>
    <p>Gerencie o andamento dos pedidos, o acesso administrativo e acompanhe alterações críticas.</p>
    <AdminOperationsPanel
      orders={(ordersResult.data ?? []) as never[]}
      users={usersResult.data ?? []}
      auditLogs={(logsResult.data ?? []) as never[]}
      currentUserId={authData.user.id}
    />
  </main>;
}
