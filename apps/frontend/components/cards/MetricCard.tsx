export function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="card">
      <p style={{ margin: 0, color: "var(--muted)" }}>{label}</p>
      <h3 style={{ margin: "0.4rem 0 0" }}>{value}</h3>
    </article>
  );
}
