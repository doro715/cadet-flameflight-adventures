import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { FireTruck, Flame } from "@/components/astro/Cadet";
import { ROWS } from "@/lib/model";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Astro Spark Mission — A Space Fire Story" },
      { name: "description", content: "An interactive story: help Sparky the Space Fire Truck learn how fire behaves in space and protect a Moon base." },
      { property: "og:title", content: "Astro Spark Mission — A Space Fire Story" },
      { property: "og:description", content: "Tap, drag and explore to unlock each chapter of a space fire safety story." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Mission,
});

function Typer({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); const t = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(t), v) : v + 1)), 18); return () => clearInterval(t); }, [text]);
  return <p className="min-h-[4.5rem] text-lg leading-relaxed md:text-xl">{text.slice(0, n)}<span className="opacity-50">{n < text.length ? "▍" : ""}</span></p>;
}

function Chapter({ n, title, story, task, done, children }: { n: number; title: string; story: string; task: string; done: boolean; children: ReactNode }) {
  return (
    <div key={n} className="rise grid items-center gap-8 md:grid-cols-2">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">Chapter {n}</p>
        <h1 className="mt-2 text-3xl font-bold md:text-5xl">{title}</h1>
        <div className="mt-4"><Typer text={story} /></div>
        <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${done ? "border-safe text-safe" : "border-primary text-primary"}`}>{done ? "✓ Unlocked" : `👉 ${task}`}</div>
      </div>
      <div className="flex min-h-[340px] items-center justify-center rounded-3xl border bg-card p-6">{children}</div>
    </div>
  );
}

const EXP = [["CFI-G", "cool flames, gases"], ["BASS-II", "solids, flammability limits"], ["FLEX", "droplets, cool flames"], ["SoFIE", "materials ignition"], ["ACME", "gas diffusion flames"]];

function Mission() {
  const [step, setStep] = useState(0);
  const [truck, setTruck] = useState(false);
  const [space, setSpace] = useState(false);
  const [oxy, setOxy] = useState(21);
  const [maxOxy, setMaxOxy] = useState(21);
  const [scan, setScan] = useState(0);
  const [hits, setHits] = useState(0);
  const [sprays, setSprays] = useState<number[]>([]);
  useEffect(() => { if (scan > 0 && scan <= EXP.length) { const t = setTimeout(() => setScan(scan + 1), 450); return () => clearTimeout(t); } }, [scan]);

  const ignRate30 = (() => { const r = ROWS.filter((x) => x.o2 >= 0.3); return Math.round((r.filter((x) => x.ign).length / r.length) * 100); })();
  const unlocked = [truck, space, maxOxy > 30, scan > EXP.length, hits >= 5, true][step]!;
  const total = 6;

  const chapters = [
    <Chapter n={1} title="A question at bedtime" done={truck} task="Tap the fire truck to start the engine"
      story="My son loves fire trucks. One night he asked me: 'Who puts out fires on the Moon?' I didn't know. So we built one. Meet Sparky.">
      <button onClick={() => setTruck(true)} className="w-full" aria-label="Start Sparky">
        <FireTruck className={`mx-auto w-full max-w-sm ${truck ? "drive-in bob" : "opacity-60 grayscale"}`} />
        <p className="mt-2 text-center text-sm text-muted-foreground">{truck ? "Vroom! Sparky is ready for space 🚀" : "Zzz… tap me"}</p>
      </button>
    </Chapter>,
    <Chapter n={2} title="Fire forgets which way is up" done={space} task="Switch gravity off"
      story="On Earth, hot air rises and pulls a flame into a tall teardrop. In orbit there is no 'up'. What happens to the flame?">
      <div className="text-center">
        <div className="flex h-48 items-center justify-center"><Flame round={space} size={170} /></div>
        <button onClick={() => setSpace(!space)} className={`mt-4 rounded-full px-6 py-3 font-bold ${space ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>Gravity: {space ? "OFF 🛰️" : "ON 🌍"}</button>
        {space && <p className="rise mt-3 text-sm">A round, blue, slow flame — fed only by oxygen drifting in.</p>}
      </div>
    </Chapter>,
    <Chapter n={3} title="The Moon base breathes richer air" done={maxOxy > 30} task="Drag oxygen above 30%"
      story="Future Moon habitats may run at lower pressure with more than 30% oxygen to make spacewalks easier. But fire loves oxygen.">
      <div className="w-full text-center">
        <div className="flex h-52 items-center justify-center overflow-hidden"><Flame round size={Math.min(60 + (oxy - 15) * 7, 200)} /></div>
        <input type="range" min={15} max={40} value={oxy} onChange={(e) => { setOxy(+e.target.value); setMaxOxy((m) => Math.max(m, +e.target.value)); }} className="w-full" />
        <p className="mt-2 font-display text-2xl font-bold">{oxy}% O₂ {oxy > 30 && <span className="text-destructive">· Danger zone</span>}</p>
      </div>
    </Chapter>,
    <Chapter n={4} title="Too much data for one human" done={scan > EXP.length} task="Ask the AI to scan NASA's PSI database"
      story="NASA has flown hundreds of fire experiments. Finding the right one is hard. Astro Spark reads them, ranks them and learns from them.">
      <div className="w-full">
        {scan === 0 ? <button onClick={() => setScan(1)} className="mx-auto block rounded-full bg-flame px-8 py-4 text-lg font-bold text-primary-foreground">🔎 Scan PSI</button> : (
          <div className="space-y-2">
            {EXP.slice(0, scan).map(([id, d], i) => <div key={id} className="rise flex items-center gap-3 rounded-xl border bg-background/50 p-3"><span className="font-display font-bold text-muted-foreground">#{i + 1}</span><b>{id}</b><span className="text-sm text-muted-foreground">{d}</span></div>)}
            {scan > EXP.length && <p className="rise rounded-xl bg-secondary p-3 text-sm">In {ROWS.length} real CFI-G tests, <b>{ignRate30}%</b> at 30%+ oxygen caught fire.</p>}
          </div>
        )}
      </div>
    </Chapter>,
    <Chapter n={5} title="Fire in Module B!" done={hits >= 5} task="Tap the fire to spray water mist"
      story="An alarm rings on the Moon base. Sparky rolls in. In space, a gentle fine water mist works best. Help Sparky put it out!">
      <div className="relative flex w-full items-center justify-between">
        <FireTruck className="w-40 bob" />
        {sprays.map((s) => <span key={s} className="spray pointer-events-none absolute left-36 top-1/2 h-6 w-6 rounded-full bg-accent/60" />)}
        <button aria-label="Spray the fire" onClick={() => { setHits((h) => h + 1); setSprays((s) => [...s.slice(-4), Date.now()]); }} disabled={hits >= 5}>
          {hits < 5 ? <Flame round size={160 - hits * 25} /> : <span className="text-6xl">💨</span>}
        </button>
        <div className="absolute -bottom-6 left-0 right-0 h-2 overflow-hidden rounded bg-muted"><div className="h-full bg-accent transition-all" style={{ width: `${hits * 20}%` }} /></div>
      </div>
    </Chapter>,
    <Chapter n={6} title="Welcome, Space Firefighter" done task=""
      story="The crew is safe. Today, data and AI help engineers choose safer materials and air. Tomorrow, maybe you'll be the one keeping astronauts safe.">
      <div className="text-center">
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-flame text-6xl">🏅</div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground">Open the dashboard</Link>
          <button onClick={() => { setStep(0); setTruck(false); setSpace(false); setOxy(21); setMaxOxy(21); setScan(0); setHits(0); }} className="rounded-full border px-5 py-2 font-bold">Replay</button>
        </div>
      </div>
    </Chapter>,
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-4 px-5 py-4">
        <Link to="/" className="font-display text-xl font-bold">Astro<span className="text-flame">Spark</span></Link>
        <div className="mx-auto flex gap-2">{Array.from({ length: total }, (_, i) => <span key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/60" : "w-2 bg-muted"}`} />)}</div>
        <Link to="/" className="text-sm text-muted-foreground">Skip ›</Link>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-8">{chapters[step]}</main>
      <footer className="flex justify-between px-5 pb-8">
        <button onClick={() => setStep(step - 1)} disabled={step === 0} className="rounded-full border px-5 py-2 font-bold disabled:opacity-30">‹ Back</button>
        {step < total - 1 && <button onClick={() => setStep(step + 1)} disabled={!unlocked} className="rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground transition disabled:opacity-30">Next chapter ›</button>}
      </footer>
    </div>
  );
}
