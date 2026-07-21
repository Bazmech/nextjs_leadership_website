"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import HorizontalScroll from "@/components/molecules/HorizontalScroll/HorizontalScroll";
import {
  SCORE_INTERPRETATION,
  getAttributeAverages,
  getDomainAverages,
  getScoreBand,
} from "@/lib/assessment-scores";

const CHART_STROKE = "#005eb8";
const CHART_FILL = "rgba(0, 94, 184, 0.25)";
const GRID_STROKE = "#c5d8ea";

function wrapLabel(text, maxChars = 18) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function AttributeTick({ payload, x, y, cx, cy, textAnchor }) {
  const lines = wrapLabel(payload?.value ?? "");
  const dx = x - cx;
  const dy = y - cy;
  const push = 8;
  const len = Math.hypot(dx, dy) || 1;
  const tx = x + (dx / len) * push;
  const ty = y + (dy / len) * push;

  return (
    <text
      x={tx}
      y={ty}
      textAnchor={textAnchor}
      fill="#005eb8"
      fontSize={11}
      fontWeight={500}
    >
      {lines.map((line, index) => (
        <tspan key={line} x={tx} dy={index === 0 ? "-0.35em" : "1.15em"}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function ScoreTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-foreground">{point.fullName}</p>
      <p className="mt-0.5 text-muted">
        Average: {point.average.toFixed(2)} / 5
      </p>
      <p className="text-xs text-muted">
        {point.scoredCount} of {point.statementCount} statements
      </p>
    </div>
  );
}

function DomainAveragesTable({ assessment, answers }) {
  const domains = getDomainAverages(assessment, answers);
  if (domains.length === 0) return null;

  return (
    <section
      className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm"
      aria-labelledby="domain-averages-heading"
    >
      <h2
        id="domain-averages-heading"
        className="text-lg font-semibold text-foreground"
      >
        Domain Averages
      </h2>
      <div className="mt-4">
        <HorizontalScroll>
          <table className="w-full min-w-[20rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-3 pr-4 font-medium">Domain</th>
                <th className="w-36 pb-3 pr-4 text-right font-medium">
                  Average Score
                </th>
                <th className="w-36 pb-3 text-right font-medium">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => {
                const band = getScoreBand(domain.average);
                return (
                  <tr key={domain.id} className="border-b border-border last:border-b-0">
                    <td className="py-3 pr-4 font-semibold text-foreground">
                      {domain.name}
                    </td>
                    <td className="w-36 py-3 pr-4 text-right tabular-nums text-foreground">
                      {domain.average.toFixed(2)}
                    </td>
                    <td className="w-36 py-3 text-right">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${band.badgeClass}`}
                      >
                        {band.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </HorizontalScroll>
      </div>
    </section>
  );
}

function AttributeAveragesTable({ assessment, answers }) {
  const attributes = getAttributeAverages(assessment, answers);
  if (attributes.length === 0) return null;

  return (
    <section
      className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm"
      aria-labelledby="attribute-averages-heading"
    >
      <h2
        id="attribute-averages-heading"
        className="text-lg font-semibold text-foreground"
      >
        Attribute Averages
      </h2>
      <div className="mt-4">
        <HorizontalScroll>
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-3 pr-4 font-medium">Domain</th>
                <th className="pb-3 pr-4 font-medium">Attribute</th>
                <th className="w-36 pb-3 pr-4 text-right font-medium">
                  Average Score
                </th>
                <th className="w-36 pb-3 text-right font-medium">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attribute) => {
                const band = getScoreBand(attribute.average);
                return (
                  <tr
                    key={attribute.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="py-3 pr-4 text-muted">{attribute.domainName}</td>
                    <td className="py-3 pr-4 font-semibold text-foreground">
                      {attribute.name}
                    </td>
                    <td className="w-36 py-3 pr-4 text-right font-semibold tabular-nums text-foreground">
                      {attribute.average.toFixed(2)}
                    </td>
                    <td className="w-36 py-3 text-right">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${band.badgeClass}`}
                      >
                        {band.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </HorizontalScroll>
      </div>
    </section>
  );
}

export default function LeadershipProfileRadar({ assessment, answers }) {
  const averages = getAttributeAverages(assessment, answers);

  if (averages.length === 0) return null;

  const data = averages.map((row) => ({
    attribute: row.name,
    fullName: row.name,
    average: row.average,
    scoredCount: row.scoredCount,
    statementCount: row.statementCount,
  }));

  return (
    <div className="mb-10">
      <section
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
        aria-labelledby="leadership-profile-heading"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
          <div className="min-w-0">
            <h2
              id="leadership-profile-heading"
              className="text-lg font-semibold text-foreground"
            >
              Leadership Profile
            </h2>
            <p className="mt-1 text-sm text-muted">
              Attribute averages from your statement scores (scale 0–5).
            </p>
            <div className="mt-4 h-[min(28rem,70vw)] w-full min-h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius="68%"
                  margin={{ top: 24, right: 36, bottom: 24, left: 36 }}
                >
                  <PolarGrid stroke={GRID_STROKE} />
                  <PolarAngleAxis
                    dataKey="attribute"
                    tick={<AttributeTick />}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 5]}
                    tickCount={6}
                    axisLine={false}
                    tick={{ fill: "#7a9bb8", fontSize: 10 }}
                  />
                  <Radar
                    name="Average"
                    dataKey="average"
                    stroke={CHART_STROKE}
                    fill={CHART_FILL}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Tooltip content={<ScoreTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-background/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                aria-hidden
              >
                i
              </span>
              How to interpret your scores
            </h3>
            <ul className="mt-4 space-y-3">
              {SCORE_INTERPRETATION.map((band) => (
                <li
                  key={band.key}
                  className={`rounded-lg border-l-4 ${band.borderClass} ${band.bgClass} px-3 py-2`}
                >
                  <p className={`text-sm font-semibold ${band.textClass}`}>
                    {band.label}{" "}
                    <span className="font-normal opacity-80">({band.range})</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{band.description}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <DomainAveragesTable assessment={assessment} answers={answers} />
      <AttributeAveragesTable assessment={assessment} answers={answers} />
    </div>
  );
}
