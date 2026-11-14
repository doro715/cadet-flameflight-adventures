import { useReducer, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { initialRescue, rescueReducer } from "@/lib/cadet-rescue";
import { ROWS, stats } from "@/lib/model";

const data = stats(ROWS);

export function CadetRescue({ truck, onExpert }: { truck: ReactNode; onExpert: () => void }) {
  const [state, dispatch] = useReducer(rescueReducer, initialRescue);
  const [sound, setSound] = useState(true);
  const [effect, setEffect] = useState(0);
  const audio = useRef<AudioContext | null>(null);
  const { act, scanned, oxygen, outcome } = state;
  const saved = outcome === "saved";
  const feedback = outcome === "bucket" ? "Whoops! Big water drops float. A bucket cannot aim water like it does on Earth. Try another tool!" : outcome === "fans" ? "More wind carries fresh oxygen to our ghost. It grows! Try another tool." : saved ? "You did it! Tiny water droplets cool the fire. The crew is safe!" : "Quick, Cadet! Which tool can help when water floats?";

  function chime(success: boolean) {
    if (!sound) return;
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      void context.resume();
      [0, 1, 2].forEach((n) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + n * 0.12;
        oscillator.type = "sine";
        oscillator.frequency.value = success ? [440, 554, 659][n] ?? 440 : 160 - n * 30;
        gain.gain.setValueAtTime(0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.16);
      });
    } catch { /* Sound is optional on browsers without audio support. */ }
  }

  return (
    <section aria-label="Cadet rescue mission" className="cadet-cursor space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div><p className="text-sm font-bold uppercase text-accent">Cadet rescue · Space Station Alpha</p><h2 className="mt-1 text-2xl font-bold md:text-3xl">🚒 How to fight a Ghost Flame!</h2></div>
        <Button variant="outline" size="icon" aria-label={sound ? "Mute sounds" : "Enable sounds"} title={sound ? "Mute sounds" : "Enable sounds"} onClick={() => setSound(!sound)}>{sound ? "🔊" : "🔇"}</Button>
      </div>
      <ol className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
        {["Meet Sparky", "Scan the lab", "Save the crew"].map((label, n) => <li key={label} aria-current={act === n + 1 ? "step" : undefined} className={`border-b-4 py-3 ${act === n + 1 ? "border-accent text-accent" : act > n + 1 ? "border-safe text-safe" : "border-muted text-muted-foreground"}`}>{n + 1}. {label}</li>)}
      </ol>
      <div className="grid items-center gap-8 py-4 lg:grid-cols-2">
        <div key={`story-${act}`} className="rise space-y-5">
          <p className="text-sm font-bold text-accent">ACT {act} / 3</p>
          <h3 className="text-3xl font-bold">{act === 1 ? "Sparky needs a co-pilot." : act === 2 ? "Find the flame’s food." : saved ? "Welcome, Space Firefighter!" : "Choose your space tool."}</h3>
          <p className="text-lg leading-relaxed">{act === 1 ? "Cadet, welcome aboard! A Ghost Flame is hiding in the Destiny Lab. Help Sparky investigate and protect our crew." : act === 2 ? scanned ? "Our pretend sensor reads 30% oxygen. Oxygen is the flame’s food! Earth’s air has about 21%. Less food can make a flame weaker." : "Something is glowing inside the lab. Sparky’s radar spotted a signal…" : feedback}</p>
          {act === 1 && <Button size="lg" className="h-auto min-h-14 whitespace-normal text-lg font-bold" onClick={() => { dispatch("start"); chime(true); }}>🚀 Let’s rescue the crew!</Button>}
          {act === 2 && scanned && <div className="space-y-4">
            <label htmlFor="cadet-oxygen" className="block text-lg font-bold">🌬️ Flame food: {oxygen}% oxygen</label>
            <input id="cadet-oxygen" aria-label="Lower the oxygen" type="range" min="21" max="30" step="1" value={oxygen} onChange={(e) => dispatch({ oxygen: Number(e.target.value) })} className="h-10 w-full" />
            <div className="flex justify-between text-sm text-muted-foreground"><span>21% · Earth air</span><span>30% · Extra food</span></div>
            <p className="text-sm text-muted-foreground">In our pretend lab, Mission Control lowers the oxygen. Real crews follow trained emergency procedures.</p>
            <Button size="lg" disabled={oxygen !== 21} className="h-auto min-h-14 whitespace-normal font-bold" onClick={() => dispatch("fight")}>🧯 {oxygen === 21 ? "Ready! Choose a firefighting tool" : "Lower oxygen to 21%"}</Button>
          </div>}
          {act === 3 && !saved && <div className="grid gap-3">
            {[{ action: "bucket" as const, label: "💦 Throw a Bucket of Water" }, { action: "fans" as const, label: "💨 Turn on the Fans" }, { action: "mist" as const, label: "💧 Spray Magic Water Mist" }].map(({ action, label }) => <Button key={action} variant={action === "mist" ? "default" : "outline"} className="h-auto min-h-16 justify-start whitespace-normal px-5 text-left text-lg font-bold" onClick={() => { dispatch(action); setEffect((v) => v + 1); chime(action === "mist"); }}>{label}</Button>)}
          </div>}
          {saved && <div className="space-y-4">
            <p className="text-safe font-bold">🏅 Space Firefighter Badge earned</p>
            <p className="text-sm text-muted-foreground">NASA’s CFI-G dataset contains {data.n} tests. Its median burning time among ignited tests is {data.medianBurn} seconds. Our rescue is a story, not a prediction from those tests.</p>
            <Button onClick={onExpert} className="h-auto min-h-14 whitespace-normal font-bold">🔬 See the real NASA data</Button>
            <Button variant="outline" onClick={() => dispatch("reset")} className="ml-2 h-auto min-h-14 whitespace-normal">↻ Play again</Button>
          </div>}
        </div>
        <div className={`rescue-scene relative flex min-h-80 flex-col items-center justify-center overflow-hidden rounded-lg border-2 p-6 ${saved ? "border-safe bg-safe/10" : outcome === "fans" ? "border-destructive bg-destructive/10" : "border-accent/40 bg-card"}`}>
          <div className="absolute left-4 top-4 text-xs font-bold uppercase text-muted-foreground">{act === 1 ? "Sparky · Ready for launch" : "Destiny Lab · Simulation"}</div>
          {act === 1 ? <div className="bob w-full max-w-sm">{truck}</div> : act === 2 && !scanned ? <div className="relative flex h-60 w-60 items-center justify-center rounded-full border-2 border-accent/60 bg-accent/5">
            <div className="absolute inset-8 rounded-full border border-accent/40" /><div className="absolute inset-16 rounded-full border border-accent/40" />
            <Button aria-label="Scan Destiny Lab signal" className="relative z-10 h-16 w-16 rounded-full text-2xl" onClick={() => { dispatch("scan"); chime(true); }}>📡</Button>
            <p className="absolute bottom-5 text-sm font-bold text-accent">Destiny Lab signal</p>
          </div> : saved ? <div key={effect} className="rise flex h-60 flex-col items-center justify-center"><span className="text-8xl">🏅</span><p className="mt-4 text-xl font-bold text-safe">Crew safe!</p><div className="rescue-confetti absolute inset-0" aria-hidden="true">{Array.from({ length: 18 }, (_, n) => <i key={n} />)}</div></div> : <div key={`${outcome}-${effect}`} className={`relative flex h-60 w-full items-center justify-center ${outcome === "bucket" ? "rescue-wobble" : ""}`}>
            <svg viewBox="0 0 240 240" className={`h-60 w-60 overflow-visible transition-all ${oxygen > 25 || outcome === "fans" ? "text-destructive" : "text-accent"}`} role="img" aria-label="Round ghost flame">
              <g className="bob"><circle cx="120" cy="120" r={outcome === "fans" ? 95 : 45 + (oxygen - 21) * 4} fill="currentColor" opacity=".18" /><circle cx="120" cy="120" r={outcome === "fans" ? 70 : 32 + (oxygen - 21) * 3} fill="currentColor" opacity=".65" /><circle cx="109" cy="113" r="5" fill="var(--background)" /><circle cx="131" cy="113" r="5" fill="var(--background)" /><path d="M109 132 Q120 140 131 132" stroke="var(--background)" strokeWidth="4" fill="none" /></g>
            </svg>
            {outcome === "bucket" && <span className="rescue-bubble absolute text-5xl" aria-hidden="true">💧 🧑‍🚀</span>}
            {outcome === "fans" && <span className="absolute bottom-2 text-3xl" aria-hidden="true">💨 💨</span>}
          </div>}
          {saved && <div key={`mist-${effect}`} className="rescue-mist absolute inset-0" aria-hidden="true">{Array.from({ length: 12 }, (_, n) => <i key={n} />)}</div>}
          {act !== 1 && (scanned || act === 3) && <div className="mt-3 w-full max-w-xs"><div className="flex justify-between text-sm font-bold"><span>👻 Flame strength</span><span>{saved ? "Resting" : outcome === "fans" ? "Growing!" : oxygen > 25 ? "Strong" : "Weaker"}</span></div><progress aria-label="Pretend flame strength" max="100" value={saved ? 0 : outcome === "fans" ? 100 : 30 + (oxygen - 21) * 6} className="rescue-strength mt-2 h-3 w-full" /></div>}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">{act === 3 ? feedback : scanned ? `Oxygen ${oxygen} percent` : `Act ${act}`}</p>
      <p className="border-t pt-4 text-xs leading-relaxed text-muted-foreground">Story science: low-gravity flames can be round and faint; not every space flame is blue or invisible. Fans can carry oxygen to a flame. Fine water mist cools fires; it does not need magical sticking. Only trained crews handle real emergencies.</p>
      <p className="text-xs text-muted-foreground">Disclaimer: This is a hackathon prototype. The risk scores use a simplified heuristic model for demonstration, not a validated thermodynamic model.</p>
    </section>
  );
}