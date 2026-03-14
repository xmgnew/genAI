export function PageIntro({ eyebrow, title, description }) {
  return (
    <section className="glass-panel px-6 py-8 sm:px-8">
      <span className="status-chip">{eyebrow}</span>
      <h1 className="mt-4 max-w-4xl text-4xl leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-ink/72">{description}</p>
    </section>
  );
}
