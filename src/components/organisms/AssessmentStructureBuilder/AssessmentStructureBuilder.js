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
  renameAttribute,
  renameDomain,
  renameStatement,
  reorderAttribute,
  reorderDomain,
  reorderStatement,
  saveAttributeOrder,
  saveDomainOrder,
  saveStatementOrder,
} from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Label from "@/components/atoms/Label/Label";
import Textarea from "@/components/atoms/Textarea/Textarea";
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "@/components/atoms/Collapsible/Collapsible";
import { isAssessmentStructureLocked } from "@/lib/schemas/assessment";

const emptyState = { success: false, error: null, message: null };

const iconButtonClassName =
  "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const moveButtonClassName =
  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-30";

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
  const inputId = `domain-name-${assessmentId}`;

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="assessmentId" value={assessmentId} />
        <div className="min-w-[12rem] flex-1 space-y-2">
          <Label htmlFor={inputId}>New domain name</Label>
          <Input
            id={inputId}
            name="name"
            placeholder="e.g. Leading self"
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
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function AddAttributeForm({ domainId }) {
  const [state, formAction, isPending] = useActionState(
    addAttribute,
    emptyState,
  );
  const inputId = `attribute-name-${domainId}`;

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="domainId" value={domainId} />
        <div className="min-w-[10rem] flex-1 space-y-2">
          <Label htmlFor={inputId}>New attribute name</Label>
          <Input
            id={inputId}
            name="name"
            placeholder="e.g. Self-awareness"
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
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function AddStatementForm({ attributeId }) {
  const [state, formAction, isPending] = useActionState(
    addStatement,
    emptyState,
  );
  const inputId = `statement-text-${attributeId}`;

  return (
    <form action={formAction} className="mt-2 space-y-2">
      <input type="hidden" name="attributeId" value={attributeId} />
      <Label htmlFor={inputId}>New statement</Label>
      <Textarea
        id={inputId}
        name="text"
        placeholder="Write the statement respondents will rate"
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
        {isPending ? "Adding…" : "Add statement"}
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

function EditButton({ onClick, label = "Edit" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${iconButtonClassName} text-muted hover:border-primary/30 hover:bg-primary/5 hover:text-foreground`}
      aria-label={label}
      title={label}
    >
      <EditIcon />
    </button>
  );
}

function InlineRenameForm({
  action,
  idField,
  idValue,
  fieldName,
  initialValue,
  maxLength,
  multiline = false,
  inputId,
  ariaLabel,
  onCancel,
}) {
  const [value, setValue] = useState(initialValue);
  const [state, formAction, isPending] = useActionState(action, emptyState);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (state.success) {
      onCancel();
    }
  }, [state.success, onCancel]);

  return (
    <form action={formAction} className="min-w-0 flex-1 space-y-2">
      <input type="hidden" name={idField} value={idValue} />
      {multiline ? (
        <Textarea
          id={inputId}
          name={fieldName}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
          rows={2}
          maxLength={maxLength}
          aria-label={ariaLabel}
          autoFocus
          variant="default"
        />
      ) : (
        <Input
          id={inputId}
          name={fieldName}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
          maxLength={maxLength}
          aria-label={ariaLabel}
          autoFocus
        />
      )}
      <ActionMessage state={state} />
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="accent-sm"
          disabled={isPending}
          className="disabled:opacity-70"
        >
          {isPending ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="!px-4 !py-2 !text-sm"
          onClick={() => {
            setValue(initialValue);
            onCancel();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function MoveControls({
  action,
  idField,
  idValue,
  canMoveUp,
  canMoveDown,
  itemLabel,
}) {
  const [upState, upAction, upPending] = useActionState(action, emptyState);
  const [downState, downAction, downPending] = useActionState(
    action,
    emptyState,
  );
  const upLabel = itemLabel ? `Move ${itemLabel} up` : "Move up";
  const downLabel = itemLabel ? `Move ${itemLabel} down` : "Move down";

  return (
    <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`Reorder ${itemLabel ?? "item"}`}>
      <form action={upAction}>
        <input type="hidden" name={idField} value={idValue} />
        <input type="hidden" name="direction" value="up" />
        <button
          type="submit"
          disabled={!canMoveUp || upPending || downPending}
          className={moveButtonClassName}
          aria-label={upLabel}
          title={upLabel}
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
          className={moveButtonClassName}
          aria-label={downLabel}
          title={downLabel}
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

function DragHandle({ attributes, listeners, disabled, label = "Drag to reorder" }) {
  return (
    <button
      type="button"
      className={`${iconButtonClassName} cursor-grab text-muted hover:bg-background hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40`}
      aria-label={label}
      title={label}
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
          className={`${iconButtonClassName} text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:border-red-400/40 dark:hover:bg-red-950/40 dark:hover:text-red-200`}
          aria-label={label}
          title={label}
        >
          <DeleteIcon />
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
              className="!bg-red-700 !text-white hover:!bg-red-800 disabled:opacity-70"
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
  const [renaming, setRenaming] = useState(false);
  const stopRenaming = useMemo(() => () => setRenaming(false), []);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: domain.id, disabled: locked || renaming });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CollapsibleRoot className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          {locked || renaming ? null : (
            <DragHandle
              attributes={attributes}
              listeners={listeners}
              label={`Drag to reorder domain ${domain.name}`}
            />
          )}
          {renaming ? (
            <InlineRenameForm
              action={renameDomain}
              idField="domainId"
              idValue={domain.id}
              fieldName="name"
              initialValue={domain.name}
              maxLength={200}
              inputId={`rename-domain-${domain.id}`}
              ariaLabel="Domain name"
              onCancel={stopRenaming}
            />
          ) : (
            <CollapsibleTrigger className="group flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Domain
                </span>
                <h2 className="mt-0.5 text-base font-semibold text-foreground">
                  {domain.name}
                </h2>
              </span>
              <span
                className="shrink-0 text-muted transition-transform group-data-[state=open]:rotate-180"
                aria-hidden="true"
              >
                <ChevronIcon />
              </span>
            </CollapsibleTrigger>
          )}
          {locked || renaming ? null : (
            <div className="flex shrink-0 items-center gap-2">
              <EditButton
                onClick={() => setRenaming(true)}
                label={`Edit domain ${domain.name}`}
              />
              <MoveControls
                action={reorderDomain}
                idField="domainId"
                idValue={domain.id}
                canMoveUp={domainIndex > 0}
                canMoveDown={domainIndex < domainCount - 1}
                itemLabel={`domain ${domain.name}`}
              />
              <DeleteButton
                action={removeDomain}
                hiddenFields={{ domainId: domain.id }}
                label={`Delete domain ${domain.name}`}
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
  const [renaming, setRenaming] = useState(false);
  const stopRenaming = useMemo(() => () => setRenaming(false), []);
  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attribute.id, disabled: locked || renaming });

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
          {locked || renaming ? null : (
            <DragHandle
              attributes={sortableAttributes}
              listeners={listeners}
              label={`Drag to reorder attribute ${attribute.name}`}
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Attribute
            </p>
            {renaming ? (
              <div className="mt-1">
                <InlineRenameForm
                  action={renameAttribute}
                  idField="attributeId"
                  idValue={attribute.id}
                  fieldName="name"
                  initialValue={attribute.name}
                  maxLength={200}
                  inputId={`rename-attribute-${attribute.id}`}
                  ariaLabel="Attribute name"
                  onCancel={stopRenaming}
                />
              </div>
            ) : (
              <h3 className="mt-0.5 text-base font-semibold text-foreground">
                {attribute.name}
              </h3>
            )}
          </div>
        </div>
        {locked || renaming ? null : (
          <div className="flex shrink-0 items-center gap-2 pt-1">
            <EditButton
              onClick={() => setRenaming(true)}
              label={`Edit attribute ${attribute.name}`}
            />
            <MoveControls
              action={reorderAttribute}
              idField="attributeId"
              idValue={attribute.id}
              canMoveUp={attributeIndex > 0}
              canMoveDown={attributeIndex < attributeCount - 1}
              itemLabel={`attribute ${attribute.name}`}
            />
            <DeleteButton
              action={removeAttribute}
              hiddenFields={{ attributeId: attribute.id }}
              label={`Delete attribute ${attribute.name}`}
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
      <p
        id={`statements-heading-${attribute.id}`}
        className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
      >
        Statements
      </p>
      <ul
        className="space-y-2"
        aria-labelledby={`statements-heading-${attribute.id}`}
      >
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
  const [renaming, setRenaming] = useState(false);
  const stopRenaming = useMemo(() => () => setRenaming(false), []);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: statement.id, disabled: locked || renaming });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  };

  const statementLabel =
    statement.text.length > 48
      ? `${statement.text.slice(0, 48).trim()}…`
      : statement.text;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {locked || renaming ? null : (
          <DragHandle
            attributes={attributes}
            listeners={listeners}
            label={`Drag to reorder statement ${statementLabel}`}
          />
        )}
        {renaming ? (
          <InlineRenameForm
            action={renameStatement}
            idField="statementId"
            idValue={statement.id}
            fieldName="text"
            initialValue={statement.text}
            maxLength={1000}
            multiline
            inputId={`rename-statement-${statement.id}`}
            ariaLabel="Statement text"
            onCancel={stopRenaming}
          />
        ) : (
          <span className="min-w-0 flex-1 pt-1.5">{statement.text}</span>
        )}
      </div>
      {locked || renaming ? null : (
        <div className="flex shrink-0 items-center gap-2">
          <EditButton
            onClick={() => setRenaming(true)}
            label={`Edit statement ${statementLabel}`}
          />
          <MoveControls
            action={reorderStatement}
            idField="statementId"
            idValue={statement.id}
            canMoveUp={statementIndex > 0}
            canMoveDown={statementIndex < statementCount - 1}
            itemLabel={`statement ${statementLabel}`}
          />
          <DeleteButton
            action={removeStatement}
            hiddenFields={{ statementId: statement.id }}
            label={`Delete statement ${statementLabel}`}
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
            Edit or delete items while drafting, drag the handle to reorder, or
            use the up/down controls.
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

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.784 0 1.569.02 2.35.054v.443H7.65V4.054A41.55 41.55 0 0 1 10 4Zm-3.342 5.854a.75.75 0 1 0-1.317.698l.8 3.95a.75.75 0 0 0 1.317-.698l-.8-3.95Zm5.69.698a.75.75 0 0 0-1.317-.698l-.8 3.95a.75.75 0 1 0 1.317.698l.8-3.95Z"
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
