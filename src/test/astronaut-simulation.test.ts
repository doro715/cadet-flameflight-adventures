import { describe, expect, it } from "vitest";
import { astronautSimulation, INITIAL_ASTRONAUT, INITIAL_READINGS, SUPPRESSED_READINGS, SUPPRESSION_MESSAGE, ISOLATION_DELAY_MS } from "@/lib/astronaut-simulation";

describe("Astronaut emergency simulation", () => {
  it("starts at 43 seconds with the requested initial readings", () => {
    expect(INITIAL_ASTRONAUT.remaining).toBe(43);
    expect(INITIAL_READINGS).toEqual({ oxygen: 29.6, risk: 75, ignition: 73 });
  });
  it("isolates for two seconds before applying 20% oxygen, risk 20 and ignition 5%", () => {
    const busy = astronautSimulation(INITIAL_ASTRONAUT, { type: "isolate" });
    expect(ISOLATION_DELAY_MS).toBe(2000);
    expect(astronautSimulation(busy, { type: "elapsed", milliseconds: 1999 }).phase).toBe("isolating");
    expect(astronautSimulation(busy, { type: "elapsed", milliseconds: 2000 }).phase).toBe("suppressed");
    expect(SUPPRESSED_READINGS).toEqual({ oxygen: 20.0, risk: 20, ignition: 5 });
  });
  it("becomes critical after 43 seconds without isolation and never wraps", () => {
    let state = INITIAL_ASTRONAUT;
    for (let second = 0; second < 42; second++) state = astronautSimulation(state, { type: "tick" });
    expect(state).toEqual({ remaining: 1, phase: "ready" });
    state = astronautSimulation(state, { type: "tick" });
    expect(state).toEqual({ remaining: 0, phase: "critical" });
    expect(astronautSimulation(state, { type: "tick" }).remaining).toBe(0);
  });
  it("stops the deadline when isolation starts before zero", () => {
    const busy = astronautSimulation({ remaining: 1, phase: "ready" }, { type: "isolate" });
    expect(astronautSimulation(busy, { type: "tick" })).toEqual({ remaining: 1, phase: "isolating" });
  });
});