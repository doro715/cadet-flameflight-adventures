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

function Flame({ round, size }: { round: boolean; size: number }) {
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

const QUIZ = [
  { q: "In space, what shape is a candle flame?", a: ["A pointy teardrop", "A round ball"], c: 1, why: "No gravity means hot air doesn't rise, so the flame spreads evenly in every direction — like a ball!" },
  { q: "What color are most space flames?", a: ["Blue", "Bright yellow"], c: 0, why: "Space flames make less soot, and soot is what glows yellow. So they look blue." },
  { q: "More oxygen in the air means fire is…", a: ["Weaker", "Stronger"], c: 1, why: "Fire eats oxygen. Moon bases may use extra oxygen, so fire safety matters even more." },
  { q: "How does AI help astronauts stay safe?", a: ["It reads thousands of fire tests fast", "It sprays water"], c: 0, why: "AI reads NASA experiment data and warns which materials and air mixes are risky." },
  { q: "Can space fires keep burning when you can't see them?", a: ["No way", "Yes — 'cool flames'!"], c: 1, why: "NASA's FLEX experiment found invisible cool flames that keep burning after the bright flame goes out." },
];

export function Cadet() {
  const [space, setSpace] = useState(true);
  const [oxy, setOxy] = useState(21);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [stars, setStars] = useState(0);
  const done = i >= QUIZ.length;
  const size = 60 + (oxy - 15) * 7;
  const msg = oxy > 30 ? "Whoa! Too much oxygen — the fire is HUGE! 🚨" : oxy > 23 ? "Careful, Cadet! The fire is growing." : "Nice! The fire stays small and safe.";

  return (
    <div className="space-y-6">
      <div className="grid items-center gap-6 rounded-3xl border bg-card p-6 md:grid-cols-[1fr_1.2fr]">
        <FireTruck className="bob w-full max-w-sm" />
        <div>
          <h3 className="text-2xl font-bold">Hi Cadet! I'm Sparky, the Space Fire Truck 🚒</h3>
          <p className="mt-2 text-muted-foreground">On Earth I chase fires down the street. In space, fires float and act very strange! Help me learn their secrets and earn your Space Firefighter badge.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6">
          <h3 className="text-xl font-bold">🔥 Flame Lab: Earth or Space?</h3>
          <div className="my-4 flex rounded-full border p-1">
            <button onClick={() => setSpace(false)} className={`flex-1 rounded-full py-2 font-bold ${!space ? "bg-primary text-primary-foreground" : ""}`}>🌍 Earth</button>
            <button onClick={() => setSpace(true)} className={`flex-1 rounded-full py-2 font-bold ${space ? "bg-accent text-accent-foreground" : ""}`}>🚀 Space</button>
          </div>
          <div className="flex h-40 items-center justify-center rounded-2xl bg-background"><Flame round={space} size={120} /></div>
          <p className="mt-3 text-sm">{space ? "In space there's no 'up', so hot air doesn't rise. The flame becomes a blue ball!" : "On Earth hot air rises, pulling the flame into a tall yellow teardrop."}</p>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <h3 className="text-xl font-bold">🎚️ Oxygen Challenge</h3>
          <p className="text-sm text-muted-foreground">Slide the oxygen. Keep the Moon base fire small!</p>
          <div className="my-4 flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-background"><Flame round size={Math.min(size, 150)} /></div>
          <input type="range" min={15} max={40} value={oxy} onChange={(e) => setOxy(+e.target.value)} className="w-full" />
          <div className="flex justify-between text-sm"><span>Oxygen: <b>{oxy}%</b></span><span className="font-bold">{msg}</span></div>
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-6">
        <div className="flex items-center justify-between"><h3 className="text-xl font-bold">🧠 Space Fire Quiz</h3><span className="text-lg">{"⭐".repeat(stars)}<span className="opacity-30">{"⭐".repeat(QUIZ.length - stars)}</span></span></div>
        {!done ? (
          <div className="mt-4">
            <p className="text-lg font-bold">{i + 1}. {QUIZ[i].q}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {QUIZ[i].a.map((a, k) => {
                const st = pick === null ? "hover:bg-secondary" : k === QUIZ[i].c ? "border-safe bg-safe/20" : k === pick ? "border-destructive bg-destructive/20" : "opacity-50";
                return <button key={k} disabled={pick !== null} onClick={() => { setPick(k); if (k === QUIZ[i].c) setStars((s) => s + 1); }} className={`rounded-2xl border-2 p-4 text-left font-bold transition ${st}`}>{a}</button>;
              })}
            </div>
            {pick !== null && (
              <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl bg-secondary p-4">
                <span className="text-2xl">🚒</span><p className="flex-1 text-sm"><b>{pick === QUIZ[i].c ? "Great job!" : "Good try!"}</b> {QUIZ[i].why}</p>
                <button onClick={() => { setI(i + 1); setPick(null); }} className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground">Next →</button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-flame text-5xl shadow-lg">🏅</div>
            <p className="mt-4 text-2xl font-bold">You earned {stars}/{QUIZ.length} stars!</p>
            <p className="text-muted-foreground">{stars >= 4 ? "Official Astro Spark Space Firefighter!" : "Junior Space Firefighter — try again for the gold badge!"}</p>
            <button onClick={() => { setI(0); setStars(0); setPick(null); }} className="mt-4 rounded-full border px-5 py-2 font-bold">Play again</button>
          </div>
        )}
      </div>
    </div>
  );
}
