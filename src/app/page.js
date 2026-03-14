import Link from "next/link";

const featureCards = [
  {
    title: "Analyze Food",
    description: "Turn a meal photo into a nutrition estimate, ingredient guess list, and practical risk coaching.",
    href: "/analyze-food",
    signal: "Vision-assisted read",
    index: "01",
  },
  {
    title: "Compare Meals",
    description: "Stress test two meal options and surface the stronger choice, tradeoffs, and why it wins.",
    href: "/compare-meals",
    signal: "Decision engine",
    index: "02",
  },
  {
    title: "Daily Monitoring",
    description: "Roll a full day into one timeline summary with pattern detection and next-step interventions.",
    href: "/daily-nutrition",
    signal: "Behavior timeline",
    index: "03",
  },
];

const highlights = [
  "Bold enough for a pitch demo, structured enough for product integration.",
  "Each workflow returns deterministic JSON that can feed a richer nutrition graph later.",
  "The new interface behaves more like a responsive dashboard than a static form stack.",
  "Motion is intentional: route changes, clicks, panels, and controls now speak the same design language.",
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="glass-panel spotlight-card overflow-hidden px-6 py-8 sm:px-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="status-chip">Bio-Intelligence Nutrition Copilot</span>
              <span className="story-kicker">Editorial shell. Live AI workflows. Preventive health framing.</span>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl leading-[0.92] sm:text-6xl lg:text-[5.4rem]">
                NutriLens turns meal choices into a <span className="text-ink/60">visible decision system</span>, not
                just another food form.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/72">
                Upload an image, compare two plates, or track an entire day. The frontend now leans into a more
                obvious theme: optimistic lab energy, signal-rich cards, and motion that makes each module feel alive.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/analyze-food" className="primary-button" data-click-fx>
                Launch food scanner
              </Link>
              <Link href="/compare-meals" className="secondary-button" data-click-fx>
                Open meal match-up
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="metric-card">
                <p className="story-kicker">Mode</p>
                <p className="mt-2 text-3xl font-semibold text-ink">3</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">Dedicated workflows for vision, comparisons, and day-level review.</p>
              </div>
              <div className="metric-card">
                <p className="story-kicker">Output</p>
                <p className="mt-2 text-3xl font-semibold text-ink">JSON</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">Predictable payloads keep the demo sharp and product-ready.</p>
              </div>
              <div className="metric-card">
                <p className="story-kicker">Theme</p>
                <p className="mt-2 text-3xl font-semibold text-ink">Visible</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">Stronger contrast, motion, gradients, and interaction feedback.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel glass-panel-dark module-orbit rounded-[34px] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="story-kicker text-white/42">Live system frame</p>
                <h2 className="mt-3 text-4xl text-white">Today&apos;s decision board</h2>
              </div>
              <span className="status-chip border-white/10 bg-white/10 text-mint">Prototype</span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                <p className="story-kicker text-white/42">Primary risk flag</p>
                <p className="mt-3 text-3xl font-semibold text-white">Late sodium spike with low produce intake</p>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  The day is still recoverable. Add fruit before 3 PM, choose a lighter dinner base, and hydrate ahead
                  of the evening meal.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                  <p className="story-kicker text-white/42">Daily score</p>
                  <p className="mt-3 text-5xl font-semibold text-white">82</p>
                  <p className="text-sm text-white/55">Out of 100, with room to improve fiber timing.</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-mint/18 to-ocean/12 p-5">
                  <p className="story-kicker text-white/42">Next intervention</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Choose the salmon grain bowl</p>
                  <div className="mt-4 editorial-rule bg-white/10" />
                  <p className="mt-4 text-sm leading-7 text-white/68">Higher protein density, lower sodium load, and better satiety.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Protein", "128g"],
                  ["Fiber", "24g"],
                  ["Hydration", "On track"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-center">
                    <p className="story-kicker text-white/38">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {featureCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="glass-panel spotlight-card group flex min-h-[21rem] flex-col justify-between px-6 py-6"
            data-click-fx
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="status-chip">{card.signal}</span>
                <span className="text-4xl font-semibold text-ink/16 transition duration-300 group-hover:text-ink/28">
                  {card.index}
                </span>
              </div>
              <div>
                <h2 className="max-w-sm text-4xl leading-none">{card.title}</h2>
                <p className="mt-4 max-w-sm text-base leading-7 text-ink/72">{card.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/48 transition group-hover:text-ink/80">
                Open workflow
              </span>
              <span className="rounded-full border border-ink/10 bg-white/55 px-3 py-1 text-sm text-ink/70 transition group-hover:bg-ink group-hover:text-white">
                Enter
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="glass-panel px-6 py-6 sm:px-8">
          <p className="story-kicker">Design intent</p>
          <h2 className="mt-4 text-4xl leading-tight">The UI should feel like a nutrition signal room, not a generic startup landing page.</h2>
          <p className="mt-5 text-base leading-8 text-ink/72">
            The stronger palette, active route states, background grid, click ripples, and route transitions all push
            the app toward a clearer identity. It now looks more deliberate before a user even reaches the model output.
          </p>
          <div className="mt-6 editorial-rule" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="story-kicker">Interaction</p>
              <p className="mt-2 text-xl font-semibold text-ink">Click ripples and active modules</p>
            </div>
            <div className="metric-card">
              <p className="story-kicker">Motion</p>
              <p className="mt-2 text-xl font-semibold text-ink">Animated route entry and hover lift</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item} className="glass-panel px-5 py-5">
              <p className="text-lg leading-7 text-ink/82">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
