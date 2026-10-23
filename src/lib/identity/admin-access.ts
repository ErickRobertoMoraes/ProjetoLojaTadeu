export type AdminAccessAction = "promote" | "deactivate";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseAdminAccessRequest(value: unknown):
  | { ok: true; targetUserId: string; action: AdminAccessAction }
  | { ok: false } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false };

  const body = value as Record<string, unknown>;
  if (typeof body.targetUserId !== "string" || !UUID_PATTERN.test(body.targetUserId)) {
    return { ok: false };
  }
  if (body.action !== "promote" && body.action !== "deactivate") return { ok: false };

  return { ok: true, targetUserId: body.targetUserId, action: body.action };
}
