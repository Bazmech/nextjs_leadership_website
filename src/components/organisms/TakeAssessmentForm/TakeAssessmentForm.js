"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeAssessmentSubmission,
  saveAssessmentAnswers,
} from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "@/components/atoms/Collapsible/Collapsible";
import LocalDateTime from "@/components/atoms/LocalDateTime/LocalDateTime";
import ScoreRadioGroup from "@/components/atoms/ScoreRadioGroup/ScoreRadioGroup";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/molecules/Tabs/Tabs";
import LeadershipProfileRadar from "@/components/organisms/LeadershipProfileRadar/LeadershipProfileRadar";

const AUTOSAVE_MS = 30_000;

function countAnswered(answers, statementIds) {
  return statementIds.filter((id) => answers[id] != null).length;
}

export default function TakeAssessmentForm({
  submission,
  assessment,
  readOnly = false,
}) {
  const router = useRouter();
  const statementIds = [];
  for (const domain of assessment.domains ?? []) {
    for (const attribute of domain.attributes ?? []) {
      for (const statement of attribute.statements ?? []) {
        statementIds.push(statement.id);
      }
    }
  }

  const [answers, setAnswers] = useState(() => ({
    ...(submission.answers ?? {}),
  }));
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(
    submission.updatedAt ? new Date(submission.updatedAt) : null,
  );
  const answersRef = useRef(answers);
  const dirtyRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  const [completeState, completeAction, isCompleting] = useActionState(
    completeAssessmentSubmission,
    { success: false, error: null, message: null },
  );

  useEffect(() => {
    if (completeState.success) {
      router.refresh();
    }
  }, [completeState.success, router]);

  async function persistAnswers() {
    if (readOnly || !dirtyRef.current) return;
    setSaveStatus("saving");
    const result = await saveAssessmentAnswers(
      submission.id,
      answersRef.current,
    );
    if (result.success) {
      setDirty(false);
      dirtyRef.current = false;
      setSaveStatus("saved");
      setLastSavedAt(
        result.updatedAt ? new Date(result.updatedAt) : new Date(),
      );
    } else {
      setSaveStatus("error");
    }
  }

  useEffect(() => {
    if (readOnly) return undefined;

    const id = setInterval(() => {
      void persistAnswers();
    }, AUTOSAVE_MS);

    return () => clearInterval(id);
  }, [readOnly, submission.id]);

  function setScore(statementId, score) {
    if (readOnly) return;
    setAnswers((prev) => {
      const next = { ...prev, [statementId]: score };
      answersRef.current = next;
      return next;
    });
    setDirty(true);
    dirtyRef.current = true;
    setSaveStatus("idle");
  }

  const answered = countAnswered(answers, statementIds);
  const total = statementIds.length;
  const progressPct = total === 0 ? 0 : Math.round((answered / total) * 100);
  const domains = assessment.domains ?? [];
  const defaultTab = domains[0]?.id ?? "none";

  return (
    <div className={readOnly ? undefined : "pb-28"}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            Started <LocalDateTime value={submission.startedAt} />
            {submission.completedAt ? (
              <>
                {" · Completed "}
                <LocalDateTime value={submission.completedAt} />
              </>
            ) : null}
          </p>
        </div>
        {!readOnly ? (
          <p className="text-sm text-muted" role="status" aria-live="polite">
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? `Saved${lastSavedAt ? ` ${lastSavedAt.toLocaleTimeString()}` : ""}`
                : saveStatus === "error"
                  ? "Save failed"
                  : dirty
                    ? "Unsaved changes"
                    : lastSavedAt
                      ? `Saved ${lastSavedAt.toLocaleTimeString()}`
                      : "All changes saved"}
          </p>
        ) : null}
      </div>

      {readOnly ? (
        <LeadershipProfileRadar assessment={assessment} answers={answers} />
      ) : null}

      {domains.length === 0 ? (
        <p className="text-sm text-muted">This assessment has no domains.</p>
      ) : readOnly ? (
        <CollapsibleRoot
          defaultOpen={false}
          className="rounded-2xl border border-border bg-surface shadow-sm"
        >
          <CollapsibleTrigger className="group flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
            <span className="min-w-0">
              <span className="block text-lg font-semibold text-foreground">
                Statement scores
              </span>
              <span className="mt-1 block text-sm text-muted">
                Reveal your individual statement responses, grouped by domain
                and attribute.
              </span>
            </span>
            <span
              className="mt-1 shrink-0 text-primary transition-transform group-data-[state=open]:rotate-180"
              aria-hidden="true"
            >
              <ChevronIcon />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden">
            <div className="border-t border-border px-6 py-5">
              <StatementScores
                domains={domains}
                defaultTab={defaultTab}
                answers={answers}
                readOnly
              />
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>
      ) : (
        <StatementScores
          domains={domains}
          defaultTab={defaultTab}
          answers={answers}
          readOnly={false}
          setScore={setScore}
        />
      )}

      {!readOnly ? (
        <form action={completeAction} className="mt-10">
          <input type="hidden" name="submissionId" value={submission.id} />
          <input
            type="hidden"
            name="answers"
            value={JSON.stringify(answers)}
          />
          {completeState.error ? (
            <p
              className="mb-3 text-sm text-red-600 dark:text-red-300"
              role="alert"
            >
              {completeState.error}
            </p>
          ) : null}
          {completeState.success ? (
            <p
              className="mb-3 text-sm text-emerald-700 dark:text-emerald-300"
              role="status"
            >
              {completeState.message}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void persistAnswers()}
              className="!text-sm !px-5 !py-2"
            >
              Save now
            </Button>
            <Button
              type="submit"
              variant="accent-sm"
              disabled={isCompleting || answered < total}
              className="disabled:opacity-70"
            >
              {isCompleting ? "Submitting…" : "Complete assessment"}
            </Button>
          </div>
        </form>
      ) : null}

      {!readOnly ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>Progress</span>
                <span>
                  {answered} / {total} statements
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-valuenow={answered}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label="Assessment progress"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <span className="shrink-0 text-xs text-muted" aria-live="polite">
              {saveStatus === "saved"
                ? "Saved"
                : dirty
                  ? "Unsaved"
                  : "Up to date"}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatementScores({
  domains,
  defaultTab,
  answers,
  readOnly,
  setScore,
}) {
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        {domains.map((domain) => (
          <TabsTrigger key={domain.id} value={domain.id}>
            {domain.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {domains.map((domain) => (
        <TabsContent key={domain.id} value={domain.id}>
          <div className="space-y-8">
            {(domain.attributes ?? []).map((attribute) => (
              <section key={attribute.id}>
                <h2 className="text-lg font-semibold text-foreground">
                  {attribute.name}
                </h2>
                <ul className="mt-4 space-y-6">
                  {(attribute.statements ?? []).map((statement) => (
                    <li key={statement.id} className="space-y-3">
                      <p className="text-sm leading-relaxed text-foreground">
                        {statement.text}
                      </p>
                      {readOnly ? (
                        <p className="text-sm font-medium text-primary">
                          Score: {answers[statement.id] ?? "—"}
                        </p>
                      ) : (
                        <ScoreRadioGroup
                          id={`score-${statement.id}`}
                          name={`score-${statement.id}`}
                          value={answers[statement.id]}
                          onValueChange={(score) =>
                            setScore(statement.id, score)
                          }
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
