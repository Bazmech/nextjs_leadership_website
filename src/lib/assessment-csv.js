import {
  getAttributeAverages,
  getDomainAverages,
  getScoreBand,
} from "@/lib/assessment-scores";

function formatDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function escapeCsvCell(value) {
  const text = value == null ? "" : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

/**
 * Safe download filename from a submission title.
 * @param {string} title
 */
export function assessmentCsvFilename(title) {
  const slug = String(title ?? "assessment")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "assessment"}-results.csv`;
}

/**
 * Build a completed assessment results CSV (no internal IDs).
 * One row per statement with rolled-up domain/attribute averages.
 *
 * @param {{ submission: object, assessment: object }} owned
 * @returns {string}
 */
export function buildAssessmentResultsCsv({ submission, assessment }) {
  const answers = submission.answers ?? {};
  const domainAverages = new Map(
    getDomainAverages(assessment, answers).map((row) => [row.id, row]),
  );
  const attributeAverages = new Map(
    getAttributeAverages(assessment, answers).map((row) => [row.id, row]),
  );

  const header = [
    "Submission title",
    "Assessment",
    "Started at",
    "Completed at",
    "Domain",
    "Attribute",
    "Statement",
    "Score",
    "Attribute average",
    "Attribute interpretation",
    "Domain average",
    "Domain interpretation",
  ];

  const rows = [header];

  for (const domain of assessment?.domains ?? []) {
    const domainAvg = domainAverages.get(domain.id);
    const domainBand = domainAvg ? getScoreBand(domainAvg.average) : null;

    for (const attribute of domain.attributes ?? []) {
      const attributeAvg = attributeAverages.get(attribute.id);
      const attributeBand = attributeAvg
        ? getScoreBand(attributeAvg.average)
        : null;

      for (const statement of attribute.statements ?? []) {
        const score = answers[statement.id];
        rows.push([
          submission.title ?? "",
          assessment.title ?? "",
          formatDate(submission.startedAt),
          formatDate(submission.completedAt),
          domain.name ?? "",
          attribute.name ?? "",
          statement.text ?? "",
          typeof score === "number" ? score : "",
          attributeAvg ? attributeAvg.average.toFixed(2) : "",
          attributeBand?.label ?? "",
          domainAvg ? domainAvg.average.toFixed(2) : "",
          domainBand?.label ?? "",
        ]);
      }
    }
  }

  return `${toCsv(rows)}\r\n`;
}
