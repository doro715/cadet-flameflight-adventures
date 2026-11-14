import { MATERIALS, riskScore } from "@/lib/fire";

export type Module = { id: string; name: string; o2: number; kPa: number; mat: string; gravity: "micro" | "lunar"; x: number; y: number; w: number; h: number };
// Layout coordinates for the station map (0-100 grid). Values are simulated for the demo.
export const MODULES: Module[] = [
  { id: "destiny", name: "Destiny Lab", o2: 29, kPa: 101, mat: "cotton", gravity: "micro", x: 38, y: 40, w: 18, h: 18 },
  { id: "columbus", name: "Columbus", o2: 24, kPa: 101, mat: "pmma", gravity: "micro", x: 16, y: 40, w: 18, h: 18 },
  { id: "kibo", name: "Kibo", o2: 22, kPa: 101, mat: "silicone", gravity: "micro", x: 60, y: 40, w: 18, h: 18 },
  { id: "harmony", name: "Harmony Node", o2: 21, kPa: 101, mat: "nomex", gravity: "micro", x: 38, y: 16, w: 18, h: 18 },
  { id: "zvezda", name: "Zvezda", o2: 23, kPa: 101, mat: "paper", gravity: "micro", x: 38, y: 64, w: 18, h: 18 },
  { id: "moonhab", name: "Artemis Moon Hab", o2: 34, kPa: 56.5, mat: "cotton", gravity: "lunar", x: 82, y: 16, w: 16, h: 66 },
];

export const mat = (id: string) => MATERIALS.find((m) => m.id === id)!;
export const moduleRisk = (m: Module) => riskScore(m.o2, m.kPa, mat(m.mat), m.gravity);
export const level = (s: number) => (s >= 65 ? { k: "high", icon: "🔴", label: "High Risk", cls: "bg-destructive text-destructive-foreground", txt: "text-destructive" } : s >= 35 ? { k: "mid", icon: "🟡", label: "Elevated", cls: "bg-warn text-primary-foreground", txt: "text-warn" } : { k: "low", icon: "🟢", label: "Low Risk", cls: "bg-safe text-primary-foreground", txt: "text-safe" });

export function context(m: Module) {
  const ratio = m.o2 / 21;
  const pp = (m.o2 / 100) * m.kPa;
  return `O₂ ${m.o2}% ≈ ${ratio.toFixed(2)}× Earth air; O₂ partial pressure ${pp.toFixed(1)} kPa (Earth 21.2).`;
}

export function action(m: Module, s: number) {
  if (s >= 65) return `Isolate ventilation in ${m.name}, ready fine water mist, lower O₂ below 25%.`;
  if (s >= 35) return `Increase air exchange in ${m.name}; target O₂ ≤ 25% and stow loose fabric.`;
  return `Nominal. Keep routine smoke/CO monitoring.`;
}

/** Deterministic 24h forecast for the trend chart (simulated drift). */
export function forecast(m: Module) {
  return Array.from({ length: 25 }, (_, h) => {
    const o2 = m.o2 + Math.sin((h + m.x) / 4) * 1.5 + (m.id === "moonhab" ? h * 0.04 : 0);
    return riskScore(o2, m.kPa, mat(m.mat), m.gravity);
  });
}
