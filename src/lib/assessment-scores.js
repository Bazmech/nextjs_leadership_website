function collectStatementScores(statements, answers) {
  return statements
    .map((statement) => answers[statement.id])
    .filter((score) => typeof score === "number" && !Number.isNaN(score));
}

function meanScore(scores, decimals = 1) {
  if (scores.length === 0) return null;
  const sum = scores.reduce((total, score) => total + score, 0);
  const factor = 10 ** decimals;
  return Math.round((sum / scores.length) * factor) / factor;
}

/**
 * Compute per-attribute averages from statement scores.
 * Average = mean of answered statement scores (1–5) within each attribute.
 *
 * @param {object} assessment - Tree from getAssessmentTree (domains → attributes → statements)
 * @param {Record<string, number>} answers - { [statementId]: score }
 * @returns {{ id: string, name: string, domainId: string, domainName: string, average: number, scoredCount: number, statementCount: number }[]}
 */
export function getAttributeAverages(assessment, answers = {}) {
  const rows = [];

  for (const domain of assessment?.domains ?? []) {
    for (const attribute of domain.attributes ?? []) {
      const statements = attribute.statements ?? [];
      const scores = collectStatementScores(statements, answers);
      const average = meanScore(scores, 2);
      if (average == null) continue;

      rows.push({
        id: attribute.id,
        name: attribute.name,
        domainId: domain.id,
        domainName: domain.name,
        average,
        scoredCount: scores.length,
        statementCount: statements.length,
      });
    }
  }

  return rows;
}

/**
 * Compute per-domain averages from statement scores.
 * Average = mean of all answered statement scores within the domain.
 *
 * @returns {{ id: string, name: string, average: number, scoredCount: number, statementCount: number }[]}
 */
export function getDomainAverages(assessment, answers = {}) {
  const rows = [];

  for (const domain of assessment?.domains ?? []) {
    const statements = (domain.attributes ?? []).flatMap(
      (attribute) => attribute.statements ?? [],
    );
    const scores = collectStatementScores(statements, answers);
    const average = meanScore(scores, 2);
    if (average == null) continue;

    rows.push({
      id: domain.id,
      name: domain.name,
      average,
      scoredCount: scores.length,
      statementCount: statements.length,
    });
  }

  return rows;
}

/**
 * Score band for interpretation.
 * 0.0–2.4 Growth Priority · 2.5–3.4 Developing · 3.5–4.4 Established · 4.5–5.0 Strength
 */
export function getScoreBand(average) {
  if (average >= 4.5) {
    return SCORE_INTERPRETATION.find((band) => band.key === "strength");
  }
  if (average >= 3.5) {
    return SCORE_INTERPRETATION.find((band) => band.key === "established");
  }
  if (average >= 2.5) {
    return SCORE_INTERPRETATION.find((band) => band.key === "developing");
  }
  return SCORE_INTERPRETATION.find((band) => band.key === "growth");
}

export const SCORE_INTERPRETATION = [
  {
    key: "strength",
    label: "Strength",
    range: "4.5 – 5.0",
    description: "High capability in this area",
    borderClass: "border-emerald-500",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    badgeClass: "border-emerald-400 bg-emerald-50 text-emerald-700",
  },
  {
    key: "established",
    label: "Established",
    range: "3.5 – 4.4",
    description: "Solid foundation with room to refine",
    borderClass: "border-sky-500",
    textClass: "text-sky-700",
    bgClass: "bg-sky-50",
    badgeClass: "border-sky-400 bg-sky-50 text-sky-700",
  },
  {
    key: "developing",
    label: "Developing",
    range: "2.5 – 3.4",
    description: "Growth opportunity through practice",
    borderClass: "border-amber-500",
    textClass: "text-amber-800",
    bgClass: "bg-amber-50",
    badgeClass: "border-amber-400 bg-amber-50 text-amber-800",
  },
  {
    key: "growth",
    label: "Growth Priority",
    range: "0.0 – 2.4",
    description: "Key area for development focus",
    borderClass: "border-rose-500",
    textClass: "text-rose-700",
    bgClass: "bg-rose-50",
    badgeClass: "border-rose-400 bg-rose-50 text-rose-700",
  },
];
