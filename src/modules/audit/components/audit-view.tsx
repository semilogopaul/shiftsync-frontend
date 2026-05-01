'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiGetPage, api } from '@/lib/api-client';
import { useLocations } from '@/modules/locations';
import { formatRelative } from '@/common/utils/datetime';
import type { AuditLogEntry } from '@/common/types/domain';

interface ListParams {
  readonly entityType?: string;
  readonly locationId?: string;
  readonly from?: string;
  readonly to?: string;
}

const ENTITY_TYPES = ['all', 'Shift', 'Assignment', 'SwapRequest', 'Drop', 'User', 'Location'];

const readReason = (meta?: Record<string, unknown>): string | null => {
  const value = meta?.reason;
  return typeof value === 'string' && value.length > 0 ? value : null;
};

const cleanParams = (input: object) =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== '' && value !== 'all',
    ),
  );

export function AuditView() {
  const { data: locations = [] } = useLocations();
  const [filters, setFilters] = useState<ListParams & { entityType: string; locationId: string }>({
    entityType: 'all',
    locationId: 'all',
    from: '',
    to: '',
  });
  const [page, setPage] = useState(1);
  const pageSize = 25;
  // Reset to page 1 whenever the filters change so the user doesn't end up
  // on an empty trailing page.
  const filtersKey = JSON.stringify(filters);
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (prevFiltersKey !== filtersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [exportOpen, setExportOpen] = useState(false);

  const query = useQuery({
    queryKey: ['audit', filters, page, pageSize],
    queryFn: () =>
      apiGetPage<AuditLogEntry>('/audit-logs', {
        params: { ...cleanParams(filters), page, pageSize },
      }),
  });

  const exportCsv = async (range: { readonly from: string; readonly to: string }) => {
    const fromIso = new Date(`${range.from}T00:00:00`).toISOString();
    const toIso = new Date(`${range.to}T23:59:59.999`).toISOString();
    const response = await api.get('/audit-logs/export', {
      params: { ...cleanParams(filters), from: fromIso, to: toIso },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-${range.from}_${range.to}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const rows = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
          <p className="text-muted-foreground text-sm">
            Every override, publish, swap and assignment.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => setExportOpen(true)}>
          Export CSV
        </Button>
      </header>

      <div className="border-border/60 bg-card/40 grid gap-3 rounded-2xl border p-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="entityType">Entity</Label>
          <Select
            value={filters.entityType}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, entityType: value }))}
          >
            <SelectTrigger id="entityType" className="h-11 w-full px-4 text-base font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All entities' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="loc">Location</Label>
          <Select
            value={filters.locationId}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, locationId: value }))}
          >
            <SelectTrigger id="loc" className="h-11 w-full px-4 text-base font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            type="date"
            value={filters.from}
            onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="date"
            value={filters.to}
            onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
          />
        </div>
      </div>

      <div className="border-border/60 overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="text-muted-foreground flex flex-col items-center gap-2 py-8">
                    <ScrollText className="h-6 w-6" aria-hidden="true" />
                    <span>No log entries match these filters.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((entry) => {
                const isOpen = expanded.has(entry.id);
                const diff = computeDiff(entry.before, entry.after);
                const canExpand = diff.length > 0;
                return (
                  <>
                    <TableRow key={entry.id}>
                      <TableCell>
                        {canExpand ? (
                          <button
                            type="button"
                            onClick={() => toggle(entry.id)}
                            aria-label={isOpen ? 'Collapse' : 'Expand'}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatRelative(entry.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.actor
                          ? `${entry.actor.firstName} ${entry.actor.lastName}`
                          : 'system'}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{entry.action}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {entry.entityType}
                        {entry.entityId ? (
                          <span className="ml-1 opacity-60">#{entry.entityId.slice(0, 8)}</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate text-xs">
                        {readReason(entry.meta) ?? '—'}
                      </TableCell>
                    </TableRow>
                    {isOpen && canExpand ? (
                      <TableRow>
                        <TableCell />
                        <TableCell colSpan={5} className="bg-muted/20">
                          <ul className="space-y-1 py-1 text-xs">
                            {diff.map((row) => (
                              <li key={row.key} className="font-mono">
                                <span className="text-muted-foreground">{row.key}:</span>{' '}
                                <span className="text-destructive line-through">{row.before}</span>
                                {' → '}
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {row.after}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination — backend returns total/totalPages so we can offer
          stable page navigation without loading every row at once. */}
      <nav
        className="flex items-center justify-between gap-3 text-xs"
        aria-label="Audit log pagination"
      >
        <span className="text-muted-foreground">
          {total === 0
            ? 'No entries'
            : `Page ${page} of ${totalPages} · ${total} entr${total === 1 ? 'y' : 'ies'}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || query.isFetching}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || query.isFetching}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </nav>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        defaultFrom={filters.from ?? ''}
        defaultTo={filters.to ?? ''}
        onExport={exportCsv}
      />
    </section>
  );
}

interface ExportDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly defaultFrom: string;
  readonly defaultTo: string;
  readonly onExport: (range: { from: string; to: string }) => Promise<void>;
}

function ExportDialog({
  open,
  onOpenChange,
  defaultFrom,
  defaultTo,
  onExport,
}: ExportDialogProps) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error/state when the dialog re-opens.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setFrom(defaultFrom);
      setTo(defaultTo);
      setError(null);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!from || !to) {
      setError('Both a start date and an end date are required.');
      return;
    }
    if (from > to) {
      setError('The start date must be on or before the end date.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onExport({ from, to });
      onOpenChange(false);
      toast.success('Audit log exported');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export audit log';
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (busy ? null : onOpenChange(next))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export audit log</DialogTitle>
          <DialogDescription>
            Select a date range. Both a start and end date are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="export-from">Start date</Label>
              <Input
                id="export-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => setFrom(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-to">End date</Label>
              <Input
                id="export-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
                required
              />
            </div>
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !from || !to}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Download CSV
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DiffRow {
  readonly key: string;
  readonly before: string;
  readonly after: string;
}

const isObject = (v: unknown): v is object =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const stringify = (v: unknown): string => {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
};

function computeDiff(before: unknown, after: unknown): DiffRow[] {
  if (!isObject(before) && !isObject(after)) return [];
  const b = (isObject(before) ? before : {}) as Record<string, unknown>;
  const a = (isObject(after) ? after : {}) as Record<string, unknown>;
  const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
  const rows: DiffRow[] = [];
  for (const key of keys) {
    if (JSON.stringify(b[key]) === JSON.stringify(a[key])) continue;
    rows.push({ key, before: stringify(b[key]), after: stringify(a[key]) });
  }
  return rows.slice(0, 20);
}
