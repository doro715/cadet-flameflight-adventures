import { MATERIALS, type Material } from "@/lib/fire";

export const EQUIPMENT = MATERIALS.map((material) => ({
  ...material,
  nickname: ({ cotton: "Everyday shirt cloth", pmma: "See-through plastic", paper: "Drawing paper", nomex: "Firefighter fabric", silicone: "Squishy rubber" } as Record<string, string>)[material.id] ?? material.kid,
  icon: ({ cotton: "👕", pmma: "🪟", paper: "📄", nomex: "🧑‍🚒", silicone: "🧩" } as Record<string, string>)[material.id] ?? "🧵",
}));

/** Teaching comparison only: oxygen index is not an ignition or spacecraft-safety prediction. */
export function equipmentResult(material: Material, oxygen: number) {
  return oxygen >= material.loi ? "above-index" : "below-index";
}

export type StoryChoice = { materialId: string; oxygen: number; gravity: "micro" | "lunar"; tool: "mist" | "fan" | "hatch" };
export function equipmentStory(choice: StoryChoice) {
  const material = EQUIPMENT.find((item) => item.id === choice.materialId) ?? EQUIPMENT[0];
  if (!material) return [];
  const result = equipmentResult(material, choice.oxygen);
  const tool = choice.tool === "mist" ? "Sparky sent a cloud of tiny water droplets to cool our pretend fire." : choice.tool === "fan" ? "Mission Control stopped the fan so it would not blow fresh oxygen toward our pretend fire." : "The crew moved to safety, and Mission Control closed the hatch to isolate the pretend fire.";
  return [
    { title: "An explorer packs", icon: material.icon, text: `I packed ${material.nickname.toLowerCase()} for ${choice.gravity === "lunar" ? "a Moon adventure. Gravity there is one-sixth of Earth's" : "an orbit adventure. In microgravity, everything seems to float"}. Sparky came along!` },
    { title: "A surprising test", icon: "🌬️", text: `Our pretend lab had ${choice.oxygen}% oxygen. My material's example Fire Shield Score was ${material.loi}%. ${result === "above-index" ? "Our oxygen was at or above that score. Even firefighter fabric is not fireproof!" : "Our oxygen was below that score. That does not prove it is safe in space!"}` },
    { title: "Team Sparky", icon: choice.tool === "mist" ? "💧" : choice.tool === "fan" ? "🛑" : "🚪", text: `${tool} I earned an Equipment Explorer badge for asking good questions. Real astronauts always use tested equipment and trained procedures.` },
  ];
}