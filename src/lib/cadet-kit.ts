/** Mission-kit game logic. Points are a teaching game, not a safety rating. */
export type Gauge = "prevent" | "detect" | "suppress" | "stamina";
export const GAUGES: { id: Gauge; label: string; icon: string }[] = [
  { id: "prevent", label: "Prevent", icon: "🛡️" },
  { id: "detect", label: "Detect", icon: "📡" },
  { id: "suppress", label: "Suppress", icon: "💧" },
  { id: "stamina", label: "Stamina", icon: "🫁" },
];
export type MissionId = "iss" | "moon" | "mars";
export type Mission = { id: MissionId; name: string; icon: string; air: string; o2: number; need: Record<Gauge, number>; why: string };
export const MISSIONS: Mission[] = [
  { id: "iss", name: "Space Station", icon: "🛰️", air: "21% oxygen at 14.7 psi — like air on Earth", o2: 21, need: { prevent: 3, detect: 3, suppress: 3, stamina: 3 }, why: "Help from Mission Control is a radio call away." },
  { id: "moon", name: "Moon base", icon: "🌕", air: "30%+ oxygen at 10.2 psi — extra flame food", o2: 30, need: { prevent: 5, detect: 3, suppress: 3, stamina: 3 }, why: "More oxygen means materials can burn more easily, so Prevent matters most." },
  { id: "mars", name: "Mars habitat", icon: "🔴", air: "Not decided yet — we pretend Moon-like air", o2: 30, need: { prevent: 4, detect: 3, suppress: 3, stamina: 5 }, why: "Earth is months away, so crews must last on their own: Stamina matters most." },
];
export type Slot = "fabric" | "detector" | "extinguisher" | "tank" | "sidekick";
export type KitOption = { id: string; name: string; icon: string; fact: string; source: string; points: Partial<Record<Gauge, number>> };
export const SLOTS: { id: Slot; label: string; options: KitOption[] }[] = [
  { id: "fabric", label: "Fabric", options: [
    { id: "nomex", name: "Nomex fabric", icon: "🧑‍🚒", fact: "Firefighters wear Nomex because it resists flames — but it is not fireproof.", source: "DuPont Nomex material data", points: { prevent: 3 } },
    { id: "beta", name: "Beta cloth", icon: "🧥", fact: "After the Apollo 1 fire in 1967, NASA added Teflon-coated glass Beta cloth to suits.", source: "NASA History Office, Apollo 1", points: { prevent: 4, stamina: -1 } },
    { id: "cotton", name: "Cotton T-shirt", icon: "👕", fact: "Cotton is comfy but keeps burning in only about 18% oxygen in lab tests.", source: "Limiting Oxygen Index tables", points: { stamina: 1 } },
  ] },
  { id: "detector", label: "Detector", options: [
    { id: "smoke", name: "Smoke detector", icon: "🚨", fact: "Every space station module has smoke detectors watching the air all the time.", source: "NASA ISS Fire Detection and Suppression", points: { detect: 3 } },
    { id: "co", name: "Gas sniffer", icon: "🧪", fact: "ISS crews use a Compound Specific Analyzer to measure carbon monoxide after a fire.", source: "NASA ISS CSA-CP", points: { detect: 2, prevent: 1 } },
    { id: "nose", name: "Just my nose", icon: "👃", fact: "In microgravity smoke does not rise, so it may never drift to your nose.", source: "NASA Spacecraft Fire Safety research", points: {} },
  ] },
  { id: "extinguisher", label: "Extinguisher", options: [
    { id: "mist", name: "Fine water mist", icon: "💦", fact: "The ISS has a water-mist extinguisher: tiny droplets cool the fire and push oxygen away.", source: "NASA ISS Portable Fire Extinguisher", points: { suppress: 3 } },
    { id: "co2", name: "CO₂ extinguisher", icon: "🧯", fact: "CO₂ smothers flames, but in a small cabin crews must wear masks to breathe safely.", source: "NASA ISS Portable Fire Extinguisher", points: { suppress: 3, stamina: -1 } },
    { id: "bucket", name: "Bucket of water", icon: "🪣", fact: "In microgravity water floats out in wobbly blobs instead of pouring onto the fire.", source: "NASA microgravity fluid physics", points: {} },
  ] },
  { id: "tank", label: "Air tank", options: [
    { id: "pba", name: "Breathing apparatus", icon: "🤿", fact: "ISS Portable Breathing Apparatus gives about 15 minutes of clean oxygen.", source: "NASA ISS emergency equipment", points: { stamina: 3 } },
    { id: "mask", name: "Filter mask", icon: "😷", fact: "Filter masks clean smoky air, but they cannot make oxygen.", source: "NASA ISS emergency equipment", points: { stamina: 2 } },
    { id: "none", name: "No tank", icon: "🚫", fact: "Smoke spreads fast in a sealed cabin, so astronauts keep breathing gear close.", source: "NASA ISS emergency procedures", points: {} },
  ] },
  { id: "sidekick", label: "Sidekick", options: [
    { id: "astrobee", name: "Astrobee robot", icon: "🤖", fact: "Astrobee robots fly around the ISS on fans and can carry cameras.", source: "NASA Astrobee project", points: { detect: 1, stamina: 1 } },
    { id: "robonaut", name: "Robonaut 2", icon: "🦾", fact: "Robonaut 2 was a humanoid robot tested on the ISS from 2011 to 2018.", source: "NASA Robonaut 2 project", points: { suppress: 1, prevent: 1 } },
    { id: "mcc", name: "Mission Control", icon: "🎧", fact: "Flight controllers watch station data 24 hours a day, every day.", source: "NASA Mission Control Center", points: { detect: 2 } },
  ] },
];
export type Kit = Partial<Record<Slot, string>>;
export const option = (slot: Slot, id?: string) => SLOTS.find((s) => s.id === slot)?.options.find((o) => o.id === id);
export function gauges(kit: Kit): Record<Gauge, number> {
  const g: Record<Gauge, number> = { prevent: 0, detect: 0, suppress: 0, stamina: 0 };
  for (const s of SLOTS) { const o = option(s.id, kit[s.id]); if (o) for (const [k, v] of Object.entries(o.points)) g[k as Gauge] += v ?? 0; }
  for (const k of Object.keys(g) as Gauge[]) g[k] = Math.max(0, g[k]);
  return g;
}
const HINTS: Record<Gauge, string> = {
  prevent: "Prevent is low — try a flame-resistant fabric so fires have less to eat.",
  detect: "Detect is low — add a smoke detector or Mission Control so you know fast.",
  suppress: "Suppress is low — pick an extinguisher that works without gravity.",
  stamina: "Stamina is low — pack breathing gear so you can last through smoke.",
};
export function missionCheck(missionId: MissionId, kit: Kit) {
  const m = MISSIONS.find((x) => x.id === missionId)!;
  const g = gauges(kit);
  const complete = SLOTS.every((s) => kit[s.id]);
  const low = GAUGES.filter((x) => g[x.id] < m.need[x.id]).map((x) => x.id);
  return { gauges: g, complete, low, hints: low.map((k) => HINTS[k]), ready: complete && low.length === 0 };
}
export type CadetCard = { name: string; mission: MissionId; kit: Kit; gauges: Record<Gauge, number>; date: string };
export const CARD_KEY = "astro-spark-cadet-id";
