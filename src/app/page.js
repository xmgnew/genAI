import Link from "next/link";

const featureCards = [
  {
    title: "Analyze Food",
    description: "Turn a meal image into a concise nutrition monitoring update with practical next-step guidance.",
    href: "/analyze-food",
  },
  {
    title: "Compare Meals",
    description: "Compare two meal options through a preventive-health lens and surface the stronger choice.",
    href: "/compare-meals",
  },
  {
    title: "Daily Monitoring",
    description: "Monitor a full day of nutrition, detect the main risk pattern, and recommend the next best intervention.",
    href: "/daily-nutrition",
  },
];

const highlights = [
  "Agentic AI workflows that move from monitoring to action",
  "Preventive-health framing designed for concise daily decisions",
  "Structured JSON outputs that keep every module stable in a demo",
  "A polished interface built for fast healthcare hack judging",
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="glass-panel overflow-hidden px-6 py-8 sm:px-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-6">
            <span className="status-chip">Agentic AI Nutrition Copilot</span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl leading-none sm:text-6xl">
                NutriLens helps Canadians monitor nutrition, detect preventive health risks, and take the next best action.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/72">
                NutriLens is an agentic AI nutrition copilot that helps Canadians monitor daily nutrition, detect
                preventive health risks, and take the next best action toward better physical health.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/analyze-food" className="primary-button">
                Start monitoring
              </Link>
              <Link href="/compare-meals" className="secondary-button">
                Compare meals
              </Link>
            </div>
          </div>
          <div className="rounded-[30px] border border-ink/10 bg-ink p-6 text-white">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.18em] text-white/60">Today&apos;s snapshot</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-mint">
                Prototype
              </span>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-white/8 p-4">
                <p className="text-sm text-white/65">Primary risk flag</p>
                <p className="mt-2 text-2xl font-semibold">Late-day sodium and low produce intake</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  The pattern is manageable, but it points to an avoidable drift in meal quality across the day.
                </p>
              </div>
              <div className="rounded-3xl bg-white/8 p-4">
                <p className="text-sm text-white/65">Next best intervention</p>
                <p className="mt-2 text-2xl font-semibold">Choose the salmon grain bowl</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Higher protein density, lower sodium load, and better fiber than the fried wrap alternative.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/8 p-4">
                  <p className="text-sm text-white/65">Daily monitoring score</p>
                  <p className="mt-2 text-3xl font-semibold">82 / 100</p>
                </div>
                <div className="rounded-3xl bg-white/8 p-4">
                  <p className="text-sm text-white/65">Prevention focus</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    Add fruit at 3 PM, hydrate before dinner, increase evening vegetables.
                  </p>
                </div>
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
            className="glass-panel group flex min-h-64 flex-col justify-between px-6 py-6 transition hover:-translate-y-1"
          >
            <div className="space-y-4">
              <span className="status-chip">{card.title}</span>
              <h2 className="text-3xl leading-tight">{card.title}</h2>
              <p className="text-base leading-7 text-ink/72">{card.description}</p>
            </div>
            <span className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70 transition group-hover:text-ink">
              Open workflow
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel px-6 py-6">
          <span className="status-chip">Why it fits</span>
          <h2 className="mt-4 text-3xl">Built for preventive-health decisions, not passive logging.</h2>
          <p className="mt-4 text-base leading-7 text-ink/72">
            Each module turns nutrition inputs into a monitoring signal, a prevention-oriented interpretation, and a
            next best intervention. The backend stays structured and predictable, which keeps the demo sharp and
            agent-ready.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item} className="glass-panel min-h-40 px-5 py-5">
              <p className="text-lg leading-7 text-ink/80">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
