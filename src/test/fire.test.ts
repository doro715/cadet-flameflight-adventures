import { describe, it, expect } from "vitest";
import { riskScore, MATERIALS } from "@/lib/fire";
describe("risk", () => {
  it("higher oxygen gives higher risk", () => {
    const m = MATERIALS[0]!;
    expect(riskScore(34, 70, m, "lunar")).toBeGreaterThan(riskScore(21, 101, m, "lunar"));
  });
  it("nomex safer than cotton", () => {
    expect(riskScore(30, 70, MATERIALS[3]!, "micro")).toBeLessThan(riskScore(30, 70, MATERIALS[0]!, "micro"));
  });
});
