"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useActionState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  addAttribute,
  addDomain,
  addStatement,
  removeAttribute,
  removeDomain,
  removeStatement,
  reorderAttribute,
  reorderDomain,
  reorderStatement,
  saveAttributeOrder,
  saveDomainOrder,
  saveStatementOrder,
} from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Textarea from "@/components/atoms/Textarea/Textarea";
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "@/components/atoms/Collapsible/Collapsible";
import { isAssessmentStructureLocked } from "@/lib/schemas/assessment";

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

function MoveControls({ action, idField, idValue, canMoveUp, canMoveDown }) {
  const [upState, upAction, upPending] = useActionState(action, emptyState);
  const [downState, downAction, downPending] = useActionState(
    action,
    emptyState,
  );

  return (
    <div className="flex shrink-0 items-center gap-1">
      <form action={upAction}>
        <input type="hidden" name={idField} value={idValue} />
        <input type="hidden" name="direction" value="up" />
        <button
          type="submit"
          disabled={!canMoveUp || upPending || downPending}
          className="cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium text-muted hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Move up"
          title="Move up"
        >
          ↑
        </button>
      </form>
      <form action={downAction}>
        <input type="hidden" name={idField} value={idValue} />
        <input type="hidden" name="direction" value="down" />
        <button
          type="submit"
          disabled={!canMoveDown || upPending || downPending}
          className="cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium text-muted hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Move down"
          title="Move down"
        >
          ↓
        </button>
      </form>
      {upState.error || downState.error ? (
        <span className="sr-only" role="alert">
          {upState.error || downState.error}
        </span>
      ) : null}
    </div>
  );
}

function DragHandle({ attributes, listeners, disabled }) {
  return (
    <button
      type="button"
      className="shrink-0 cursor-grab rounded px-1 py-1 text-muted hover:bg-background hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
      aria-label="Drag to reorder"
      title="Drag to reorder"
      disabled={disabled}
      {...attributes}
      {...listeners}
    >
      <GripIcon />
    </button>
  );
}

function DeleteButton({
  action,
  hiddenFields,
  label = "Delete",
  title,
  description,
}) {
  const [state, formAction, isPending] = useActionState(action, emptyState);

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          className="cursor-pointer text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-300"
        >
          {label}
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-lg focus:outline-none">
          <AlertDialog.Title className="text-lg font-semibold text-foreground">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted">
            {description}
          </AlertDialog.Description>

          {state.error ? (
            <p
              className="mt-3 text-sm text-red-600 dark:text-red-300"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}

          <form
            action={formAction}
            className="mt-6 flex flex-wrap justify-end gap-3"
          >
            {Object.entries(hiddenFields).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
            <AlertDialog.Cancel asChild>
              <Button
                type="button"
                variant="secondary"
                className="!px-5 !py-2 !text-sm"
              >
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="!bg-red-600 hover:!bg-red-700 disabled:opacity-70"
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

function useSortableSensors() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}

function SortableDomain({
  domain,
  domainIndex,
  domainCount,
  locked,
  onAttributesChange,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: domain.id, disabled: locked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CollapsibleRoot className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          {locked ? null : (
            <DragHandle attributes={attributes} listeners={listeners} />
          )}
          <CollapsibleTrigger className="group flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 text-left text-base font-semibold text-foreground">
            <span className="min-w-0">{domain.name}</span>
            <span
              className="shrink-0 text-muted transition-transform group-data-[state=open]:rotate-180"
              aria-hidden="true"
            >
              <ChevronIcon />
            </span>
          </CollapsibleTrigger>
          {locked ? null : (
            <div className="flex shrink-0 items-center gap-2">
              <MoveControls
                action={reorderDomain}
                idField="domainId"
                idValue={domain.id}
                canMoveUp={domainIndex > 0}
                canMoveDown={domainIndex < domainCount - 1}
              />
              <DeleteButton
                action={removeDomain}
                hiddenFields={{ domainId: domain.id }}
                label="Delete domain"
                title="Delete this domain?"
                description="This permanently removes the domain and all of its attributes and statements."
              />
            </div>
          )}
        </div>

        <CollapsibleContent className="border-t border-border px-4 py-4">
          {locked ? null : <AddAttributeForm domainId={domain.id} />}
          <AttributeList
            domain={domain}
            locked={locked}
            onAttributesChange={onAttributesChange}
          />
        </CollapsibleContent>
      </CollapsibleRoot>
    </div>
  );
}

function AttributeList({ domain, locked, onAttributesChange }) {
  const attributes = domain.attributes ?? [];
  const sensors = useSortableSensors();
  const [, startTransition] = useTransition();
  const ids = useMemo(
    () => attributes.map((attribute) => attribute.id),
    [attributes],
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = attributes.findIndex((item) => item.id === active.id);
    const newIndex = attributes.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(attributes, oldIndex, newIndex);
    onAttributesChange(domain.id, next);
    startTransition(async () => {
      await saveAttributeOrder(
        domain.id,
        next.map((item) => item.id),
      );
    });
  }

  if (attributes.length === 0) {
    return locked ? null : (
      <p className="mt-4 text-sm text-muted">No attributes yet.</p>
    );
  }

  const list = (
    <div className={locked ? "space-y-3" : "mt-4 space-y-3"}>
      {attributes.map((attribute, attributeIndex) => (
        <SortableAttribute
          key={attribute.id}
          attribute={attribute}
          attributeIndex={attributeIndex}
          attributeCount={attributes.length}
          locked={locked}
          onStatementsChange={(attributeId, statements) => {
            onAttributesChange(
              domain.id,
              attributes.map((item) =>
                item.id === attributeId ? { ...item, statements } : item,
              ),
            );
          }}
        />
      ))}
    </div>
  );

  if (locked) return list;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {list}
      </SortableContext>
    </DndContext>
  );
}

function SortableAttribute({
  attribute,
  attributeIndex,
  attributeCount,
  locked,
  onStatementsChange,
}) {
  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attribute.id, disabled: locked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="overflow-hidden rounded-xl border border-border/80 bg-background"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/70 bg-surface px-4 py-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {locked ? null : (
            <DragHandle
              attributes={sortableAttributes}
              listeners={listeners}
            />
          )}
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">
              Attribute
            </p>
            <h3 className="mt-0.5 text-base font-semibold text-foreground">
              {attribute.name}
            </h3>
          </div>
        </div>
        {locked ? null : (
          <div className="flex shrink-0 items-center gap-2 pt-1">
            <MoveControls
              action={reorderAttribute}
              idField="attributeId"
              idValue={attribute.id}
              canMoveUp={attributeIndex > 0}
              canMoveDown={attributeIndex < attributeCount - 1}
            />
            <DeleteButton
              action={removeAttribute}
              hiddenFields={{ attributeId: attribute.id }}
              label="Delete"
              title="Delete this attribute?"
              description="This permanently removes the attribute and all of its statements."
            />
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <StatementList
          attribute={attribute}
          locked={locked}
          onStatementsChange={onStatementsChange}
        />

        {locked ? null : <AddStatementForm attributeId={attribute.id} />}
      </div>
    </div>
  );
}

function StatementList({ attribute, locked, onStatementsChange }) {
  const statements = attribute.statements ?? [];
  const sensors = useSortableSensors();
  const [, startTransition] = useTransition();
  const ids = useMemo(
    () => statements.map((statement) => statement.id),
    [statements],
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = statements.findIndex((item) => item.id === active.id);
    const newIndex = statements.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(statements, oldIndex, newIndex);
    onStatementsChange(attribute.id, next);
    startTransition(async () => {
      await saveStatementOrder(
        attribute.id,
        next.map((item) => item.id),
      );
    });
  }

  if (statements.length === 0) {
    return (
      <p className="text-sm text-muted">No statements yet.</p>
    );
  }

  const list = (
    <div>
      <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-muted">
        Statements
      </p>
      <ul className="space-y-2">
        {statements.map((statement, statementIndex) => (
          <SortableStatement
            key={statement.id}
            statement={statement}
            statementIndex={statementIndex}
            statementCount={statements.length}
            locked={locked}
          />
        ))}
      </ul>
    </div>
  );

  if (locked) return list;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {list}
      </SortableContext>
    </DndContext>
  );
}

function SortableStatement({
  statement,
  statementIndex,
  statementCount,
  locked,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: statement.id, disabled: locked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {locked ? null : (
          <DragHandle attributes={attributes} listeners={listeners} />
        )}
        <span className="min-w-0 flex-1">{statement.text}</span>
      </div>
      {locked ? null : (
        <div className="flex shrink-0 items-center gap-2">
          <MoveControls
            action={reorderStatement}
            idField="statementId"
            idValue={statement.id}
            canMoveUp={statementIndex > 0}
            canMoveDown={statementIndex < statementCount - 1}
          />
          <DeleteButton
            action={removeStatement}
            hiddenFields={{ statementId: statement.id }}
            title="Delete this statement?"
            description="This permanently removes the statement from the assessment."
          />
        </div>
      )}
    </li>
  );
}

export default function AssessmentStructureBuilder({ assessment }) {
  const locked = isAssessmentStructureLocked(assessment.status);
  const [domains, setDomains] = useState(assessment.domains ?? []);
  const [, startTransition] = useTransition();
  const sensors = useSortableSensors();
  const domainIds = useMemo(
    () => domains.map((domain) => domain.id),
    [domains],
  );

  useEffect(() => {
    setDomains(assessment.domains ?? []);
  }, [assessment.domains]);

  function handleDomainDragEnd(event) {
    if (locked) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = domains.findIndex((item) => item.id === active.id);
    const newIndex = domains.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(domains, oldIndex, newIndex);
    setDomains(next);
    startTransition(async () => {
      await saveDomainOrder(
        assessment.id,
        next.map((item) => item.id),
      );
    });
  }

  const domainList = (
    <div className="space-y-4">
      {domains.map((domain, domainIndex) => (
        <SortableDomain
          key={domain.id}
          domain={domain}
          domainIndex={domainIndex}
          domainCount={domains.length}
          locked={locked}
          onAttributesChange={(domainId, attributes) => {
            if (locked) return;
            setDomains((current) =>
              current.map((item) =>
                item.id === domainId ? { ...item, attributes } : item,
              ),
            );
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {locked ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Structure is locked because this assessment is{" "}
          {assessment.status === "archived" ? "archived" : "available"}. Domains,
          attributes, and statements can no longer be changed.
        </p>
      ) : (
        <>
          <AddDomainForm assessmentId={assessment.id} />
          <p className="text-sm text-muted">
            Drag the handle to reorder, or use the up/down controls.
          </p>
        </>
      )}

      {domains.length === 0 ? (
        <p className="text-sm text-muted">
          {locked
            ? "No domains were added before this assessment was locked."
            : "No domains yet. Add a domain, then attributes and statements under it."}
        </p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDomainDragEnd}
      >
        <SortableContext
          items={domainIds}
          strategy={verticalListSortingStrategy}
        >
          {domainList}
        </SortableContext>
      </DndContext>
    </div>
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

function GripIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8-12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </svg>
  );
}
