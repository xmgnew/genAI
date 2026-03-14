export function JsonPanel({ title, data }) {
  return (
    <section className="glass-panel spotlight-card px-6 py-6">
      <div className="flex items-center justify-between">
        <span className="status-chip">{title}</span>
        <span className="text-xs uppercase tracking-[0.16em] text-ink/45">Structured output</span>
      </div>
      <pre className="glass-panel-dark mt-5 overflow-x-auto rounded-[24px] p-5 text-sm leading-7 text-mist">
        <code>{JSON.stringify(data ?? { status: "Waiting for response" }, null, 2)}</code>
      </pre>
    </section>
  );
}
