import { describe, expect, it } from "vitest";
import { initialRescue, rescueReducer } from "@/lib/cadet-rescue";

describe("Cadet rescue", () => {
  it("starts the investigation at 30% oxygen", () => {
    expect(rescueReducer(initialRescue, "start").oxygen).toBe(30);
  });
  it("requires scanning before adjusting oxygen", () => {
    const state = rescueReducer(initialRescue, "start");
    expect(rescueReducer(state, { oxygen: 21 }).oxygen).toBe(30);
  });
  it("unlocks firefighting only after lowering oxygen to 21%", () => {
    const state = rescueReducer(rescueReducer(initialRescue, "start"), "scan");
    expect(rescueReducer(state, "fight").act).toBe(2);
    expect(rescueReducer(rescueReducer(state, { oxygen: 21 }), "fight").act).toBe(3);
  });
  it("bucket water does not win the game", () => {
    expect(rescueReducer({ ...initialRescue, act: 3 }, "bucket").outcome).toBe("bucket");
  });
  it("fans strengthen the flame rather than winning", () => {
    expect(rescueReducer({ ...initialRescue, act: 3 }, "fans").outcome).toBe("fans");
  });
  it("mist earns the badge and keeps the station saved", () => {
    const saved = rescueReducer({ ...initialRescue, act: 3 }, "mist");
    expect(saved.outcome).toBe("saved");
    expect(rescueReducer(saved, "fans").outcome).toBe("saved");
  });
});