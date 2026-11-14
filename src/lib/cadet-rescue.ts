export type RescueState = { act: 1 | 2 | 3; scanned: boolean; oxygen: number; outcome: "idle" | "bucket" | "fans" | "saved" };
export type RescueAction = "start" | "scan" | "fight" | "bucket" | "fans" | "mist" | "reset" | { oxygen: number };
export const initialRescue: RescueState = { act: 1, scanned: false, oxygen: 30, outcome: "idle" };

export function rescueReducer(state: RescueState, action: RescueAction): RescueState {
  if (action === "reset") return initialRescue;
  if (action === "start") return { ...state, act: 2 };
  if (action === "scan" && state.act === 2) return { ...state, scanned: true };
  if (typeof action === "object" && state.act === 2 && state.scanned) return { ...state, oxygen: Math.max(21, Math.min(30, action.oxygen)) };
  if (action === "fight" && state.act === 2 && state.scanned && state.oxygen === 21) return { ...state, act: 3 };
  if (state.act === 3 && state.outcome !== "saved" && (action === "bucket" || action === "fans" || action === "mist")) return { ...state, outcome: action === "mist" ? "saved" : action };
  return state;
}