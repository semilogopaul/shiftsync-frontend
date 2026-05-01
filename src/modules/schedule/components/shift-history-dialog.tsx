"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/common/utils/datetime";
import { shiftsService } from "@/modules/schedule/services/shifts-service";
import type { AuditLogEntry } from "@/common/types/domain";

/**
 * Per-shift audit history. Required by Req 9 — "managers can view the history
 * of any shift". Renders each audit entry with actor, action, and a tiny
 * before/after diff so managers can spot exactly what changed.
 */
interface Props {
  readonly shiftId: string;
  readonly onClose: () => void;
}

export function ShiftHistoryDialog({ shiftId, onClose }: Props) {
  const query = useQuery({
    queryKey: ["shifts", "history", shiftId],
    queryFn: () => shiftsService.history(shiftId),
  });

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="bg-background/80 absolute inset-0 backdrop-blur-sm"
      />
      <div className="bg-card border-border/60 absolute left-1/2 top-1/2 max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border p-6 shadow-2xl">
        <header className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Shift history</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Every change to this shift, in order of most recent.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>
        {query.isLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 py-12">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
          </div>
        ) : query.data && query.data.length > 0 ? (
          <ul className="space-y-3">
            {query.data.map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground py-8 text-sm">No history yet.</p>
        )}
      </div>
    </div>
  );
}

function HistoryEntry({ entry }: { entry: AuditLogEntry }) {
  const actorName = entry.actor
    ? `${entry.actor.firstName} ${entry.actor.lastName}`
    : "System";
  const diff = computeDiff(entry.before, entry.after);
  return (
    <li className="border-border/60 rounded-xl border p-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{entry.action.replace(/_/g, " ")}</p>
        <span className="text-muted-foreground text-xs">{formatRelative(entry.createdAt)}</span>
      </div>
      <p className="text-muted-foreground mt-0.5 text-xs">by {actorName}</p>
      {diff.length > 0 ? (
        <ul className="bg-muted/40 mt-2 rounded-md p-2 text-xs">
          {diff.map((d) => (
            <li key={d.key} className="font-mono">
              <span className="text-muted-foreground">{d.key}:</span>{" "}
              <span className="text-destructive line-through">{d.before}</span>
              {" → "}
              <span className="text-emerald-600 dark:text-emerald-400">{d.after}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

interface DiffRow {
  readonly key: string;
  readonly before: string;
  readonly after: string;
}

function computeDiff(before: unknown, after: unknown): DiffRow[] {
  if (!isObject(before) || !isObject(after)) return [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const rows: DiffRow[] = [];
  for (const key of keys) {
    const b = (before as Record<string, unknown>)[key];
    const a = (after as Record<string, unknown>)[key];
    if (JSON.stringify(b) === JSON.stringify(a)) continue;
    rows.push({
      key,
      before: stringify(b),
      after: stringify(a),
    });
  }
  return rows.slice(0, 12);
}

const isObject = (v: unknown): v is object =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const stringify = (v: unknown): string => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
};
