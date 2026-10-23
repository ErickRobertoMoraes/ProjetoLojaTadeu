import { describe, expect, it } from "vitest";
import { parseAdminAccessRequest } from "./admin-access";

describe("admin access request validation", () => {
  it.each(["promote", "deactivate"] as const)("accepts %s for a UUID target", (action) => {
    expect(parseAdminAccessRequest({
      targetUserId: "50000000-0000-4000-8000-000000000001",
      action,
    })).toEqual({
      ok: true,
      targetUserId: "50000000-0000-4000-8000-000000000001",
      action,
    });
  });

  it.each([
    null,
    [],
    {},
    { targetUserId: "not-a-uuid", action: "promote" },
    { targetUserId: "50000000-0000-4000-8000-000000000001", action: "delete" },
  ])("rejects malformed or unsupported requests", (value) => {
    expect(parseAdminAccessRequest(value)).toEqual({ ok: false });
  });
});
