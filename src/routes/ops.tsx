import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MODULES, moduleRisk, level, context, action, forecast, mat, type Module } from "@/lib/station";
import { RealData } from "@/components/astro/RealData";
import { ROWS, train } from "@/lib/model";

export const Route = createFileRoute("/ops")({
  head: () => ({
    meta: [
      { title: "Astro Spark Ops — Role-based Fire Risk Console" },
      { name: "description", content: "Astronaut, Mission Control and Scientist views of spacecraft fire risk, grounded in NASA PSI data." },
      { property: "og:title", content: "Astro Spark Ops — Role-based Fire Risk Console" },
      { property: "og:description", content: "Switch roles to see the fire risk data each crew member needs to act." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ops,
});

type Role = "astro" | "mcc" | "sci";
const ROLES: { id: Role; icon: string; name: string; goal: string }[] = [
  { id: "astro", icon: "👨‍🚀", name: "Astronaut", goal: "Confirm safety · act fast" },
  { id: "mcc", icon: "🛰️", name: "Mission Control", goal: "Monitor all · allocate resources" },
  { id: "sci", icon: "🔬", name: "Scientist", goal: "Find root causes · optimize" },
];

/** Role-specific action recommendations (thresholds: >60 high, 30-60 moderate, <30 low). */
function roleAction(role: Role, s: number) {
  const band = s > 60 ? 0 : s >= 30 ? 1 : 2;
  const table: Record<Role, string[]> = {
    astro: [
      "🚨 EMERGENCY: Shut off ventilation immediately! Deploy Fine-Water-Mist. Seal the module hatch if fire persists.",
      "⚠️ STANDBY: Don your oxygen mask. Monitor O₂ levels. Prepare fire suppression tools.",
      "✅ SAFE: Atmosphere normal. Continue standard operations.",
    ],
    mcc: [
      "🚨 RED ALERT: Initiate emergency protocols. Isolate the module's power and air supply. Prepare crew evacuation routes.",
      "⚠️ MONITOR: Adjust HVAC (ventilation) flow. Cross-reference sensor data. Alert the crew.",
      "✅ NOMINAL: All telemetry within normal limits. No action required.",
    ],
    sci: [
      "🚨 ABORT: Stop all combustion experiments immediately. Extract and isolate sensitive samples. Download current telemetry.",
      "⚠️ CAUTION: Re-evaluate oxygen concentration (XO2). Ensure fire-retardant materials are secured.",
      "✅ OPTIMAL: Ideal conditions for microgravity combustion experiments. Proceed.",
    ],
  };
  return table[role][band]!;
}

function Badge({ s }: { s: number }) {
  const l = level(s);
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${l.cls}`}>{l.icon} {l.label}</span>;
}

function Spark({ data }: { data: number[] }) {
  const W = 300, H = 70;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / 100) * H}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <rect y={H - 0.65 * H} width={W} height={0.3 * H} fill="var(--warn)" opacity=".08" />
      <rect y={0} width={W} height={0.35 * H} fill="var(--destructive)" opacity=".08" />
      <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
    </svg>
  );
}

function StationMap({ mods, sel, onSel, big }: { mods: (Module & { s: number })[]; sel: string; onSel: (id: string) => void; big?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-full ${big ? "max-h-[460px]" : "max-h-[300px]"}`}>
      <line x1="2" y1="49" x2="80" y2="49" stroke="var(--muted-foreground)" strokeWidth="1.2" opacity=".4" />
      <line x1="47" y1="10" x2="47" y2="88" stroke="var(--muted-foreground)" strokeWidth="1.2" opacity=".4" />
      {[4, 90].map((x) => <rect key={x} x={x === 4 ? 1 : 0} y={x === 4 ? 30 : 88} width={x === 4 ? 8 : 0} height={38} fill="var(--accent)" opacity=".25" />)}
      {mods.map((m) => {
        const l = level(m.s);
        const color = l.k === "high" ? "var(--destructive)" : l.k === "mid" ? "var(--warn)" : "var(--safe)";
        return (
          <g key={m.id} onClick={() => onSel(m.id)} className="cursor-pointer" role="button" aria-label={`${m.name} ${m.s}`}>
            <rect x={m.x} y={m.y} width={m.w} height={m.h} rx="3" fill={color} opacity={0.18 + m.s / 160} stroke={sel === m.id ? "var(--foreground)" : color} strokeWidth={sel === m.id ? 1 : 0.4} />
            {l.k === "high" && <rect x={m.x} y={m.y} width={m.w} height={m.h} rx="3" fill="none" stroke={color} strokeWidth=".6" className="flicker" />}
            <text x={m.x + m.w / 2} y={m.y + m.h / 2 - 1} fontSize="3" textAnchor="middle" fill="var(--foreground)" fontWeight="700">{m.name}</text>
            <text x={m.x + m.w / 2} y={m.y + m.h / 2 + 4} fontSize="4.5" textAnchor="middle" fill="var(--foreground)" fontWeight="700">{m.s}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Ops() {
  const [role, setRole] = useState<Role>("mcc");
  const [tick, setTick] = useState(0);
  const [sel, setSel] = useState("destiny");
  const [log, setLog] = useState<string[]>([]);
  const [count, setCount] = useState(90);
  const [res, setRes] = useState({ mist: 82, co2: 64, o2: 71 });
  const model = useMemo(() => train(), []);

  useEffect(() => { const t = setInterval(() => { setTick((v) => v + 1); setCount((c) => (c > 0 ? c - 1 : 90)); }, 1000); return () => clearInterval(t); }, []);

  const mods = MODULES.map((m) => { const o2 = +(m.o2 + Math.sin((tick + m.x) / 6) * 0.6).toFixed(1); const mm = { ...m, o2 }; return { ...mm, s: moduleRisk(mm) }; }).sort((a, b) => b.s - a.s);
  const cur = mods.find((m) => m.id === sel)!;
  const top = mods[0]!;
  const ign = Math.round(model.predict({ type: "normal", fuel: "propane", o2: cur.o2 / 100, bar: cur.kPa / 101.3 }) * 100);
  const act = (msg: string, k?: keyof typeof res) => { setLog((l) => [`${new Date().toLocaleTimeString()} · ${msg}`, ...l].slice(0, 5)); if (k) setRes((r) => ({ ...r, [k]: Math.max(0, r[k] - 15) })); };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-background/85 px-5 py-3 backdrop-blur">
        <Link to="/" className="font-display text-xl font-bold">Astro<span className="text-flame">Spark</span> <span className="text-sm text-muted-foreground">Ops</span></Link>
        <div className="ml-auto flex rounded-full border p-1 text-sm" role="tablist" aria-label="Role selector">
          {ROLES.map((r) => <button key={r.id} role="tab" aria-selected={role === r.id} onClick={() => setRole(r.id)} className={`rounded-full px-3 py-1.5 font-bold ${role === r.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{r.icon} {r.name}</button>)}
        </div>
      </header>

      {/* 5-second KPI strip */}
      <div className="grid gap-3 px-5 pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`rounded-2xl p-4 ${level(top.s).cls}`}><div className="text-xs font-bold uppercase opacity-80">Highest risk module</div><div className="font-display text-2xl font-bold">{top.name} · {top.s}</div></div>
        <div className="rounded-2xl border bg-card p-4"><div className="text-xs uppercase text-muted-foreground">Modules at high risk</div><div className="font-display text-2xl font-bold">{mods.filter((m) => m.s >= 65).length} / {mods.length}</div></div>
        <div className="rounded-2xl border bg-card p-4"><div className="text-xs uppercase text-muted-foreground">Role</div><div className="font-display text-2xl font-bold">{ROLES.find((r) => r.id === role)!.icon} {ROLES.find((r) => r.id === role)!.name}</div><div className="text-xs text-muted-foreground">{ROLES.find((r) => r.id === role)!.goal}</div></div>
        <div className="rounded-2xl border bg-card p-4"><div className="text-xs uppercase text-muted-foreground">Data basis</div><div className="font-display text-2xl font-bold">{ROWS.length} PSI tests</div><div className="text-xs text-muted-foreground">CFI-G · simplified model</div></div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[260px_1fr_300px]">
        {/* LEFT */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-4">
            <h3 className="mb-3 font-bold">Risk ranking</h3>
            <ol className="space-y-1.5">
              {mods.map((m, i) => (
                <li key={m.id}><button onClick={() => setSel(m.id)} className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm ${sel === m.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-secondary"}`}>
                  <span className="w-4 text-muted-foreground">{i + 1}</span><span className="flex-1 truncate">{m.name}</span><span className={`font-display font-bold ${level(m.s).txt}`}>{level(m.s).icon} {m.s}</span>
                </button></li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <h3 className="mb-2 font-bold">Action advice</h3>
            {mods.filter((m) => m.s >= 35).map((m) => <p key={m.id} className="mb-2 text-sm"><b className={level(m.s).txt}>{m.name} {m.s}:</b> {action(m, m.s)}</p>)}
          </div>
        </aside>

        {/* CENTER */}
        <main className="space-y-5">
          {role === "astro" && (
            <>
              <div className={`rounded-3xl p-8 text-center ${level(cur.s).cls}`}>
                <div className="text-sm font-bold uppercase tracking-widest opacity-80">{cur.name}</div>
                <div className="font-display text-8xl font-bold">{cur.s}</div>
                <div className="text-2xl font-bold">{level(cur.s).icon} {level(cur.s).label}</div>
                <div className="mt-3 text-sm opacity-90">Safety re-check in <b className="font-display text-lg">{count}s</b></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <button onClick={() => act(`Fine water mist activated in ${cur.name}`, "mist")} className="rounded-2xl bg-accent p-5 text-lg font-bold text-accent-foreground">💧 Start suppression</button>
                <button onClick={() => act(`Ventilation isolated in ${cur.name}`)} className="rounded-2xl bg-warn p-5 text-lg font-bold text-primary-foreground">🌀 Isolate ventilation</button>
                <button onClick={() => act(`EVACUATE ${cur.name} → safe haven`)} className="rounded-2xl bg-destructive p-5 text-lg font-bold text-destructive-foreground">🚨 Evacuate</button>
              </div>
              <div className="rounded-2xl border bg-card p-4 text-sm"><b>Why:</b> {context(cur)} {action(cur, cur.s)}</div>
            </>
          )}
          {role === "mcc" && (
            <>
              <div className="rounded-2xl border bg-card p-4"><h3 className="mb-2 font-bold">Station risk heatmap <span className="text-xs font-normal text-muted-foreground">(click a module)</span></h3><StationMap mods={mods} sel={sel} onSel={setSel} big /></div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border bg-card p-4"><h3 className="font-bold">24h risk forecast · {cur.name}</h3><Spark data={forecast(cur)} /><div className="flex justify-between text-xs text-muted-foreground"><span>now</span><span>+12h</span><span>+24h</span></div></div>
                <div className="rounded-2xl border bg-card p-4"><h3 className="mb-3 font-bold">Resources</h3>
                  {([["mist", "💧 Water mist"], ["co2", "🧯 CO₂ extinguishers"], ["o2", "🫁 O₂ masks"]] as const).map(([k, l]) => <div key={k} className="mb-2 text-sm"><div className="flex justify-between"><span>{l}</span><b>{res[k]}%</b></div><div className="h-2 overflow-hidden rounded bg-muted"><div className={`h-full ${res[k] < 40 ? "bg-destructive" : "bg-safe"}`} style={{ width: `${res[k]}%` }} /></div></div>)}
                </div>
              </div>
            </>
          )}
          {role === "sci" && (
            <>
              <RealData />
              <div className="rounded-2xl border bg-card p-4">
                <h3 className="mb-2 font-bold">Analysis summary <span className="ml-1 rounded bg-accent/20 px-2 py-0.5 text-xs font-normal text-accent">computed from data</span></h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  <li>{ROWS.length} CFI-G tests span {Math.round(Math.min(...ROWS.map((r) => r.o2)) * 100)}–{Math.round(Math.max(...ROWS.map((r) => r.o2)) * 100)}% O₂ and 0.5–3.3 bar.</li>
                  <li>Ignition rate below 25% O₂: <b>{Math.round((ROWS.filter((r) => r.o2 < 0.25 && r.ign).length / ROWS.filter((r) => r.o2 < 0.25).length) * 100)}%</b>; at 30%+: <b>{Math.round((ROWS.filter((r) => r.o2 >= 0.3 && r.ign).length / ROWS.filter((r) => r.o2 >= 0.3).length) * 100)}%</b>.</li>
                  <li>Logistic model accuracy {Math.round(model.accuracy * 100)}% — barely above the always-ignites baseline; tests cluster near flammability limits, so treat as proof of concept.</li>
                  <li>Not in this dataset: flame temperature, solid materials. Next: join BASS-II and SoFIE data.</li>
                </ul>
              </div>
            </>
          )}
        </main>

        {/* RIGHT detail */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between"><h3 className="font-bold">{cur.name}</h3><Badge s={cur.s} /></div>
            <dl className="mt-3 space-y-2 text-sm">
              {[["Oxygen", `${cur.o2}%`], ["Pressure", `${cur.kPa} kPa`], ["Material", mat(cur.mat).name], ["Gravity", cur.gravity === "micro" ? "Microgravity" : "Lunar 1/6 g"], ["Risk score", `${cur.s}/100`], ["CFI-G ignition prob.", `${ign}%`]].map(([k, v]) => <div key={k} className="flex justify-between border-b pb-1"><dt className="text-muted-foreground">{k}</dt><dd className="font-bold">{v}</dd></div>)}
            </dl>
            <p className="mt-3 rounded-lg bg-secondary p-2 text-xs">{context(cur)}</p>
            <p className="mt-2 text-xs"><b>Action:</b> {action(cur, cur.s)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Sources: NASA PSI CFI-G (ignition), BASS-II material limits. Module values are simulated.</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <h3 className="mb-2 font-bold">Event log</h3>
            {log.length ? log.map((l, i) => <p key={i} className="text-xs">{l}</p>) : <p className="text-xs text-muted-foreground">No actions yet.</p>}
          </div>
        </aside>
      </div>
      <p className="px-5 pb-8 text-xs text-muted-foreground">Simplified model for proof of concept. Module conditions are simulated; risk scores are illustrative, not flight-certified.</p>
    </div>
  );
}
