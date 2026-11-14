import { describe, it, expect } from "vitest";
import { level } from "@/lib/station";
describe("risk levels", () => {
  it("65+ is high", () => expect(level(65).k).toBe("high"));
  it("35-64 is elevated", () => expect(level(35).k).toBe("mid"));
  it("below 35 is low", () => expect(level(34).k).toBe("low"));
});
