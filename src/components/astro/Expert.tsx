import { useMemo, useState } from "react";
import { RealData } from "./RealData";
import { MATERIALS, riskScore, band, rankExperiments, insight, toCSV } from "@/lib/fire";

const toneCls = { safe: "text-safe", warn: "text-warn", danger: "text-destructive" };
const toneBg = { safe: "bg-safe", warn: "bg-warn", danger: "bg-destructive" };

function Slider({ label, value, min, max, step = 1, unit, onChange, hint }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (v: number) => void; hint?: string }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-display font-bold">{value}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-2 w-full" />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </label>
  );
}

function Gauge({ score }: { score: number }) {
  const b = band(score);
  const angle = -90 + (score / 100) * 180;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="16" strokeLinecap="round" />
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#g)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${(score / 100) * 251} 251`} />
        <defs><linearGradient id="g"><stop offset="0" stopColor="var(--safe)" /><stop offset=".5" stopColor="var(--warn)" /><stop offset="1" stopColor="var(--destructive)" /></linearGradient></defs>
        <line x1="100" y1="100" x2="100" y2="35" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 100px", transition: "transform .4s" }} />
        <circle cx="100" cy="100" r="6" fill="var(--foreground)" />
      </svg>
      <div className="-mt-2 font-display text-5xl font-bold">{score}</div>
      <div className={`text-sm font-bold uppercase tracking-widest ${toneCls[b.tone]}`}>{b.label} risk</div>
    </div>
  );
}

function Chart({ kPa, gravity, o2, matId }: { kPa: number; gravity: "micro" | "lunar"; o2: number; matId: string }) {
  const W = 520, H = 220, P = 32;
  const x = (v: number) => P + ((v - 15) / 25) * (W - 2 * P);
  const y = (v: number) => H - P - (v / 100) * (H - 2 * P);
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <rect x={x(30)} y={P} width={x(40) - x(30)} height={H - 2 * P} fill="var(--destructive)" opacity=".08" />
      <text x={x(30) + 4} y={P + 12} fontSize="10" fill="var(--muted-foreground)">Moon-base zone (&gt;30% O₂)</text>
      {[15, 20, 25, 30, 35, 40].map((t) => <g key={t}><line x1={x(t)} x2={x(t)} y1={H - P} y2={H - P + 4} stroke="var(--muted-foreground)" /><text x={x(t)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--muted-foreground)">{t}%</text></g>)}
      {[0, 50, 100].map((t) => <text key={t} x={4} y={y(t) + 3} fontSize="10" fill="var(--muted-foreground)">{t}</text>)}
      {MATERIALS.map((m, i) => {
        const pts = Array.from({ length: 26 }, (_, k) => `${x(15 + k)},${y(riskScore(15 + k, kPa, m, gravity))}`).join(" ");
        return <polyline key={m.id} points={pts} fill="none" stroke={colors[i]} strokeWidth={m.id === matId ? 3.5 : 1.5} opacity={m.id === matId ? 1 : 0.45} />;
      })}
      <line x1={x(o2)} x2={x(o2)} y1={P} y2={H - P} stroke="var(--foreground)" strokeDasharray="4 4" />
    </svg>
  );
}

export function OxygenGap() {
  return (
    <div className="rounded-2xl border border-warn/50 bg-warn/10 p-5">
      <h3 className="text-lg font-bold">Solid-material tests stop near 22% oxygen; Moon-base air starts at 30%</h3>
      <div className="relative mt-4 h-6 rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-l-full bg-safe/60" style={{ width: `${((22 - 15) / 25) * 100}%` }} />
        <div className="absolute inset-y-0 right-0 rounded-r-full bg-destructive/60" style={{ left: `${((30 - 15) / 25) * 100}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>15%</span><span>22% tested solids end</span><span>30% Moon base begins</span><span>40%</span></div>
      <p className="mt-2 text-sm text-muted-foreground">The 22–30% gap has no solid-material evidence in this app, so material risk there is extrapolated by the simplified model.</p>
    </div>
  );
}

export function Expert() {
  const [o2, setO2] = useState(34);
  const [kPa, setKPa] = useState(70);
  const [matId, setMatId] = useState("cotton");
  const [gravity, setGravity] = useState<"micro" | "lunar">("lunar");
  const [q, setQ] = useState("");
  const m = MATERIALS.find((x) => x.id === matId)!;
  const score = riskScore(o2, kPa, m, gravity);
  const ranked = useMemo(() => rankExperiments({ o2, kPa, gravity, material: m }, q), [o2, kPa, gravity, m, q]);
  const tips = insight(o2, kPa, m, score);

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCSV()], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "astro-spark-experiments.csv"; a.click(); URL.revokeObjectURL(url);
  };
  const preset = (o: number, p: number, g: "micro" | "lunar") => { setO2(o); setKPa(p); setGravity(g); };

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-5 rounded-2xl border bg-card p-5">
        <h3 className="text-lg font-bold">Environment</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {[["ISS air", 21, 101, "micro"], ["Artemis cabin", 26.5, 70.3, "micro"], ["Moon base", 34, 56.5, "lunar"]].map(([l, o, p, g]) => (
            <button key={l as string} onClick={() => preset(o as number, p as number, g as "micro" | "lunar")} className="rounded-full border px-3 py-1 hover:bg-secondary">{l}</button>
          ))}
        </div>
        <Slider label="Oxygen" value={o2} min={15} max={40} step={0.5} unit="%" onChange={setO2} />
        <Slider label="Pressure" value={kPa} min={30} max={101} unit=" kPa" onChange={setKPa} hint={`O₂ partial pressure ≈ ${((o2 / 100) * kPa).toFixed(1)} kPa`} />
        <div>
          <div className="mb-2 text-sm text-muted-foreground">Material</div>
          <div className="grid grid-cols-1 gap-1.5">
            {MATERIALS.map((x) => (
              <button key={x.id} onClick={() => setMatId(x.id)} className={`rounded-lg border px-3 py-2 text-left text-sm transition ${x.id === matId ? "border-primary bg-primary/15" : "hover:bg-secondary"}`}>{x.name}<span className="float-right text-xs text-muted-foreground">LOI {x.loi}%</span></button>
            ))}
          </div>
        </div>
        <div className="flex rounded-lg border p-1 text-sm">
          {(["micro", "lunar"] as const).map((g) => <button key={g} onClick={() => setGravity(g)} className={`flex-1 rounded-md py-1.5 ${gravity === g ? "bg-secondary font-bold" : "text-muted-foreground"}`}>{g === "micro" ? "Microgravity" : "Lunar 1/6 g"}</button>)}
        </div>
      </aside>

      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border bg-card p-5"><h3 className="mb-2 text-lg font-bold">Fire risk score</h3><Gauge score={score} /></div>
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 text-lg font-bold">Safety insights <span className="ml-2 rounded bg-accent/20 px-2 py-0.5 text-xs font-normal text-accent">rule-based</span></h3>
            <ul className="space-y-2 text-sm">
              {tips.map((t, i) => <li key={i} className="flex gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneBg[band(score).tone]}`} />{t}</li>)}
            </ul>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold">Risk vs. oxygen, all materials</h3>
            <div className="flex flex-wrap gap-3 text-xs">{MATERIALS.map((x, i) => <span key={x.id} className="flex items-center gap-1"><span className="h-2 w-3 rounded" style={{ background: `var(--chart-${i + 1})` }} />{x.name}</span>)}</div>
          </div>
          <Chart kPa={kPa} gravity={gravity} o2={o2} matId={matId} />
        </div>
        <OxygenGap />
        <RealData />
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="mr-auto text-lg font-bold">Ranked PSI experiments <span className="block text-xs font-normal text-muted-foreground">Ranked for {o2}% O₂ · {kPa} kPa · {gravity === "micro" ? "microgravity" : "lunar"} · {m.name}</span></h3>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: droplets, soot, materials…" className="w-64 rounded-lg border bg-background px-3 py-1.5 text-sm" />
            <button onClick={download} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">Download CSV</button>
          </div>
          <div className="space-y-2">
            {ranked.map(({ e, score: s, reason }, i) => (
              <details key={e.id} className="group rounded-xl border bg-background/40 p-3" open={i === 0}>
                <summary className="flex cursor-pointer items-center gap-3 list-none">
                  <span className="font-display text-xl font-bold text-muted-foreground">#{i + 1}</span>
                  <span className="font-bold">{e.id}</span><span className="hidden text-sm text-muted-foreground sm:inline">{e.name} · {e.years}</span>
                  <span className="ml-auto flex items-center gap-2 text-xs"><span className="h-1.5 w-20 overflow-hidden rounded bg-muted"><span className="block h-full bg-flame" style={{ width: `${s}%` }} /></span>{s}</span>
                </summary>
                <p className="mt-2 text-sm"><span className="font-bold text-flame">Top reason:</span> {reason}</p>
                <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">{e.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2 py-0.5">{t}</span>)}<span className="rounded-full bg-secondary px-2 py-0.5">{e.o2 ? `O₂ ${e.o2[0]}–${e.o2[1]}% (uploaded table)` : "O₂ range: not in uploaded tables"}</span></div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
