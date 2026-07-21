import {
  Circle,
  Document,
  G,
  Line,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import {
  SCORE_INTERPRETATION,
  getAttributeAverages,
  getDomainAverages,
  getScoreBand,
} from "@/lib/assessment-scores";

const PRIMARY = "#005eb8";
const MUTED = "#5b7a99";
const BORDER = "#c5d8ea";
const SURFACE = "#f0f4f5";

const BAND_COLORS = {
  strength: "#047857",
  established: "#0369a1",
  developing: "#b45309",
  growth: "#be123c",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a2b3c",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
  },
  eyebrow: {
    fontSize: 9,
    color: PRIMARY,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 2,
  },
  meta: {
    fontSize: 9,
    color: MUTED,
    marginTop: 6,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  legendItem: {
    width: "48%",
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
    paddingRight: 8,
    marginBottom: 6,
    marginRight: "2%",
    backgroundColor: SURFACE,
  },
  legendLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  legendRange: {
    fontSize: 8,
    color: MUTED,
  },
  legendDesc: {
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
  },
  chartWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  th: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    textTransform: "uppercase",
  },
  td: {
    fontSize: 9,
    color: "#1a2b3c",
  },
  tdMuted: {
    fontSize: 9,
    color: MUTED,
  },
  tdBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a2b3c",
  },
  badge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  domainBlock: {
    marginTop: 10,
    padding: 10,
    backgroundColor: SURFACE,
    borderRadius: 4,
  },
  domainName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    marginBottom: 6,
  },
  attributeName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 6,
    marginBottom: 3,
  },
  statementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  statementText: {
    flex: 1,
    fontSize: 8,
    color: "#1a2b3c",
    paddingRight: 12,
  },
  statementScore: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    width: 36,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
  },
});

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function bandColor(band) {
  return BAND_COLORS[band?.key] ?? MUTED;
}

function wrapLabel(text, maxChars = 14) {
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
  return lines.slice(0, 2);
}

function pointOnCircle(cx, cy, radius, angle) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function RadarChartSvg({ attributes }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 88;
  const n = attributes.length;
  if (n === 0) return null;

  const angles = attributes.map((_, index) => {
    return (Math.PI * 2 * index) / n - Math.PI / 2;
  });

  const rings = [1, 2, 3, 4, 5];
  const gridPaths = rings.map((ring) => {
    const r = (radius * ring) / 5;
    const pts = angles.map((angle) => pointOnCircle(cx, cy, r, angle));
    return (
      pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"
    );
  });

  const valuePoints = attributes.map((attr, index) => {
    const r = (radius * Math.min(Math.max(attr.average, 0), 5)) / 5;
    return pointOnCircle(cx, cy, r, angles[index]);
  });
  const valuePath =
    valuePoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
      .join(" ") + " Z";

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridPaths.map((d) => (
        <Path key={d} d={d} stroke={BORDER} strokeWidth={1} fill="none" />
      ))}
      {angles.map((angle) => {
        const end = pointOnCircle(cx, cy, radius, angle);
        return (
          <Line
            key={`spoke-${angle}`}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke={BORDER}
            strokeWidth={1}
          />
        );
      })}
      <Path
        d={valuePath}
        stroke={PRIMARY}
        strokeWidth={2}
        fill={PRIMARY}
        fillOpacity={0.22}
      />
      {valuePoints.map((p) => (
        <Circle
          key={`pt-${p.x}-${p.y}`}
          cx={p.x}
          cy={p.y}
          r={2.5}
          fill={PRIMARY}
        />
      ))}
      {attributes.map((attr, index) => {
        const labelRadius = radius + 22;
        const pos = pointOnCircle(cx, cy, labelRadius, angles[index]);
        const lines = wrapLabel(attr.name);
        const anchor =
          Math.abs(pos.x - cx) < 8 ? "middle" : pos.x > cx ? "start" : "end";
        return (
          <G key={attr.id}>
            {lines.map((line, lineIndex) => (
              <Text
                key={`${attr.id}-${line}`}
                x={pos.x}
                y={pos.y + lineIndex * 9 - ((lines.length - 1) * 9) / 2}
                style={{
                  fontSize: 7,
                  fill: PRIMARY,
                  fontFamily: "Helvetica",
                }}
                textAnchor={anchor}
              >
                {line}
              </Text>
            ))}
          </G>
        );
      })}
    </Svg>
  );
}

function TableHeader({ columns }) {
  return (
    <View style={styles.tableHeader} fixed={false}>
      {columns.map((col) => (
        <Text key={col.key} style={[styles.th, { width: col.width }]}>
          {col.label}
        </Text>
      ))}
    </View>
  );
}

function AssessmentResultsDocument({ submission, assessment }) {
  const answers = submission.answers ?? {};
  const attributes = getAttributeAverages(assessment, answers);
  const domains = getDomainAverages(assessment, answers);

  return (
    <Document
      title={`${submission.title} — Leadership Profile`}
      author="Leadership Assessment"
      subject={`Results for ${assessment.title}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Leadership assessment results</Text>
          <Text style={styles.title}>{submission.title}</Text>
          <Text style={styles.subtitle}>Assessment: {assessment.title}</Text>
          <Text style={styles.meta}>
            Started {formatDate(submission.startedAt)}
            {submission.completedAt
              ? ` · Completed ${formatDate(submission.completedAt)}`
              : ""}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to interpret your scores</Text>
          <View style={styles.legendRow}>
            {SCORE_INTERPRETATION.map((band) => (
              <View
                key={band.key}
                style={[
                  styles.legendItem,
                  { borderLeftColor: bandColor(band) },
                ]}
              >
                <Text style={[styles.legendLabel, { color: bandColor(band) }]}>
                  {band.label}
                </Text>
                <Text style={styles.legendRange}>{band.range}</Text>
                <Text style={styles.legendDesc}>{band.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {attributes.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leadership Profile</Text>
            <Text style={styles.sectionHint}>
              Attribute averages from your statement scores (scale 0–5).
            </Text>
            <View style={styles.chartWrap}>
              <RadarChartSvg attributes={attributes} />
            </View>
          </View>
        ) : null}

        {domains.length > 0 ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Domain Averages</Text>
            <View style={styles.table}>
              <TableHeader
                columns={[
                  { key: "domain", label: "Domain", width: "50%" },
                  { key: "avg", label: "Average", width: "20%" },
                  { key: "band", label: "Interpretation", width: "30%" },
                ]}
              />
              {domains.map((domain, index) => {
                const band = getScoreBand(domain.average);
                return (
                  <View
                    key={domain.id}
                    style={[
                      styles.tableRow,
                      index === domains.length - 1 ? styles.tableRowLast : null,
                    ]}
                  >
                    <Text style={[styles.tdBold, { width: "50%" }]}>
                      {domain.name}
                    </Text>
                    <Text style={[styles.td, { width: "20%" }]}>
                      {domain.average.toFixed(2)}
                    </Text>
                    <Text
                      style={[
                        styles.badge,
                        { width: "30%", color: bandColor(band) },
                      ]}
                    >
                      {band.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {attributes.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attribute Averages</Text>
            <View style={styles.table}>
              <TableHeader
                columns={[
                  { key: "domain", label: "Domain", width: "28%" },
                  { key: "attr", label: "Attribute", width: "32%" },
                  { key: "avg", label: "Average", width: "15%" },
                  { key: "band", label: "Interpretation", width: "25%" },
                ]}
              />
              {attributes.map((attribute, index) => {
                const band = getScoreBand(attribute.average);
                return (
                  <View
                    key={attribute.id}
                    style={[
                      styles.tableRow,
                      index === attributes.length - 1
                        ? styles.tableRowLast
                        : null,
                    ]}
                    wrap={false}
                  >
                    <Text style={[styles.tdMuted, { width: "28%" }]}>
                      {attribute.domainName}
                    </Text>
                    <Text style={[styles.tdBold, { width: "32%" }]}>
                      {attribute.name}
                    </Text>
                    <Text style={[styles.td, { width: "15%" }]}>
                      {attribute.average.toFixed(2)}
                    </Text>
                    <Text
                      style={[
                        styles.badge,
                        { width: "25%", color: bandColor(band) },
                      ]}
                    >
                      {band.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statement scores</Text>
          <Text style={styles.sectionHint}>
            Individual scores (1–5) grouped by domain and attribute.
          </Text>
          {(assessment.domains ?? []).map((domain) => (
            <View key={domain.id} style={styles.domainBlock}>
              <Text style={styles.domainName}>{domain.name}</Text>
              {(domain.attributes ?? []).map((attribute) => (
                <View key={attribute.id} wrap={false}>
                  <Text style={styles.attributeName}>{attribute.name}</Text>
                  {(attribute.statements ?? []).map((statement) => {
                    const score = answers[statement.id];
                    return (
                      <View key={statement.id} style={styles.statementRow}>
                        <Text style={styles.statementText}>
                          {statement.text}
                        </Text>
                        <Text style={styles.statementScore}>
                          {typeof score === "number" ? score : "—"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ))}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Leadership assessment results · Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

/**
 * Safe download filename from a submission title.
 * @param {string} title
 */
export function assessmentPdfFilename(title) {
  const slug = String(title ?? "assessment")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "assessment"}-results.pdf`;
}

/**
 * Render a completed assessment results PDF.
 * @param {{ submission: object, assessment: object }} owned
 * @returns {Promise<Buffer>}
 */
export async function renderAssessmentResultsPdf({ submission, assessment }) {
  return renderToBuffer(
    <AssessmentResultsDocument
      submission={submission}
      assessment={assessment}
    />,
  );
}
