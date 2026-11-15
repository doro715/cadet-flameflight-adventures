import { ROWS } from "./model";
export type Material = { id: string; name: string; kid: string; factor: number; loi: number };
export const MATERIALS: Material[] = [
  { id: "cotton", name: "Cotton fabric", kid: "T-shirt", factor: 1.0, loi: 18 },
  { id: "pmma", name: "PMMA (acrylic)", kid: "Plastic window", factor: 0.85, loi: 17.5 },
  { id: "paper", name: "Filter paper", kid: "Paper", factor: 1.05, loi: 18.5 },
  { id: "nomex", name: "Nomex", kid: "Firefighter suit", factor: 0.35, loi: 28 },
  { id: "silicone", name: "Silicone rubber", kid: "Rubber seal", factor: 0.55, loi: 24 },
];

/** Illustrative risk model (0-100). Not a validated predictor. */
export function riskScore(o2: number, kPa: number, m: Material, gravity: "micro" | "lunar") {
  const o2Partial = (o2 / 100) * kPa; // kPa of O2
  const margin = o2 - m.loi * (101.3 / Math.max(kPa, 20)) ** 0.25;
  const g = gravity === "lunar" ? 1.15 : 1.0;
  const z = 0.16 * margin * m.factor * g + 0.03 * (o2Partial - 21) - 1;
  return Math.round(100 / (1 + Math.exp(-z)));
}

export function band(score: number) {
  if (score < 30) return { label: "Low", tone: "safe" as const };
  if (score < 65) return { label: "Elevated", tone: "warn" as const };
  return { label: "High", tone: "danger" as const };
}

export type Experiment = {
  id: string; name: string; years: string; fuel: string; o2: [number, number] | null;
  kPa: [number, number]; summary: string; tags: string[];
};
const pct = (v: number) => Math.round(v * 1000) / 10;
const cfiO2 = ROWS.map((r) => r.o2), cfiBar = ROWS.map((r) => r.bar);
/** O₂ ranges are only filled where the uploaded tables contain tests; others are null. */
export const EXPERIMENTS: Experiment[] = [
  { id: "CFI-G", name: "Cool Flames Investigation with Gases", years: "2019–", fuel: "gas", o2: [pct(Math.min(...cfiO2)), pct(Math.max(...cfiO2))], kPa: [Math.round(Math.min(...cfiBar) * 101.3), Math.round(Math.max(...cfiBar) * 101.3)], summary: `${ROWS.length} ethane, propane and butane gas-flame tests in the uploaded table, recording hot ignition and burn time across oxygen and pressure.`, tags: ["gas", "cool flames", "ignition", "uploaded data"] },
  { id: "BASS", name: "Burning and Suppression of Solids", years: "2011–2013", fuel: "solid", o2: null, kPa: [50, 101], summary: "Studied how flat and cylindrical solids burn in microgravity air flow; flames survived at lower O₂ than on Earth when a gentle flow was present.", tags: ["solids", "flow", "extinction"] },
  { id: "BASS-II", name: "BASS II", years: "2014–2016", fuel: "solid", o2: null, kPa: [50, 101], summary: "Extended BASS to varied oxygen and pressure; mapped flammability boundaries for PMMA, cotton-fiberglass and paper.", tags: ["solids", "limits", "pressure"] },
  { id: "FLEX", name: "Flame Extinguishment Experiment", years: "2009–2012", fuel: "droplet", o2: null, kPa: [50, 101], summary: "Burned fuel droplets as spherical flames; discovered 'cool flames' that keep burning invisibly after the hot flame goes out.", tags: ["droplets", "cool flames", "suppression"] },
  { id: "ACME", name: "Advanced Combustion via Microgravity Experiments", years: "2017–2020", fuel: "gas", o2: null, kPa: [70, 101], summary: "Gaseous diffusion flames for soot, efficiency and extinction studies; includes E-FIELD and BRE flame sets.", tags: ["gas", "soot", "diffusion"] },
  { id: "SoFIE", name: "Solid Fuel Ignition & Extinction", years: "2022–", fuel: "solid", o2: null, kPa: [50, 101], summary: "Ignition and spread over solids at spacecraft-like atmospheres to inform material selection standards.", tags: ["solids", "ignition", "materials"] },
  { id: "Saffire", name: "Spacecraft Fire Safety Demo", years: "2016–2023", fuel: "solid", o2: null, kPa: [55, 101], summary: "Large-scale fires inside uncrewed Cygnus vehicles; showed real fire growth and pressure rise in a closed cabin.", tags: ["large scale", "cabin", "materials"] },
];

export type Env = { o2: number; kPa: number; gravity: "micro" | "lunar"; material?: Material };
export function rankExperiments(env: Env, query: string) {
  const q = query.toLowerCase().trim();
  const solidMaterial = !!env.material;
  return EXPERIMENTS.map((e) => {
    const reasons: { pts: number; text: string }[] = [];
    if (e.id === "CFI-G") {
      const near = ROWS.filter((r) => Math.abs(r.o2 * 100 - env.o2) <= 3 && Math.abs(Math.log(r.bar * 101.3 / env.kPa)) <= Math.log(1.25)).length;
      reasons.push({ pts: Math.min(45, near * 3), text: near ? `${near} uploaded CFI-G tests sit near ${env.o2}% O₂ and ${env.kPa} kPa` : `No uploaded CFI-G tests near ${env.o2}% O₂ and ${env.kPa} kPa` });
    } else if (e.o2) {
      const inside = env.o2 >= e.o2[0] && env.o2 <= e.o2[1];
      reasons.push({ pts: inside ? 35 : 5, text: inside ? `Tested O₂ range covers ${env.o2}%` : `Outside tested O₂ range` });
    }
    const kIn = env.kPa >= e.kPa[0] && env.kPa <= e.kPa[1];
    reasons.push({ pts: kIn ? 15 : 0, text: `Pressure ${env.kPa} kPa within its ${e.kPa[0]}–${e.kPa[1]} kPa runs` });
    if (e.fuel === "solid" && solidMaterial) reasons.push({ pts: 20, text: `Studies solid materials like ${env.material!.name}` });
    if (env.gravity === "lunar" && e.tags.includes("cabin")) reasons.push({ pts: 15, text: "Closed-cabin fire growth matters for a sealed Moon base" });
    if (env.gravity === "micro" && (e.fuel === "droplet" || e.tags.includes("flow"))) reasons.push({ pts: 15, text: "Microgravity flame behaviour is its focus" });
    if (env.o2 > 30 && e.tags.includes("limits")) reasons.push({ pts: 10, text: "Maps flammability limits, key above 30% O₂" });
    if (q) {
      const hay = `${e.id} ${e.name} ${e.summary} ${e.tags.join(" ")} ${e.fuel}`.toLowerCase();
      const hits = q.split(/\s+/).filter((w) => hay.includes(w)).length;
      if (hits) reasons.push({ pts: hits * 15, text: `Matches your search “${query.trim()}”` });
    }
    const score = Math.min(100, reasons.reduce((s, r) => s + r.pts, 0));
    const top = reasons.filter((r) => r.pts > 0).sort((a, b) => b.pts - a.pts)[0];
    return { e, score, reason: top?.text ?? "Weak match for this environment" };
  }).sort((a, b) => b.score - a.score);
}

export function insight(o2: number, kPa: number, m: Material, score: number) {
  const out: string[] = [];
  if (o2 > 30) out.push(`O₂ at ${o2}% is above the ~30% band discussed for lunar habitats — flame spread rates rise sharply here.`);
  if (o2 < m.loi) out.push(`${m.name} is near or below its Earth oxygen index (${m.loi}%), but microgravity flames with gentle airflow can persist below Earth limits (BASS findings).`);
  if (kPa < 70) out.push(`Reduced pressure (${kPa} kPa) lowers O₂ partial pressure, partly offsetting the higher oxygen fraction.`);
  if (m.id === "nomex" || m.id === "silicone") out.push(`${m.name} is a flame-resistant choice — consider it for crew-adjacent surfaces.`);
  out.push(score >= 65 ? "Recommend: fire-resistant materials, ventilation shutdown protocol, and fine water mist suppression ready." : score >= 30 ? "Recommend: monitor with smoke/CO sensors and limit open fabric surfaces." : "Conditions look comparatively safe for this material.");
  return out;
}

export function toCSV() {
  const head = "id,name,years,fuel,o2_min,o2_max,kpa_min,kpa_max,tags";
  return [head, ...EXPERIMENTS.map((e) => [e.id, `"${e.name}"`, e.years, e.fuel, e.o2?.[0] ?? "", e.o2?.[1] ?? "", e.kPa[0], e.kPa[1], `"${e.tags.join(";")}"`].join(","))].join("\n");
}
