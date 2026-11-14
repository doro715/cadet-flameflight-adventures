import { describe, expect, it } from "vitest";
import { EQUIPMENT, equipmentResult, equipmentStory } from "@/lib/cadet-equipment";

describe("equipment oxygen comparison", () => {
  const cotton = EQUIPMENT.find((m) => m.id === "cotton");
  const nomex = EQUIPMENT.find((m) => m.id === "nomex");
  it("compares cotton's 18% example index to 30% oxygen", () => {
    if (!cotton) throw new Error("Missing cotton");
    expect(cotton.loi).toBe(18);
    expect(equipmentResult(cotton, 30)).toBe("above-index");
  });
  it("does not treat Nomex at 30% as protected by a 28% index", () => {
    if (!nomex) throw new Error("Missing Nomex");
    expect(nomex.loi).toBe(28);
    expect(equipmentResult(nomex, 30)).toBe("above-index");
  });
  it("compares Nomex at 21% below the example index", () => {
    if (!nomex) throw new Error("Missing Nomex");
    expect(equipmentResult(nomex, 21)).toBe("below-index");
  });
  it("includes the exact index in the higher-oxygen band", () => {
    if (!nomex) throw new Error("Missing Nomex");
    expect(equipmentResult(nomex, 28)).toBe("above-index");
  });
  it("creates three story pages from the chosen material, atmosphere and tool", () => {
    const pages = equipmentStory({ materialId: "nomex", oxygen: 30, gravity: "lunar", tool: "mist" });
    expect(pages).toHaveLength(3);
    expect(pages[0]?.icon).toBe("🧑‍🚒");
    expect(pages[2]?.icon).toBe("💧");
  });
});