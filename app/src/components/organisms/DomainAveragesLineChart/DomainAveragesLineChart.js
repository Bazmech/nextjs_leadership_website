"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SCORE_MAX = 5;
const GRID_STROKE = "#c5d8ea";
const DOMAIN_LINE_COLORS = [
  "#005eb8",
  "#d5281b",
  "#ed8b00",
  "#00a499",
  "#330072",
  "#ae2573",
  "#003087",
  "#768692",
];

function domainLineColor(index) {
  return DOMAIN_LINE_COLORS[index % DOMAIN_LINE_COLORS.length];
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-foreground">{label}</p>
      <ul className="mt-1 grid gap-0.5">
        {payload.map((entry) => (
          <li key={entry.dataKey} className="tabular-nums text-muted">
            <span style={{ color: entry.color }}>{entry.name}</span>
            {": "}
            {typeof entry.value === "number" ? entry.value.toFixed(2) : "—"} /{" "}
            {SCORE_MAX}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DomainAveragesLineChart({
  groups,
  heading = "Domain averages",
  description = `Each line is a domain. Each point is a completed assessment (scale 0–${SCORE_MAX}).`,
  idPrefix = "domain-trend",
}) {
  if (!groups?.length) return null;

  const showTemplateTitle = groups.length > 1;

  return (
    <div className="grid gap-8">
      {groups.map((group) => {
        const items = group.items ?? group.domains ?? [];
        const key = group.assessment?.id ?? group.points[0]?.id;
        return (
          <section
            key={`${idPrefix}-${key}`}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
            aria-labelledby={`${idPrefix}-${key}`}
          >
            <h2
              id={`${idPrefix}-${key}`}
              className="text-lg font-semibold text-foreground"
            >
              {heading}
            </h2>
            {showTemplateTitle && group.assessment?.title ? (
              <p className="mt-1 text-sm font-medium text-foreground">
                {group.assessment.title}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-muted">{description}</p>
            <div
              className={`mt-4 w-full ${
                items.length > 6
                  ? "h-[min(28rem,80vw)] min-h-72"
                  : "h-[min(22rem,70vw)] min-h-64"
              }`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={group.points}
                  margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
                >
                  <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="title"
                    interval={0}
                    tick={{ fill: "#7a9bb8", fontSize: 11 }}
                    tickLine={false}
                    angle={group.points.length > 3 ? -25 : 0}
                    textAnchor={group.points.length > 3 ? "end" : "middle"}
                    height={group.points.length > 3 ? 64 : 36}
                  />
                  <YAxis
                    domain={[0, SCORE_MAX]}
                    tickCount={6}
                    tick={{ fill: "#7a9bb8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  {items.map((item, index) => (
                    <Line
                      key={item.id}
                      type="monotone"
                      dataKey={item.id}
                      name={item.name}
                      stroke={domainLineColor(index)}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        );
      })}
    </div>
  );
}
