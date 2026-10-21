import { describe, expect, it } from "vitest";
import { projectName } from "./project-info";

describe("project setup", () => {
  it("exposes the configured project name", () => {
    expect(projectName).toBe("FitStore");
  });
});
