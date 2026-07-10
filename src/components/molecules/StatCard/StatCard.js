export default function StatCard({ value, label }) {
  return (
    <div>
      <dt className="text-3xl font-bold text-primary">{value}</dt>
      <dd className="mt-1 text-sm text-muted">{label}</dd>
    </div>
  );
}
