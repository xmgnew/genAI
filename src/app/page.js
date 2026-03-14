import Link from "next/link";

const featureCards = [
  {
    title: "Analyze Food",
    description: "Upload a meal image and get estimated macros, ingredients, and practical next steps.",
    href: "/analyze-food",
  },
  {
    title: "Compare Meals",
    description: "Put two meal options head to head across protein, fiber, satiety, and overall balance.",
    href: "/compare-meals",
  },
  {
    title: "Daily Nutrition",
    description: "Roll up your day into a clear nutrition summary with highlights, gaps, and action items.",
    href: "/daily-nutrition",
  },
];

const highlights = [
  "Structured JSON outputs designed for product integration",
  "Image-aware food analysis through the OpenAI API",
  "Fast comparison workflows for indecisive meal choices",
  "A modern UI that reads like a polished hackathon demo, not a form dump",
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="glass-panel overflow-hidden px-6 py-8 sm:px-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-6">
            <span className="status-chip">AI Nutrition Decision Copilot</span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl leading-none sm:text-6xl">
                NutriLens helps people decide what to eat with evidence-backed AI estimates.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/72">
                Built for speed: upload a food image, compare two meals, or summarize an entire day.
                Every flow is backed by structured JSON from the backend so the product can scale beyond a demo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/analyze-food" className="primary-button">
                Start analyzing
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
                <p className="text-sm text-white/65">Best lunch pick</p>
                <p className="mt-2 text-2xl font-semibold">Grain bowl with salmon</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Higher protein density, lower sodium load, and better fiber than the fried wrap alternative.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/8 p-4">
                  <p className="text-sm text-white/65">Estimated energy</p>
                  <p className="mt-2 text-3xl font-semibold">1,860 kcal</p>
                </div>
                <div className="rounded-3xl bg-white/8 p-4">
                  <p className="text-sm text-white/65">Action plan</p>
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
          <span className="status-chip">Why it works</span>
          <h2 className="mt-4 text-3xl">Hackathon-simple, product-ready underneath.</h2>
          <p className="mt-4 text-base leading-7 text-ink/72">
            The backend is designed around strict response schemas, so each frontend card reads from a predictable
            payload. That keeps the MVP demo-friendly while giving you a clean path to richer nutrition logic later.
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
