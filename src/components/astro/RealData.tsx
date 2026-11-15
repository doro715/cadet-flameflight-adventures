import { useState } from "react";
import { ROWS, FUELS, stats, nearShare } from "@/lib/model";

export function RealData() {
  const [fuel, setFuel] = useState("all");
  const [type, setType] = useState<"all" | "normal" | "inverse">("all");
  const [o2, setO2] = useState(0.3);
  const [bar, setBar] = useState(1);
  const rows = ROWS.filter((r) => (fuel === "all" || r.fuel === fuel) && (type === "all" || r.type === type));
  const s = stats(rows);
  const near = nearShare(o2, bar, rows);

  const W = 520, H = 260, P = 34;
  const x = (v: number) => P + ((v - 0.1) / 0.8) * (W - 2 * P);
  const y = (v: number) => H - P - ((Math.log(v) - Math.log(0.45)) / (Math.log(3.5) - Math.log(0.45))) * (H - 2 * P);

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="mr-auto text-lg font-bold">Real NASA data: CFI-G cool-flame tests</h3>
        <a href="/cfi_g_clean.csv" download className="rounded-lg border px-3 py-1.5 text-sm hover:bg-secondary">Download clean CSV</a>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{ROWS.length} tests from NASA PSI (ethane, propane, butane; normal and inverse flames).</p>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {["all", ...FUELS].map((f) => <button key={f} onClick={() => setFuel(f)} className={`rounded-full border px-3 py-1 capitalize ${fuel === f ? "border-primary bg-primary/15" : ""}`}>{f}</button>)}
        <span className="mx-1 w-px bg-border" />
        {(["all", "normal", "inverse"] as const).map((t) => <button key={t} onClick={() => setType(t)} className={`rounded-full border px-3 py-1 capitalize ${type === t ? "border-accent bg-accent/15" : ""}`}>{t}</button>)}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {[0.2, 0.4, 0.6, 0.8].map((t) => <text key={t} x={x(t)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--muted-foreground)">{t * 100}% O₂</text>)}
            {[0.5, 1, 2, 3].map((t) => <text key={t} x={4} y={y(t) + 3} fontSize="10" fill="var(--muted-foreground)">{t} bar</text>)}
            <line x1={x(0.3)} x2={x(0.3)} y1={P} y2={H - P} stroke="var(--destructive)" strokeDasharray="3 3" opacity=".6" />
            {rows.map((r, i) => <circle key={i} cx={x(r.o2) + ((i % 5) - 2)} cy={y(r.bar) + ((i % 7) - 3)} r={r.ign ? 2 + Math.sqrt(r.burn) / 3 : 3} fill={r.ign ? "var(--primary)" : "none"} stroke={r.ign ? "none" : "var(--accent)"} opacity=".7" />)}
            <circle cx={x(o2)} cy={y(bar)} r="9" fill="none" stroke="var(--foreground)" strokeWidth="2" />
          </svg>
          <div className="flex gap-4 text-xs text-muted-foreground"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />Hot ignition (size = burn time)</span><span><span className="mr-1 inline-block h-2 w-2 rounded-full border border-accent" />No hot ignition</span><span>Dashed: 30% O₂</span></div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-center">
            {[["Tests", s.n], ["Ignited", `${Math.round(s.rate * 100)}%`], ["Median burn", `${s.medianBurn}s`], ["Longest", `${s.maxBurn}s`]].map(([l, v]) => <div key={l as string} className="rounded-xl bg-secondary p-2"><div className="font-display text-xl font-bold">{v}</div><div className="text-xs text-muted-foreground">{l}</div></div>)}
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-sm font-bold">Share of CFI-G gas-flame tests that ignited near these conditions</div>
            <label className="mt-2 block text-xs text-muted-foreground">O₂ {Math.round(o2 * 100)}%<input type="range" min={0.12} max={0.85} step={0.01} value={o2} onChange={(e) => setO2(+e.target.value)} className="w-full" /></label>
            <label className="block text-xs text-muted-foreground">Pressure {bar} bar<input type="range" min={0.5} max={3.3} step={0.1} value={bar} onChange={(e) => setBar(+e.target.value)} className="w-full" /></label>
            <div className="mt-2 font-display text-3xl font-bold text-flame">{near ? `${Math.round(near.share * 100)}%` : "—"}</div>
            <p className="text-xs text-muted-foreground">{near ? `${near.n} filtered tests within ±3 O₂ points and ±25% pressure.` : "No filtered tests near these conditions."} A count of past tests, not a prediction.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
