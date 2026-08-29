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
 * Overall average across every answered statement in the assessment.
 *
 * @returns {number | null}
 */
export function getOverallAverage(assessment, answers = {}) {
  const statements = (assessment?.domains ?? []).flatMap((domain) =>
    (domain.attributes ?? []).flatMap((attribute) => attribute.statements ?? []),
  );
  return meanScore(collectStatementScores(statements, answers), 2);
}

function compactAverageRows(rows, extraKeys = []) {
  return rows.map((row) => {
    const compact = {
      id: row.id,
      name: row.name,
      average: row.average,
    };
    for (const key of extraKeys) {
      if (row[key] != null) compact[key] = row[key];
    }
    return compact;
  });
}

/** Persistable domain + attribute averages for a completed submission. */
export function serializeScoreAverages(assessment, answers = {}) {
  return {
    domainAverages: compactAverageRows(getDomainAverages(assessment, answers)),
    attributeAverages: compactAverageRows(
      getAttributeAverages(assessment, answers),
      ["domainId", "domainName"],
    ),
  };
}

export function hasStoredAverages(list) {
  return Array.isArray(list) && list.length > 0;
}

export function resolveDomainAverages(assessment, answers = {}, stored) {
  if (hasStoredAverages(stored)) return stored;
  return compactAverageRows(getDomainAverages(assessment, answers));
}

export function resolveAttributeAverages(assessment, answers = {}, stored) {
  if (hasStoredAverages(stored)) return stored;
  return compactAverageRows(getAttributeAverages(assessment, answers), [
    "domainId",
    "domainName",
  ]);
}

export function meanOfAverages(rows) {
  return meanScore(
    (rows ?? [])
      .map((row) => Number(row?.average))
      .filter((value) => Number.isFinite(value)),
    2,
  );
}

/**
 * Average stored per-item scores across submissions (by item id).
 * Used for overall domain and attribute averages.
 */
export function averageStoredAverages(lists) {
  const sums = new Map();

  for (const list of lists ?? []) {
    for (const item of list ?? []) {
      const id = item?.id;
      const average = Number(item?.average);
      if (!id || !Number.isFinite(average)) continue;
      const prev = sums.get(id) ?? {
        id,
        name: item.name,
        domainId: item.domainId,
        domainName: item.domainName,
        total: 0,
        count: 0,
      };
      prev.total += average;
      prev.count += 1;
      if (item.name) prev.name = item.name;
      if (item.domainId) prev.domainId = item.domainId;
      if (item.domainName) prev.domainName = item.domainName;
      sums.set(id, prev);
    }
  }

  return [...sums.values()].map((row) => {
    const result = {
      id: row.id,
      name: row.name,
      average: Math.round((row.total / row.count) * 100) / 100,
    };
    if (row.domainId) result.domainId = row.domainId;
    if (row.domainName) result.domainName = row.domainName;
    return result;
  });
}

/** Keep stored averages in assessment-tree order when ids still exist. */
export function orderAveragesByTree(rows, orderedIds) {
  if (!orderedIds?.length) return rows ?? [];
  const byId = new Map((rows ?? []).map((row) => [row.id, row]));
  const ordered = [];
  for (const id of orderedIds) {
    const row = byId.get(id);
    if (row) ordered.push(row);
  }
  for (const row of rows ?? []) {
    if (!orderedIds.includes(row.id)) ordered.push(row);
  }
  return ordered;
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
