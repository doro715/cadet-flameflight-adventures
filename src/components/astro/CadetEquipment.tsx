import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { GAUGES, MISSIONS, SLOTS, CARD_KEY, missionCheck, option, type CadetCard, type Kit, type MissionId } from "@/lib/cadet-kit";
import { StoryWorkshop } from "./StoryWorkshop";

export function CadetEquipment({ truck, onExpert }: { truck: ReactNode; onExpert: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mission, setMission] = useState<MissionId>("moon");
  const [kit, setKit] = useState<Kit>({});
  const [name, setName] = useState("");
  const [card, setCard] = useState<CadetCard | null>(null);
  useEffect(() => { try { const c = localStorage.getItem(CARD_KEY); if (c) setCard(JSON.parse(c)); } catch { /* ignore */ } }, []);
  const m = MISSIONS.find((x) => x.id === mission)!;
  const check = missionCheck(mission, kit);
  const max = 6;
  const save = () => {
    const c: CadetCard = { name: name.trim() || "Cadet", mission, kit, gauges: check.gauges, date: new Date().toLocaleDateString() };
    localStorage.setItem(CARD_KEY, JSON.stringify(c)); setCard(c);
  };

  return <section className="space-y-6" aria-label="Mission kit builder">
    <div className="border-b pb-5"><p className="text-sm font-bold uppercase text-accent">Sparky’s equipment lab</p><h2 className="mt-2 text-3xl font-bold">🎒 Mission Kit Builder</h2>
      <ol className="mt-3 flex flex-wrap gap-2 text-sm">{["Choose a mission", "Pack 5 slots", "Mission check"].map((l, i) => <li key={l}><Button variant={step === i + 1 ? "default" : "outline"} size="sm" onClick={() => (i === 0 || i === 1 || check.complete) && setStep((i + 1) as 1 | 2 | 3)}>{i + 1}. {l}</Button></li>)}</ol></div>

    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {step === 1 && <div className="grid gap-3 sm:grid-cols-3">{MISSIONS.map((x) => <Button key={x.id} variant="outline" aria-pressed={mission === x.id} onClick={() => setMission(x.id)} className={`h-auto flex-col items-start whitespace-normal p-4 text-left ${mission === x.id ? "border-accent bg-accent/10" : ""}`}><span className="text-4xl">{x.icon}</span><span className="text-lg font-bold">{x.name}</span><span className="text-sm text-muted-foreground">{x.air}</span><span className="text-xs">{x.why}</span></Button>)}
          <Button className="sm:col-span-3 min-h-12 text-lg font-bold" onClick={() => setStep(2)}>Pack my kit →</Button></div>}

        {step === 2 && <div className="space-y-5">{SLOTS.map((s) => <fieldset key={s.id}><legend className="mb-2 font-bold">{s.label}</legend><div className="grid gap-2 sm:grid-cols-3">{s.options.map((o) => <Button key={o.id} variant="outline" aria-pressed={kit[s.id] === o.id} onClick={() => setKit((k) => ({ ...k, [s.id]: o.id }))} className={`h-auto flex-col items-start whitespace-normal p-3 text-left ${kit[s.id] === o.id ? "border-accent bg-accent/10" : ""}`}><span className="font-bold">{o.icon} {o.name}</span><span className="text-xs font-normal text-muted-foreground">{o.fact}</span><span className="text-[11px] font-normal">{Object.entries(o.points).map(([k, v]) => `${v! > 0 ? "+" : ""}${v} ${k}`).join(" · ") || "no points"}</span></Button>)}</div></fieldset>)}
          <Button disabled={!check.complete} className="min-h-12 w-full text-lg font-bold" onClick={() => setStep(3)}>{check.complete ? "Run mission check →" : `Fill all 5 slots (${SLOTS.filter((s) => kit[s.id]).length}/5)`}</Button></div>}

        {step === 3 && <div className="space-y-4">
          <div role="status" className={`rounded-xl border-2 p-4 ${check.ready ? "border-safe bg-safe/10" : "border-warn bg-warn/10"}`}><p className="text-xl font-bold">{check.ready ? `✅ Kit ready for the ${m.name}!` : "⚠️ Not ready yet"}</p>
            {check.hints.map((h) => <p key={h} className="mt-1">💡 {h}</p>)}
            {!check.ready && <Button variant="outline" className="mt-3" onClick={() => setStep(2)}>← Change my kit</Button>}</div>
          {check.ready && <div className="flex flex-wrap items-end gap-3"><label className="text-sm font-bold">Cadet name<input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} className="mt-1 block rounded-lg border bg-background px-3 py-2" placeholder="Your name" /></label><Button className="min-h-11 font-bold" onClick={save}>🪪 Save my Cadet ID card</Button></div>}
          {card && <IdCard card={card} />}
        </div>}
      </div>

      <aside className="space-y-4 rounded-2xl border bg-card p-4" aria-label="Sparky preview">
        <p className="text-sm font-bold">{m.icon} Sparky for the {m.name}</p>
        <div className="relative">{truck}<div className="mt-1 flex flex-wrap justify-center gap-1 text-2xl">{SLOTS.map((s) => <span key={s.id} title={s.label} className={kit[s.id] ? "rise" : "opacity-20"}>{option(s.id, kit[s.id])?.icon ?? "⬜"}</span>)}</div></div>
        {GAUGES.map((g) => { const v = check.gauges[g.id], need = m.need[g.id]; return <div key={g.id}><div className="flex justify-between text-sm"><span>{g.icon} {g.label}</span><span className="font-bold">{v} / need {need}</span></div><div className="relative h-3 rounded-full bg-muted"><div className={`h-full rounded-full transition-all ${v >= need ? "bg-safe" : "bg-warn"}`} style={{ width: `${Math.min(100, (v / max) * 100)}%` }} /><div className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: `${(need / max) * 100}%` }} /></div></div>; })}
        <p className="text-xs text-muted-foreground">Game points, not a real safety rating.</p>
      </aside>
    </div>

    <StoryWorkshop truck={truck} kit={kit} mission={mission} onExpert={onExpert} />
    <p className="text-xs text-muted-foreground">This is a hackathon prototype. The risk scores use a simplified heuristic model for demonstration, not a validated thermodynamic model.</p>
  </section>;
}

function IdCard({ card }: { card: CadetCard }) {
  const m = MISSIONS.find((x) => x.id === card.mission)!;
  return <div className="max-w-md rounded-2xl border-2 border-accent bg-gradient-to-br from-card to-secondary p-5 shadow-lg">
    <div className="flex items-center justify-between"><p className="font-display text-sm font-bold uppercase tracking-widest text-accent">Astro Spark · Cadet ID</p><span className="text-3xl">{m.icon}</span></div>
    <p className="mt-2 font-display text-3xl font-bold">{card.name}</p><p className="text-sm text-muted-foreground">Mission: {m.name} · {card.date}</p>
    <p className="mt-3 text-2xl">{SLOTS.map((s) => option(s.id, card.kit[s.id])?.icon).join(" ")}</p>
    <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">{GAUGES.map((g) => <div key={g.id} className="rounded-lg bg-background/60 p-2"><div>{g.icon}</div><div className="font-bold">{card.gauges[g.id]}</div><div>{g.label}</div></div>)}</div>
  </div>;
}
