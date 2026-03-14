export function JsonPanel({ title, data }) {
  return (
    <section className="glass-panel px-6 py-6">
      <div className="flex items-center justify-between">
        <span className="status-chip">{title}</span>
        <span className="text-xs uppercase tracking-[0.16em] text-ink/45">Structured output</span>
      </div>
      <pre className="mt-5 overflow-x-auto rounded-[24px] bg-ink p-5 text-sm leading-7 text-mist">
        <code>{JSON.stringify(data ?? { status: "Waiting for response" }, null, 2)}</code>
      </pre>
    </section>
  );
}
