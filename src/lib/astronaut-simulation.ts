export const ISOLATION_DELAY_MS = 2000;
export type AstronautSimulation = { remaining: number; phase: "ready" | "isolating" | "suppressed" | "critical" };
export const INITIAL_ASTRONAUT: AstronautSimulation = { remaining: 43, phase: "ready" };
export const INITIAL_READINGS = { oxygen: 29.6, risk: 75, ignition: 73 };
export const SUPPRESSED_READINGS = { oxygen: 20.0, risk: 20, ignition: 5 };
export const SUPPRESSION_MESSAGE = "✅ Fire Suppressed. O2 normalized.";
type Action = { type: "tick" } | { type: "isolate" } | { type: "elapsed"; milliseconds: number };
export function astronautSimulation(state: AstronautSimulation, action: Action): AstronautSimulation {
  if (action.type === "isolate" && (state.phase === "ready" || state.phase === "critical")) return { ...state, phase: "isolating" };
  if (action.type === "elapsed" && action.milliseconds >= ISOLATION_DELAY_MS && state.phase === "isolating") return { ...state, phase: "suppressed" };
  if (action.type === "tick" && state.phase === "ready") {
    const remaining = Math.max(0, state.remaining - 1);
    return { remaining, phase: remaining === 0 ? "critical" : "ready" };
  }
  return state;
}