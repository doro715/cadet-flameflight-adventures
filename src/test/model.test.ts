import { describe, it, expect } from "vitest";
import { ROWS, train } from "@/lib/model";
describe("CFI-G model", () => {
  it("loads all 333 tests", () => expect(ROWS.length).toBe(333));
  it("beats always-ignites baseline", () => {
    const base = ROWS.filter((r) => r.ign).length / ROWS.length;
    expect(train().accuracy).toBeGreaterThan(base);
  });
});
