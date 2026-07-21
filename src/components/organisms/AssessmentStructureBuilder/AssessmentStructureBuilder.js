"use client";

import { useActionState } from "react";
import {
  addAttribute,
  addDomain,
  addStatement,
  removeAttribute,
  removeDomain,
  removeStatement,
} from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Textarea from "@/components/atoms/Textarea/Textarea";
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "@/components/atoms/Collapsible/Collapsible";

const emptyState = { success: false, error: null, message: null };

function ActionMessage({ state }) {
  if (state.error) {
    return (
      <p className="mt-2 text-sm text-red-600 dark:text-red-300" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success && state.message) {
    return (
      <p
        className="mt-2 text-sm text-emerald-700 dark:text-emerald-300"
        role="status"
      >
        {state.message}
      </p>
    );
  }
  return null;
}

function AddDomainForm({ assessmentId }) {
  const [state, formAction, isPending] = useActionState(addDomain, emptyState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <div className="min-w-[12rem] flex-1">
        <Input
          id={`domain-name-${assessmentId}`}
          name="name"
          placeholder="New domain name"
          required
          maxLength={200}
        />
      </div>
      <Button
        type="submit"
        variant="accent-sm"
        disabled={isPending}
        className="disabled:opacity-70"
      >
        {isPending ? "Adding…" : "Add domain"}
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

function AddAttributeForm({ domainId }) {
  const [state, formAction, isPending] = useActionState(
    addAttribute,
    emptyState,
  );

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="domainId" value={domainId} />
      <div className="min-w-[10rem] flex-1">
        <Input
          name="name"
          placeholder="New attribute name"
          required
          maxLength={200}
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        disabled={isPending}
        className="!px-4 !py-2 !text-sm disabled:opacity-70"
      >
        {isPending ? "Adding…" : "Add attribute"}
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

function AddStatementForm({ attributeId }) {
  const [state, formAction, isPending] = useActionState(
    addStatement,
    emptyState,
  );

  return (
    <form action={formAction} className="mt-2 space-y-2">
      <input type="hidden" name="attributeId" value={attributeId} />
      <Textarea
        name="text"
        placeholder="New statement"
        required
        rows={2}
        maxLength={1000}
        variant="default"
      />
      <Button
        type="submit"
        variant="ghost"
        disabled={isPending}
        className="!px-3 !py-1.5 text-primary disabled:opacity-70"
      >
        {isPending ? "Adding…" : "+ Add statement"}
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

function DeleteButton({ action, hiddenFields, label = "Delete" }) {
  const [state, formAction, isPending] = useActionState(action, emptyState);

  return (
    <form action={formAction} className="inline">
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-300"
      >
        {isPending ? "…" : label}
      </button>
      <ActionMessage state={state} />
    </form>
  );
}

export default function AssessmentStructureBuilder({ assessment }) {
  const domains = assessment.domains ?? [];

  return (
    <div className="space-y-6">
      <AddDomainForm assessmentId={assessment.id} />

      {domains.length === 0 ? (
        <p className="text-sm text-muted">
          No domains yet. Add a domain, then attributes and statements under it.
        </p>
      ) : null}

      <div className="space-y-4">
        {domains.map((domain) => (
          <CollapsibleRoot
            key={domain.id}
            defaultOpen
            className="rounded-2xl border border-border bg-surface"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <CollapsibleTrigger className="cursor-pointer text-left text-base font-semibold text-foreground">
                {domain.name}
              </CollapsibleTrigger>
              <DeleteButton
                action={removeDomain}
                hiddenFields={{ domainId: domain.id }}
                label="Delete domain"
              />
            </div>

            <CollapsibleContent className="border-t border-border px-4 py-4">
              <AddAttributeForm domainId={domain.id} />

              <div className="mt-4 space-y-3">
                {(domain.attributes ?? []).map((attribute) => (
                  <div
                    key={attribute.id}
                    className="rounded-xl border border-border/80 bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        {attribute.name}
                      </h3>
                      <DeleteButton
                        action={removeAttribute}
                        hiddenFields={{ attributeId: attribute.id }}
                        label="Delete"
                      />
                    </div>

                    <ul className="mt-3 space-y-2">
                      {(attribute.statements ?? []).map((statement) => (
                        <li
                          key={statement.id}
                          className="flex items-start justify-between gap-3 text-sm text-foreground"
                        >
                          <span className="min-w-0 flex-1">{statement.text}</span>
                          <DeleteButton
                            action={removeStatement}
                            hiddenFields={{ statementId: statement.id }}
                          />
                        </li>
                      ))}
                    </ul>

                    <AddStatementForm attributeId={attribute.id} />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </CollapsibleRoot>
        ))}
      </div>
    </div>
  );
}
