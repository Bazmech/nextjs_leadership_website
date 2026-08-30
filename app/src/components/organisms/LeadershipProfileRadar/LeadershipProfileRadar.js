"use client";

import {
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import HorizontalScroll from "@/components/molecules/HorizontalScroll/HorizontalScroll";
import {
  SCORE_INTERPRETATION,
  getAttributeAverages,
  getDomainAverages,
  getOverallAverage,
  getScoreBand,
  meanOfAverages,
} from "@/lib/assessment-scores";

const CHART_STROKE = "#005eb8";
const CHART_FILL = "rgba(0, 94, 184, 0.25)";
const GRID_STROKE = "#c5d8ea";
const RING_TRACK = "#e8eef4";
const SCORE_MAX = 5;

/** Distinct ring colours (NHS-adjacent); first domain is the outer ring. */
const DOMAIN_RING_COLORS = [
  "#005eb8",
  "#d5281b",
  "#ed8b00",
  "#00a499",
  "#330072",
  "#ae2573",
  "#003087",
  "#768692",
];

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
  if (!point || typeof point.average !== "number") return null;
  const label = point.fullName ?? point.name;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-muted">
        Average: {point.average.toFixed(2)} / {SCORE_MAX}
      </p>
      {point.scoredCount != null ? (
        <p className="text-xs text-muted">
          {point.scoredCount} of {point.statementCount} statements
        </p>
      ) : null}
    </div>
  );
}

function domainRingColor(index) {
  return DOMAIN_RING_COLORS[index % DOMAIN_RING_COLORS.length];
}

function DomainAveragesRadialChart({ domains, overall }) {
  const chartData = domains
    .map((domain, index) => ({
      id: domain.id,
      name: domain.name,
      fullName: domain.name,
      average: domain.average,
      scoredCount: domain.scoredCount,
      statementCount: domain.statementCount,
      fill: domainRingColor(index),
    }))
    .toReversed();

  const innerRadius =
    domains.length <= 3 ? "34%" : domains.length <= 5 ? "26%" : "18%";

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_14rem] md:items-center">
      <div className="relative mx-auto h-[min(20rem,70vw)] w-full max-w-sm min-h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="92%"
            startAngle={90}
            endAngle={-270}
            barCategoryGap="16%"
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, SCORE_MAX]}
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <RadialBar
              dataKey="average"
              background={{ fill: RING_TRACK }}
              cornerRadius={8}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={entry.fill} />
              ))}
            </RadialBar>
            <Tooltip content={<ScoreTooltip />} cursor={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        {overall != null ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <p className="text-center">
              <span className="block text-4xl font-semibold tabular-nums leading-none text-foreground">
                {overall.toFixed(2)}
              </span>
              <span className="mt-1 block text-xs text-muted">
                Overall / {SCORE_MAX}
              </span>
            </p>
          </div>
        ) : null}
      </div>

      <ul className="grid gap-3">
        {domains.map((domain, index) => (
          <li
            key={domain.id}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: domainRingColor(index) }}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {domain.name}
              </span>
              <span className="text-xs tabular-nums text-muted">
                {domain.average.toFixed(2)} / {SCORE_MAX}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DomainAveragesTable({
  domains,
  overall,
  heading = "Domain Averages",
  description = `Domain averages from statement scores (scale 0–${SCORE_MAX}).`,
}) {
  if (!domains?.length) return null;

  return (
    <section
      className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm"
      aria-labelledby="domain-averages-heading"
    >
      <h2
        id="domain-averages-heading"
        className="text-lg font-semibold text-foreground"
      >
        {heading}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {description}
      </p>
      {overall != null ? (
        <p className="sr-only">
          Overall average {overall.toFixed(2)} out of {SCORE_MAX}.
        </p>
      ) : null}
      <DomainAveragesRadialChart domains={domains} overall={overall} />
      <div className="mt-6">
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

function AttributeAveragesTable({
  attributes,
  heading = "Attribute Averages",
}) {
  if (!attributes?.length) return null;

  return (
    <section
      className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm"
      aria-labelledby="attribute-averages-heading"
    >
      <h2
        id="attribute-averages-heading"
        className="text-lg font-semibold text-foreground"
      >
        {heading}
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

export default function LeadershipProfileRadar({
  assessment,
  answers,
  domainAverages: domainAveragesProp,
  attributeAverages: attributeAveragesProp,
  heading = "Leadership Profile",
  description = "Attribute averages from statement scores (scale 0–5).",
  domainHeading,
  domainDescription,
  attributeHeading,
}) {
  const averages =
    attributeAveragesProp ?? getAttributeAverages(assessment, answers);
  const domains =
    domainAveragesProp ?? getDomainAverages(assessment, answers);
  const overall =
    domainAveragesProp != null
      ? meanOfAverages(domains)
      : getOverallAverage(assessment, answers);

  if (averages.length === 0 && domains.length === 0) return null;

  const data = averages.map((row) => ({
    attribute: row.name,
    fullName: row.name,
    average: row.average,
    scoredCount: row.scoredCount,
    statementCount: row.statementCount,
  }));

  return (
    <div className="mb-10">
      {averages.length > 0 ? (
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
              {heading}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {description}
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
      ) : null}

      <DomainAveragesTable
        domains={domains}
        overall={overall}
        heading={domainHeading}
        description={domainDescription}
      />
      <AttributeAveragesTable
        attributes={averages}
        heading={attributeHeading}
      />
    </div>
  );
}
