import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  profile: null as { role: string; active: boolean } | null,
  profileError: null as Error | null,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createClient,
}));

import { getCatalogAdminClient } from "./admin";

describe("catalog admin authorization", () => {
  beforeEach(() => {
    mocks.getUser.mockReset();
    mocks.createClient.mockReset();
    mocks.profile = null;
    mocks.profileError = null;
    const client = {
      auth: { getUser: mocks.getUser },
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: mocks.profile, error: mocks.profileError }) }),
        }),
      }),
    };
    mocks.createClient.mockResolvedValue(client);
  });

  it("rejects anonymous requests before reading the profile", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await getCatalogAdminClient();
    expect(result.response?.status).toBe(401);
  });

  it.each([
    [{ role: "customer", active: true }, null],
    [{ role: "admin", active: false }, null],
    [null, new Error("profile lookup failed")],
  ] as const)("rejects non-admin, inactive, or unverifiable profiles", async (profile, error) => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-id" } }, error: null });
    mocks.profile = profile;
    mocks.profileError = error;
    const result = await getCatalogAdminClient();
    expect(result.response?.status).toBe(403);
  });

  it("allows an active administrator", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "admin-id" } }, error: null });
    mocks.profile = { role: "admin", active: true };
    const result = await getCatalogAdminClient();
    expect(result.response).toBeNull();
    expect(result.client).not.toBeNull();
  });
});
