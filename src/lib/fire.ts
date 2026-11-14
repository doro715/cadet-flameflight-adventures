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
  const z = 0.32 * margin * m.factor * g + 0.04 * (o2Partial - 21);
  return Math.round(100 / (1 + Math.exp(-z)));
}

export function band(score: number) {
  if (score < 30) return { label: "Low", tone: "safe" as const };
  if (score < 65) return { label: "Elevated", tone: "warn" as const };
  return { label: "High", tone: "danger" as const };
}

export type Experiment = {
  id: string; name: string; years: string; fuel: string; o2: [number, number];
  kPa: [number, number]; summary: string; tags: string[];
};
export const EXPERIMENTS: Experiment[] = [
  { id: "BASS", name: "Burning and Suppression of Solids", years: "2011–2013", fuel: "solid", o2: [16, 40], kPa: [50, 101], summary: "Studied how flat and cylindrical solids burn in microgravity air flow; flames survived at lower O₂ than on Earth when a gentle flow was present.", tags: ["solids", "flow", "extinction"] },
  { id: "BASS-II", name: "BASS II", years: "2014–2016", fuel: "solid", o2: [14, 40], kPa: [50, 101], summary: "Extended BASS to varied oxygen and pressure; mapped flammability boundaries for PMMA, cotton-fiberglass and paper.", tags: ["solids", "limits", "pressure"] },
  { id: "FLEX", name: "Flame Extinguishment Experiment", years: "2009–2012", fuel: "droplet", o2: [13, 40], kPa: [50, 101], summary: "Burned fuel droplets as spherical flames; discovered 'cool flames' that keep burning invisibly after the hot flame goes out.", tags: ["droplets", "cool flames", "suppression"] },
  { id: "ACME", name: "Advanced Combustion via Microgravity Experiments", years: "2017–2020", fuel: "gas", o2: [15, 40], kPa: [70, 101], summary: "Gaseous diffusion flames for soot, efficiency and extinction studies; includes E-FIELD and BRE flame sets.", tags: ["gas", "soot", "diffusion"] },
  { id: "SoFIE", name: "Solid Fuel Ignition & Extinction", years: "2022–", fuel: "solid", o2: [15, 40], kPa: [50, 101], summary: "Ignition and spread over solids at spacecraft-like atmospheres to inform material selection standards.", tags: ["solids", "ignition", "materials"] },
  { id: "Saffire", name: "Spacecraft Fire Safety Demo", years: "2016–2023", fuel: "solid", o2: [21, 35], kPa: [55, 101], summary: "Large-scale fires inside uncrewed Cygnus vehicles; showed real fire growth and pressure rise in a closed cabin.", tags: ["large scale", "cabin", "materials"] },
];

export function rankExperiments(o2: number, kPa: number, query: string) {
  const q = query.toLowerCase().trim();
  return EXPERIMENTS.map((e) => {
    let s = 0;
    s += o2 >= e.o2[0] && o2 <= e.o2[1] ? 40 : Math.max(0, 40 - 3 * Math.min(Math.abs(o2 - e.o2[0]), Math.abs(o2 - e.o2[1])));
    s += kPa >= e.kPa[0] && kPa <= e.kPa[1] ? 30 : 10;
    if (q) {
      const hay = `${e.id} ${e.name} ${e.summary} ${e.tags.join(" ")} ${e.fuel}`.toLowerCase();
      s += q.split(/\s+/).filter((w) => hay.includes(w)).length * 15;
    } else s += 10;
    return { e, score: Math.min(100, Math.round(s)) };
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
  return [head, ...EXPERIMENTS.map((e) => [e.id, `"${e.name}"`, e.years, e.fuel, e.o2[0], e.o2[1], e.kPa[0], e.kPa[1], `"${e.tags.join(";")}"`].join(","))].join("\n");
}
