import { describe, it, expect } from "vitest";
import { EXPERIMENTS, rankExperiments, MATERIALS } from "@/lib/fire";
describe("experiment ranking", () => {
  it("CFI-G O2 range comes from the uploaded table (12%–85%)", () => {
    expect(EXPERIMENTS.find((e) => e.id === "CFI-G")?.o2).toEqual([12, 85]);
  });
  it("experiments without uploaded tables show no O2 range", () => {
    expect(EXPERIMENTS.find((e) => e.id === "BASS")?.o2).toBeNull();
  });
  it("ranking changes with the environment and gives a reason", () => {
    const iss = rankExperiments({ o2: 21, kPa: 101, gravity: "micro", material: MATERIALS[0] }, "");
    const moon = rankExperiments({ o2: 34, kPa: 56.5, gravity: "lunar", material: MATERIALS[0] }, "");
    expect(iss.map((r) => r.e.id)).not.toEqual(moon.map((r) => r.e.id));
    expect(iss[0]!.reason.length).toBeGreaterThan(0);
  });
});
