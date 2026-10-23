import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  profile: null as { role: string; active: boolean } | null,
  profileError: null as Error | null,
}));

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.createClient }));

import { POST } from "./route";

function request(body: unknown): Request {
  return new Request("http://localhost/api/admin/catalog/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/catalog/categories", () => {
  beforeEach(() => {
    mocks.createClient.mockReset();
    mocks.getUser.mockReset();
    mocks.profile = null;
    mocks.profileError = null;
    mocks.createClient.mockResolvedValue({
      auth: { getUser: mocks.getUser },
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: mocks.profile, error: mocks.profileError }) }),
        }),
      }),
    });
  });

  it("returns 400 for invalid category data before accessing Supabase", async () => {
    const response = await POST(request({ name: "Invalid", slug: "Not a slug" }));
    expect(response.status).toBe(400);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("returns 401 when no authenticated user is present", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await POST(request({ name: "Acessórios extra", slug: "acessorios-extra" }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when an authenticated user is not an active administrator", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "customer-id" } }, error: null });
    mocks.profile = { role: "customer", active: true };
    const response = await POST(request({ name: "Acessórios extra", slug: "acessorios-extra" }));
    expect(response.status).toBe(403);
  });
});
