import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Expert } from "@/components/astro/Expert";
import { Cadet, FireTruck } from "@/components/astro/Cadet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Astro Spark — Space Fire Safety Dashboard" },
      { name: "description", content: "Rank NASA PSI combustion experiments, predict fire risk for Moon bases, and play Cadet mode with Sparky the Space Fire Truck." },
      { property: "og:title", content: "Astro Spark — Space Fire Safety Dashboard" },
      { property: "og:description", content: "Predict microgravity fire risk and learn why space flames are round." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mode, setMode] = useState<"expert" | "cadet">("expert");
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2"><span className="h-8 w-8 rounded-full bg-flame" /><span className="font-display text-xl font-bold">Astro<span className="text-flame">Spark</span></span></div>
          <div className="ml-auto flex rounded-full border p-1 text-sm">
            <button onClick={() => setMode("expert")} className={`rounded-full px-4 py-1.5 font-bold ${mode === "expert" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>🔬 Expert</button>
            <button onClick={() => setMode("cadet")} className={`rounded-full px-4 py-1.5 font-bold ${mode === "cadet" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>🚒 Cadet</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">NASA Space Apps · Space fire safety</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl">Fire burns <span className="text-flame">round</span> in space.<br />We help keep crews safe.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">Microgravity flames are spherical and diffusion-driven, and future Moon bases may run above 30% oxygen. Astro Spark summarizes and ranks NASA PSI combustion experiments (BASS, FLEX, ACME…) and turns your conditions into a fire-risk score.</p>
          <Link to="/mission" className="mt-6 inline-flex rounded-full bg-flame px-6 py-3 font-bold text-primary-foreground">▶ Start the story mission</Link>
          <Link to="/ops" className="ml-3 mt-6 inline-flex rounded-full border px-6 py-3 font-bold">🛰️ Ops console</Link>
        </div>
        <blockquote className="rounded-3xl border bg-card p-5">
          <FireTruck className="mb-2 w-40" />
          <p className="italic">"My son loves fire trucks. One day he asked: who puts out fires on the Moon? Astro Spark is my answer — for researchers today, and for the space firefighters of tomorrow."</p>
          <footer className="mt-2 text-sm text-muted-foreground">— Ziwei Luo, creator</footer>
        </blockquote>
      </section>

      <main className={`mx-auto max-w-7xl px-5 pb-16 ${mode === "cadet" ? "cadet-cursor" : ""}`}>{mode === "expert" ? <Expert /> : <Cadet />}</main>

      <footer className="border-t">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 text-sm text-muted-foreground md:grid-cols-2">
          <div><h3 className="mb-1 font-bold text-foreground">Data note</h3>Experiment ranges are summarized from NASA PSI investigation descriptions. Risk scores come from an illustrative model, not a validated flammability predictor — tests cluster near flammability limits.</div>
          <div><h3 className="mb-1 font-bold text-foreground">AI-usage declaration</h3>AI assistants were used to help write code, draft copy and structure the analysis. All data choices, the concept and the Cadet story are the team's own; outputs were reviewed by a human.</div>
        </div>
      </footer>
    </div>
  );
}
