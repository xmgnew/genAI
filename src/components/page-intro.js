export function PageIntro({ eyebrow, title, description }) {
  return (
    <section className="glass-panel spotlight-card grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_16rem]" data-click-fx>
      <div>
        <span className="status-chip">{eyebrow}</span>
        <h1 className="mt-5 max-w-4xl text-4xl leading-[0.95] sm:text-5xl lg:text-[3.65rem]">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-ink/72">{description}</p>
      </div>

      <div className="grid gap-3 self-start">
        <div className="metric-card">
          <p className="story-kicker">Output</p>
          <p className="mt-2 text-xl font-semibold text-ink">Structured JSON</p>
        </div>
        <div className="metric-card">
          <p className="story-kicker">Signal</p>
          <p className="mt-2 text-xl font-semibold text-ink">Actionable next step</p>
        </div>
        <div className="metric-card bg-ink text-white shadow-[0_24px_60px_rgba(13,27,42,0.24)]">
          <p className="story-kicker text-white/45">Stack</p>
          <p className="mt-2 text-xl font-semibold text-white">FastAPI + Next.js</p>
        </div>
      </div>
    </section>
  );
}
