import { describe, it, expect } from "vitest";
import { missionCheck, MISSIONS } from "@/lib/cadet-kit";
import { makeStory } from "@/lib/cadet-story";
const best = { fabric: "beta", detector: "smoke", extinguisher: "mist", tank: "pba", sidekick: "astrobee" } as const;
describe("mission kit", () => {
  it("Moon base is 30% oxygen at 10.2 psi", () => {
    const moon = MISSIONS.find((m) => m.id === "moon")!;
    expect(moon.o2).toBe(30); expect(moon.air).toContain("10.2 psi");
  });
  it("cotton on the Moon gives a Prevent hint", () => {
    const r = missionCheck("moon", { ...best, fabric: "cotton" });
    expect(r.low).toContain("prevent"); expect(r.ready).toBe(false);
  });
  it("a strong kit passes the Moon check", () => expect(missionCheck("moon", best).ready).toBe(true));
  it("Mars can be won", () => expect(missionCheck("mars", { fabric: "nomex", detector: "co", extinguisher: "mist", tank: "pba", sidekick: "astrobee" }).ready).toBe(true));
  it("incomplete kit is never ready", () => expect(missionCheck("iss", { fabric: "nomex" }).ready).toBe(false));
});
describe("story", () => {
  it("makes five pages each with a fact and source", () => {
    const pages = makeStory({ hero: "Leo", avatar: "🐶", place: "moon", problem: "wire", kit: best, picks: ["alarm", "fans-off", "kit"] });
    expect(pages).toHaveLength(5);
    pages.forEach((p) => { expect(p.fact).not.toBe(""); expect(p.source).not.toBe(""); });
  });
});
