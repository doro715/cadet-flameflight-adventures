import { CadetRescue } from "@/components/astro/CadetRescue";
import { CadetEquipment } from "@/components/astro/CadetEquipment";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function FireTruck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 120" className={className} aria-label="Space fire truck">
      <ellipse cx="110" cy="112" rx="90" ry="6" fill="var(--accent)" opacity=".25" />
      <rect x="20" y="45" width="130" height="45" rx="10" fill="var(--destructive)" />
      <path d="M150 55 h30 l20 20 v15 h-50z" fill="var(--destructive)" />
      <path d="M156 60 h20 l14 14 h-34z" fill="var(--accent)" opacity=".85" />
      <rect x="30" y="30" width="110" height="8" rx="4" fill="var(--muted-foreground)" />
      {[40, 60, 80, 100, 120].map((x) => <rect key={x} x={x} y="26" width="4" height="16" fill="var(--muted-foreground)" />)}
      <rect x="35" y="55" width="40" height="18" rx="4" fill="var(--warn)" />
      <text x="55" y="68" fontSize="10" textAnchor="middle" fontWeight="700" fill="var(--primary-foreground)">911</text>
      <circle cx="160" cy="45" r="6" fill="var(--accent)" className="flicker" />
      {[50, 120, 175].map((x) => <g key={x}><circle cx={x} cy="95" r="13" fill="var(--background)" /><circle cx={x} cy="95" r="5" fill="var(--muted-foreground)" /></g>)}
      <path d="M8 70 q-6 -10 4 -18" stroke="var(--accent)" strokeWidth="3" fill="none" opacity=".7" />
    </svg>
  );
}

export function Flame({ round, size }: { round: boolean; size: number }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="flicker">
      {round ? (
        <><circle cx="50" cy="50" r="40" fill="var(--accent)" opacity=".35" /><circle cx="50" cy="50" r="24" fill="var(--accent)" opacity=".6" /><circle cx="50" cy="50" r="6" fill="var(--foreground)" /></>
      ) : (
        <><path d="M50 8 C70 35 82 55 70 80 C62 95 38 95 30 80 C18 55 30 35 50 8z" fill="var(--primary)" /><path d="M50 40 C60 55 64 65 58 78 C54 86 46 86 42 78 C36 65 40 55 50 40z" fill="var(--warn)" /></>
      )}
    </svg>
  );
}

export function Cadet({ onExpert }: { onExpert: () => void }) {
  const [activity, setActivity] = useState<"rescue" | "equipment">("rescue");
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-3" aria-label="Cadet activities">
      <Button variant={activity === "rescue" ? "default" : "outline"} aria-pressed={activity === "rescue"} className="h-auto min-h-12 whitespace-normal font-bold" onClick={() => setActivity("rescue")}>🚒 Ghost Flame Rescue</Button>
      <Button variant={activity === "equipment" ? "default" : "outline"} aria-pressed={activity === "equipment"} className="h-auto min-h-12 whitespace-normal font-bold" onClick={() => setActivity("equipment")}>🧑‍🚒 Space Suit Builder</Button>
    </div>
    <div hidden={activity !== "rescue"}><CadetRescue truck={<FireTruck className="w-full" />} onExpert={onExpert} /></div>
    <div hidden={activity !== "equipment"}><CadetEquipment truck={<FireTruck className="w-full" />} onExpert={onExpert} /></div>
  </div>;
}
