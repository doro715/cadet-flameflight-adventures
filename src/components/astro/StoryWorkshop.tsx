import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AVATARS, PLACES, PROBLEMS, CHOICES, makePage, makeStory, type Page, type ProblemId, type StoryInput } from "@/lib/cadet-story";
import { SLOTS, option, type Kit, type MissionId } from "@/lib/cadet-kit";
import { rewriteStory } from "@/lib/story-ai.functions";

const STEPS = ["Hero", "Place", "Problem", "Kit", "Choice 1", "Choice 2", "Choice 3"];

export function StoryWorkshop({ truck, kit, mission, onExpert }: { truck: ReactNode; kit: Kit; mission: MissionId; onExpert: () => void }) {
  const [step, setStep] = useState(0);
  const [hero, setHero] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]!);
  const [place, setPlace] = useState<MissionId>(mission);
  const [problem, setProblem] = useState<ProblemId>("wire");
  const [picks, setPicks] = useState<string[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [variants, setVariants] = useState([0, 0, 0, 0, 0]);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(false);
  const [ai, setAi] = useState<"idle" | "busy" | "done" | "fallback">("idle");
  const kitReady = SLOTS.every((s) => kit[s.id]);
  const input = (): StoryInput => ({ hero, avatar, place, problem, kit, picks: [picks[0] ?? "", picks[1] ?? "", picks[2] ?? ""] });
  const canNext = step === 3 ? kitReady : step >= 4 ? !!picks[step - 4] : true;

  const generate = () => { setPages(makeStory(input())); setVariants([0, 0, 0, 0, 0]); setPage(0); setAi("idle"); };
  const regen = (i: number) => { const v = variants[i]! + 1; setVariants((vs) => vs.map((x, j) => (j === i ? v : x))); setPages((ps) => ps.map((p, j) => (j === i ? makePage(input(), i, v) : p))); };
  const speak = (text: string) => { if (!("speechSynthesis" in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.9; speechSynthesis.speak(u); };
  const rewrite = async () => {
    setAi("busy");
    const out = await rewriteStory({ data: { hero: hero.trim() || "Cadet", pages: pages.map((p) => ({ text: p.text, fact: p.fact })) } }).catch(() => null);
    if (out) { setPages((ps) => ps.map((p, i) => ({ ...p, text: out[i] ?? p.text }))); setAi("done"); } else { setPages(makeStory(input())); setAi("fallback"); }
  };
  const print = () => {
    const w = window.open("", "_blank"); if (!w) return;
    const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
    w.document.write(`<html><head><title>${esc(hero || "Cadet")}'s Sparky story</title><style>body{font-family:sans-serif;max-width:640px;margin:auto}section{page-break-after:always;padding:24px 0}.i{font-size:64px}.f{border:2px solid #888;border-radius:8px;padding:8px;font-size:14px}</style></head><body>${pages.map((p, i) => `<section><div class="i">${p.icon}</div><h2>${i + 1}. ${esc(p.title)}</h2><p style="font-size:20px">${esc(p.text)}</p><div class="f"><b>Fact box:</b> ${esc(p.fact)}<br><small>Source: ${esc(p.source)}</small></div></section>`).join("")}</body></html>`);
    w.document.close(); w.focus(); w.print();
  };
  const cur = pages[page];

  return <div className="space-y-5 border-t pt-6" aria-label="Story workshop">
    <h3 className="text-2xl font-bold">📖 Sparky Story Workshop</h3>
    <div className="flex flex-wrap gap-1 text-xs">{STEPS.map((s, i) => <span key={s} className={`rounded-full px-2 py-1 ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-secondary" : "border"}`}>{i + 1}. {s}</span>)}</div>

    {!pages.length && <div className="rounded-2xl border bg-card p-5">
      {step === 0 && <div className="space-y-3"><label className="block font-bold">Hero name<input value={hero} maxLength={20} onChange={(e) => setHero(e.target.value)} placeholder="e.g. Leo" className="mt-1 block rounded-lg border bg-background px-3 py-2" /></label><div className="flex flex-wrap gap-2">{AVATARS.map((a) => <Button key={a} variant="outline" aria-pressed={avatar === a} aria-label={`Avatar ${a}`} className={`h-14 w-14 text-3xl ${avatar === a ? "border-accent bg-accent/10" : ""}`} onClick={() => setAvatar(a)}>{a}</Button>)}</div></div>}
      {step === 1 && <div className="grid gap-2 sm:grid-cols-3">{PLACES.map((p) => <Button key={p.id} variant="outline" aria-pressed={place === p.id} className={`min-h-14 ${place === p.id ? "border-accent bg-accent/10" : ""}`} onClick={() => setPlace(p.id)}>{p.name}</Button>)}</div>}
      {step === 2 && <div className="grid gap-2 sm:grid-cols-3">{PROBLEMS.map((p) => <Button key={p.id} variant="outline" aria-pressed={problem === p.id} className={`h-auto flex-col whitespace-normal p-4 ${problem === p.id ? "border-accent bg-accent/10" : ""}`} onClick={() => setProblem(p.id)}><span className="text-4xl">{p.icon}</span><span className="font-bold">{p.title}</span></Button>)}</div>}
      {step === 3 && (kitReady ? <p className="text-2xl">Your kit: {SLOTS.map((s) => option(s.id, kit[s.id])?.icon).join(" ")} <span className="text-base text-muted-foreground">(from the Mission Kit Builder)</span></p> : <p className="font-bold text-warn">Pack all 5 kit slots in the Mission Kit Builder above first.</p>)}
      {step >= 4 && (() => { const ch = CHOICES[step - 4]!; const sel = ch.options.find((o) => o.id === picks[step - 4]); return <div className="space-y-3"><p className="text-lg font-bold">{ch.q}</p><div className="flex flex-wrap gap-2">{ch.options.map((o) => <Button key={o.id} variant="outline" aria-pressed={sel?.id === o.id} className={`min-h-12 ${sel?.id === o.id ? "border-accent bg-accent/10" : ""}`} onClick={() => setPicks((p) => { const n = [...p]; n[step - 4] = o.id; return n; })}>{o.label}</Button>)}</div>{sel && <p role="status" className={`rise border-l-4 pl-3 ${sel.good ? "border-safe" : "border-warn"}`}>Consequence: {avatar} {sel.text}.</p>}</div>; })()}
      <div className="mt-4 flex gap-2"><Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>← Back</Button>{step < 6 ? <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Next →</Button> : <Button disabled={!canNext} className="font-bold" onClick={generate}>✨ Make my 5-page story</Button>}</div>
    </div>}

    {cur && <div className="grid gap-6 rounded-2xl border bg-card p-5 md:grid-cols-[1fr_1.3fr]">
      <div className="relative flex min-h-56 items-center justify-center bg-accent/5"><div className="w-full max-w-xs">{truck}</div><span className="absolute left-4 top-4 text-5xl">{avatar}</span><span className="absolute right-4 top-4 text-5xl">{cur.icon}</span></div>
      <div className="space-y-3">
        <p className="text-sm font-bold text-accent">PAGE {page + 1} / 5 {ai === "done" && "· AI-rewritten from supplied facts"}</p>
        <h4 className="text-2xl font-bold">{cur.title}</h4>
        {editing ? <textarea aria-label="Edit page text" value={cur.text} maxLength={600} onChange={(e) => setPages((ps) => ps.map((p, i) => (i === page ? { ...p, text: e.target.value } : p)))} className="min-h-28 w-full rounded-lg border bg-background p-2 text-lg" /> : <p className="text-lg leading-relaxed">{cur.text}</p>}
        <div className="rounded-lg border-2 border-accent/50 p-3 text-sm"><b>🔎 Fact box:</b> {cur.fact}<div className="text-xs text-muted-foreground">Source: {cur.source}</div></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage((n) => n - 1)}>←</Button>
          <Button variant="outline" disabled={page === 4} onClick={() => setPage((n) => n + 1)}>→</Button>
          <Button variant="outline" onClick={() => setEditing((e) => !e)}>{editing ? "✅ Done" : "✏️ Edit"}</Button>
          <Button variant="outline" onClick={() => regen(page)}>🔄 New version</Button>
          <Button variant="outline" onClick={() => speak(`${cur.title}. ${cur.text}. Fact: ${cur.fact}`)}>🔊 Read aloud</Button>
        </div>
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <Button variant="outline" onClick={print}>🖨️ Print</Button>
          <Button variant="outline" disabled={ai === "busy"} onClick={rewrite}>{ai === "busy" ? "Rewriting…" : "🤖 AI rewrite (facts only)"}</Button>
          <Button variant="outline" onClick={() => { setPages([]); setStep(0); }}>Start over</Button>
          <Button variant="ghost" onClick={onExpert}>🔬 Expert Dashboard</Button>
        </div>
        {ai === "fallback" && <p role="status" className="text-sm text-warn">The AI rewrite wasn’t available, so we kept the template story.</p>}
        <p className="text-xs text-muted-foreground">Template story from your choices. The optional AI rewrite may only use the fact boxes shown.</p>
      </div>
    </div>}
  </div>;
}
