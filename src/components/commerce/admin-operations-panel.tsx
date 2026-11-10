"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Order = {
  id: string;
  customer_id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_cents: number;
  created_at: string;
  customer: { name: string } | null;
};
type AdminUser = { id: string; name: string; role: string; active: boolean; created_at: string };
type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
  actor: { name: string } | null;
};

const STATUS_OPTIONS = ["preparing", "shipped", "delivered", "cancelled"];
const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (value: string) => new Date(value).toLocaleString("pt-BR");

export function AdminOperationsPanel({
  orders, users, auditLogs, currentUserId,
}: { orders: Order[]; users: AdminUser[]; auditLogs: AuditLog[]; currentUserId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  async function send(url: string, method: string, body: unknown, key: string) {
    setBusy(key);
    setMessage("");
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setMessage(result.error === "last_active_admin"
          ? "A loja precisa manter ao menos um administrador ativo."
          : `A operação não foi concluída (${result.error ?? response.status}).`);
        return;
      }
      setMessage("Alteração concluída. O registro de auditoria foi atualizado.");
      router.refresh();
    } catch {
      setMessage("Não foi possível conectar ao serviço administrativo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="admin-operations">
      <nav className="admin-operations-links" aria-label="Áreas administrativas">
        <a href="/admin/catalogo">Catálogo e estoque</a>
        <a href="/admin/frete-cupons">Frete e cupons</a>
      </nav>
      {message && <p role="status" aria-live="polite">{message}</p>}

      <section aria-labelledby="orders-heading">
        <h2 id="orders-heading">Pedidos recentes</h2>
        {orders.length === 0 ? <p>Nenhum pedido encontrado.</p> : (
          <div className="admin-operations-scroll"><table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Status</th><th>Pagamento</th><th>Total</th><th>Solicitar status</th></tr></thead>
            <tbody>{orders.map((order) => <tr key={order.id}>
              <td><code>{order.id.slice(0, 8)}</code><small>{date(order.created_at)}</small></td>
              <td>{order.customer?.name ?? "Cliente"}</td><td>{order.status}</td>
              <td>{order.payment_method} · {order.payment_status}</td><td>{money(order.total_cents)}</td>
              <td><form className="admin-operations-action" onSubmit={(event) => {
                event.preventDefault();
                void send(`/api/orders/${order.id}/status`, "PATCH", { status: statuses[order.id] ?? "preparing" }, `order:${order.id}`);
              }}>
                <label className="visually-hidden" htmlFor={`status-${order.id}`}>Novo status do pedido {order.id.slice(0, 8)}</label>
                <select id={`status-${order.id}`} value={statuses[order.id] ?? "preparing"} onChange={(event) => setStatuses({ ...statuses, [order.id]: event.target.value })}>
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button type="submit" disabled={busy === `order:${order.id}`}>Atualizar</button>
              </form></td>
            </tr>)}</tbody>
          </table></div>
        )}
      </section>

      <section aria-labelledby="users-heading">
        <h2 id="users-heading">Acesso administrativo</h2>
        <p>Mostrando até 100 contas recentes. A conta atual e administradores inativos não podem ser alterados aqui.</p>
        <div className="admin-operations-scroll"><table>
          <thead><tr><th>Nome</th><th>Papel</th><th>Estado</th><th>Ação</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}>
            <td>{user.name}</td><td>{user.role}</td><td>{user.active ? "Ativa" : "Inativa"}</td>
            <td>{user.id === currentUserId || !user.active ? "—" : <button type="button" disabled={busy === `user:${user.id}`} onClick={() => void send("/api/admin/users/access", "POST", {
              target_user_id: user.id, action: user.role === "admin" ? "deactivate" : "promote",
            }, `user:${user.id}`)}>{user.role === "admin" ? "Desativar admin" : "Promover a admin"}</button>}</td>
          </tr>)}</tbody>
        </table></div>
      </section>

      <section aria-labelledby="audit-heading">
        <h2 id="audit-heading">Auditoria recente</h2>
        {auditLogs.length === 0 ? <p>Nenhuma alteração registrada.</p> : <div className="admin-operations-scroll"><table>
          <thead><tr><th>Data</th><th>Responsável</th><th>Ação</th><th>Entidade</th><th>Alterações registradas</th></tr></thead>
          <tbody>{auditLogs.map((log) => <tr key={log.id}>
            <td>{date(log.occurred_at)}</td><td>{log.actor?.name ?? "Conta removida"}</td><td>{log.action}</td>
            <td>{log.entity} <small>{log.entity_id?.slice(0, 8) ?? ""}</small></td>
            <td><code>{JSON.stringify(log.metadata)}</code></td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </div>
  );
}
