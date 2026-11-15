import { option, MISSIONS, type Kit, type MissionId } from "./cadet-kit";

export const AVATARS = ["🧑‍🚀", "👩‍🚀", "👨‍🚀", "🐶", "🦊", "🤖"];
export const PLACES: { id: MissionId; name: string }[] = MISSIONS.map((m) => ({ id: m.id, name: m.name }));
export const PROBLEMS = [
  { id: "wire", icon: "🔌", title: "Hot wire smell", text: "a hot, burnt-plastic smell near a wire bundle", fact: "Overheated wiring is a top fire worry in spacecraft, so cables are tested before flight.", source: "NASA-STD-6001 materials testing" },
  { id: "battery", icon: "🔋", title: "Puffy battery", text: "a laptop battery puffing up and getting warm", fact: "Lithium-ion batteries flying in space must pass NASA safety tests first.", source: "NASA JSC battery safety (JSC 20793)" },
  { id: "flame", icon: "🔥", title: "Runaway test flame", text: "a science flame that would not go out", fact: "In NASA’s FLEX tests, some droplet flames kept burning as invisible ‘cool flames’.", source: "NASA PSI · FLEX experiment" },
] as const;
export type ProblemId = (typeof PROBLEMS)[number]["id"];
export const CHOICES = [
  { q: "What does your hero do first?", options: [
    { id: "alarm", label: "📣 Sound the alarm", good: true, text: "pressed the alarm so the whole crew knew at once", fact: "Astronauts practise fire drills so every crew member knows their job.", source: "NASA ISS emergency procedures" },
    { id: "alone", label: "🔦 Peek alone first", good: false, text: "floated over alone to peek — and the smell grew stronger while nobody else knew", fact: "Crews warn each other first: telling the team quickly saves time.", source: "NASA ISS emergency procedures" },
  ] },
  { q: "What about the air fans?", options: [
    { id: "fans-off", label: "🛑 Turn fans off", good: true, text: "switched off the fans so fresh oxygen stopped feeding the fire", fact: "On the ISS, the first fire response includes stopping ventilation in the module.", source: "NASA ISS fire response" },
    { id: "fans-up", label: "🌬️ Blow fans harder", good: false, text: "turned the fans up — and the flame grew hungrier, so they quickly switched them off", fact: "In microgravity, moving air brings fresh oxygen to a flame (NASA BASS findings).", source: "NASA PSI · BASS experiment" },
  ] },
  { q: "How will the team finish the job?", options: [
    { id: "kit", label: "🧯 Use my kit", good: true, text: "grabbed the extinguisher from the mission kit", fact: "Spacecraft extinguishers are designed to work without gravity.", source: "NASA ISS Portable Fire Extinguisher" },
    { id: "hatch", label: "🚪 Move away & seal hatch", good: true, text: "moved everyone to a safe module and closed the hatch", fact: "Closing a hatch can cut a fire off from the rest of the station’s oxygen.", source: "NASA ISS fire response" },
  ] },
] as const;
export type StoryInput = { hero: string; avatar: string; place: MissionId; problem: ProblemId; kit: Kit; picks: [string, string, string] };
export type Page = { title: string; icon: string; text: string; fact: string; source: string };

const pick = <T,>(arr: readonly T[], v: number) => arr[((v % arr.length) + arr.length) % arr.length]!;

/** Deterministic template page. `variant` lets a single page be regenerated without changing the facts. */
export function makePage(input: StoryInput, n: number, variant = 0): Page {
  const hero = input.hero.trim() || "Cadet";
  const place = MISSIONS.find((m) => m.id === input.place)!;
  const problem = PROBLEMS.find((p) => p.id === input.problem) ?? PROBLEMS[0];
  const c = CHOICES.map((ch, i) => ch.options.find((o) => o.id === input.picks[i]) ?? ch.options[0]);
  const fabric = option("fabric", input.kit.fabric), ext = option("extinguisher", input.kit.extinguisher), side = option("sidekick", input.kit.sidekick);
  switch (n) {
    case 0: return { title: `${hero} at the ${place.name}`, icon: place.icon, text: pick([
      `${hero} floated into the ${place.name} wearing ${fabric?.name ?? "a mission suit"}, with ${side?.name ?? "Sparky"} close behind.`,
      `Morning at the ${place.name}! ${hero} zipped up ${fabric?.name ?? "a mission suit"} and waved to ${side?.name ?? "Sparky"}.`], variant), fact: `${place.name} air: ${place.air}.`, source: place.id === "mars" ? "Pretend setting — no Mars habitat air is decided yet" : "NASA Exploration Atmospheres Working Group" };
    case 1: return { title: "Uh-oh!", icon: problem.icon, text: pick([`Suddenly ${hero} noticed ${problem.text}.`, `"Wait," said ${hero}. "What’s that?" It was ${problem.text}.`], variant) + ` ${hero} ${c[0]!.text}.`, fact: c[0]!.good ? c[0]!.fact : problem.fact, source: c[0]!.good ? c[0]!.source : problem.source };
    case 2: return { title: "Flame food", icon: c[1]!.good ? "🛑" : "🌬️", text: pick([`Next, ${hero} ${c[1]!.text}.`, `Thinking fast, ${hero} ${c[1]!.text}.`], variant), fact: c[1]!.fact, source: c[1]!.source };
    case 3: return { title: "Team rescue", icon: c[2]!.id === "kit" ? ext?.icon ?? "🧯" : "🚪", text: pick([`Then the team ${c[2]!.text}`, `Together, the crew ${c[2]!.text}`], variant) + (c[2]!.id === "kit" ? ` — ${ext?.name ?? "the extinguisher"}.` : "."), fact: c[2]!.id === "kit" && ext ? ext.fact : c[2]!.fact, source: c[2]!.id === "kit" && ext ? ext.source : c[2]!.source };
    default: { const good = c.filter((x) => x.good).length; return { title: "Mission complete", icon: "🏅", text: pick([`The ${place.name} was safe again. ${hero} earned ${good} of 3 smart-choice stars${good < 3 ? " and learned something new" : ""}!`, `Everyone cheered. ${hero} got ${good} smart-choice star${good === 1 ? "" : "s"} and a big high-five from ${side?.name ?? "Sparky"}.`], variant), fact: "Real astronauts train for emergencies on Earth for years before flying.", source: "NASA astronaut training" }; }
  }
}
export const makeStory = (input: StoryInput): Page[] => [0, 1, 2, 3, 4].map((n) => makePage(input, n));
