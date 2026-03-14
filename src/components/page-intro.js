export function PageIntro({ eyebrow, title, description, disclaimer }) {
  return (
    <section className="glass-panel px-6 py-8 sm:px-8">
      {eyebrow && <span className="status-chip">{eyebrow}</span>}

      <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
        {title}
      </h1>

      {description && (
        <p className="mt-4 text-base leading-7 text-ink/72">
          {description}
        </p>
      )}

      {disclaimer && (
        <p className="mt-2 text-xs leading-relaxed text-ink/55">
          {disclaimer}
        </p>
      )}
    </section>
  );
}