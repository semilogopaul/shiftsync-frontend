'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Pencil,
  Repeat,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatDayLabel, formatTimeRange } from '@/common/utils/datetime';
import { ValidationFindingsList } from '@/common/components/validation-findings-list';
import { extractValidationPreview } from '@/common/utils/validation-errors';
import { findingTitle, isOverridableCode } from '@/common/constants/validation-codes';
import type { AssignmentPreview } from '@/common/types/domain';
import { useCurrentUser } from '@/modules/auth';
import { usersService } from '@/modules/users';
import { RequestSwapDialog, DropShiftDialog } from '@/modules/swaps';
import { useShift, useShiftMutations } from '../hooks/use-shifts';
import { shiftsService } from '../services/shifts-service';
import { EditShiftDialog } from './edit-shift-dialog';
import { ShiftHistoryDialog } from './shift-history-dialog';

interface ShiftDrawerProps {
  readonly shiftId: string;
  readonly onClose: () => void;
}

export function ShiftDrawer({ shiftId, onClose }: ShiftDrawerProps) {
  const { data: user } = useCurrentUser();
  const { data: shift, isLoading } = useShift(shiftId);
  const mutations = useShiftMutations();

  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'EMPLOYEE';
  const meAssignment = shift?.assignments.find((assignment) => assignment.userId === user?.id);

  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  // Per the brief, edits/unpublishes within 48h of start are restricted to
  // admins. Managers see a banner explaining why the buttons are disabled.
  // Capture "now" once per mount via lazy state init so it's stable across re-renders.
  const [now] = useState(() => Date.now());
  const hoursUntilStart = shift
    ? (new Date(shift.startsAt).getTime() - now) / 3_600_000
    : Number.POSITIVE_INFINITY;
  const within48h = hoursUntilStart < 48 && hoursUntilStart > 0;
  const editLocked = within48h && !isAdmin;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="bg-background/80 absolute inset-0 backdrop-blur-sm"
      />
      <aside className="bg-card border-border/60 absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-hidden border-l shadow-2xl">
        <header className="border-border/60 flex items-start justify-between gap-4 border-b p-5">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              {shift?.location?.name ?? 'Shift'}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {shift
                ? formatDayLabel(shift.startsAt, shift.location?.timezone ?? 'UTC')
                : 'Loading…'}
            </h2>
            {shift ? (
              <p className="text-muted-foreground mt-1 text-sm">
                {formatTimeRange(shift.startsAt, shift.endsAt, shift.location?.timezone ?? 'UTC')}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {isLoading || !shift ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="Headcount"
                  value={`${shift.assignments.length} / ${shift.headcount}`}
                />
                <Stat
                  label="Status"
                  value={
                    shift.status === 'PUBLISHED'
                      ? 'Published'
                      : shift.status === 'DRAFT'
                        ? 'Draft'
                        : shift.status
                  }
                />
                {shift.skill ? <Stat label="Skill" value={shift.skill.name} /> : null}
                {shift.isPremium ? (
                  <Stat
                    label="Premium"
                    value={
                      <span className="inline-flex items-center gap-1.5 text-fuchsia-500">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        Yes
                      </span>
                    }
                  />
                ) : null}
              </div>

              {/* Assigned staff */}
              <section>
                <h3 className="text-foreground text-sm font-semibold">
                  Assigned ({shift.assignments.length})
                </h3>
                {shift.assignments.length === 0 ? (
                  <p className="text-muted-foreground mt-2 text-sm">Nobody assigned yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {shift.assignments.map((assignment) => (
                      <li
                        key={assignment.id}
                        className="border-border/60 flex items-center justify-between gap-3 rounded-xl border p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-sm font-medium">
                            {assignment.user.firstName} {assignment.user.lastName}
                          </p>
                          {assignment.clockedInAt ? (
                            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                              On the clock
                            </p>
                          ) : null}
                        </div>
                        {isManager ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              mutations.unassign.mutate({
                                shiftId,
                                userId: assignment.userId,
                              })
                            }
                            aria-label={`Remove ${assignment.user.firstName}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Manager: assign someone */}
              {isManager ? <AssignPanel shiftId={shiftId} locationId={shift?.locationId} /> : null}

              {/* Manager actions */}
              {isManager ? (
                <div className="border-border/60 space-y-2 border-t pt-5">
                  {within48h ? (
                    <p
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs',
                        editLocked
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'border-border/60 bg-muted/40 text-muted-foreground',
                      )}
                    >
                      {editLocked
                        ? 'This shift starts within 48 hours — only an admin can edit or unpublish it.'
                        : 'Within 48h of start — admin override active.'}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditOpen(true)}
                      disabled={editLocked || shift.status === 'CANCELLED'}
                    >
                      <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryOpen(true)}
                    >
                      <History className="mr-2 h-4 w-4" aria-hidden="true" />
                      History
                    </Button>
                    {shift.status === 'PUBLISHED' ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => mutations.unpublish.mutate(shift.id)}
                        disabled={mutations.unpublish.isPending || editLocked}
                      >
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => mutations.publish.mutate(shift.id)}
                        disabled={mutations.publish.isPending}
                      >
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Staff: clock in/out + callout */}
              {isStaff && meAssignment ? (
                <div className="border-border/60 flex flex-wrap gap-2 border-t pt-5">
                  {meAssignment.clockedInAt && !meAssignment.clockedOutAt ? (
                    <Button
                      type="button"
                      onClick={() => mutations.clockOut.mutate(shift.id)}
                      disabled={mutations.clockOut.isPending}
                    >
                      <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                      Clock out
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => mutations.clockIn.mutate(shift.id)}
                      disabled={mutations.clockIn.isPending}
                    >
                      <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                      Clock in
                    </Button>
                  )}
                  {shift.status === 'PUBLISHED' && !meAssignment.clockedInAt ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSwapOpen(true)}
                      >
                        <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                        Request swap
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDropOpen(true)}
                      >
                        <Repeat className="mr-2 h-4 w-4" aria-hidden="true" />
                        Drop shift
                      </Button>
                    </>
                  ) : null}
                  <CalloutButton
                    shiftId={shift.id}
                    onCallout={(reason) => mutations.callout.mutate({ shiftId: shift.id, reason })}
                    pending={mutations.callout.isPending}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </aside>
      {editOpen && shift ? (
        <EditShiftDialog shift={shift} onClose={() => setEditOpen(false)} />
      ) : null}
      {historyOpen ? (
        <ShiftHistoryDialog shiftId={shiftId} onClose={() => setHistoryOpen(false)} />
      ) : null}
      {swapOpen && shift && user ? (
        <RequestSwapDialog
          shift={shift}
          currentUserId={user.id}
          onClose={() => setSwapOpen(false)}
        />
      ) : null}
      {dropOpen && shift ? (
        <DropShiftDialog shift={shift} onClose={() => setDropOpen(false)} />
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { readonly label: string; readonly value: React.ReactNode }) {
  return (
    <div className="border-border/60 bg-muted/30 rounded-xl border p-3">
      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-foreground mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function CalloutButton({
  onCallout,
  pending,
}: {
  readonly shiftId: string;
  readonly onCallout: (reason: string) => void;
  readonly pending: boolean;
}) {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive border-destructive/30"
      >
        <AlertTriangle className="mr-2 h-4 w-4" aria-hidden="true" />
        Call out
      </Button>
    );
  }

  return (
    <div className="border-destructive/30 bg-destructive/5 flex w-full flex-col gap-2 rounded-xl border p-3">
      <Label htmlFor="callout-reason" className="text-xs">
        Reason (managers will see this)
      </Label>
      <Input
        id="callout-reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="e.g. stomach flu"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onCallout(reason.trim())}
          disabled={pending || reason.trim().length < 2}
        >
          Confirm callout
        </Button>
      </div>
    </div>
  );
}

interface AssignPanelProps {
  readonly shiftId: string;
  readonly locationId: string | undefined;
}

function AssignPanel({ shiftId, locationId }: AssignPanelProps) {
  const [userId, setUserId] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');
  const mutations = useShiftMutations();

  const usersQuery = useQuery({
    queryKey: ['users', 'directory', { locationId }],
    queryFn: () => usersService.directory({ role: 'EMPLOYEE', locationId }),
    staleTime: 60_000,
    enabled: Boolean(locationId),
  });

  const previewMutation = useMutation({
    mutationFn: () =>
      shiftsService.previewAssignment(shiftId, {
        userId,
        overrideUsed: false,
      }),
  });

  // If the backend rejected the live assign with E_VALIDATION (422), surface
  // the embedded preview so we can show findings + alternatives without an
  // extra roundtrip. Falls back to whatever the explicit preview returned.
  const errorPreview = useMemo<AssignmentPreview | null>(
    () => extractValidationPreview(mutations.assign.error),
    [mutations.assign.error],
  );
  const preview: AssignmentPreview | undefined = errorPreview ?? previewMutation.data;
  const errors = useMemo(
    () => preview?.findings.filter((f) => f.severity === 'error') ?? [],
    [preview],
  );
  const warnings = useMemo(
    () => preview?.findings.filter((f) => f.severity === 'warning') ?? [],
    [preview],
  );
  const overridable = errors.some((e) => isOverridableCode(e.code));
  const hardBlocked = errors.some((e) => !isOverridableCode(e.code));

  return (
    <section className="border-border/60 space-y-3 rounded-2xl border p-4">
      <div>
        <h3 className="text-foreground text-sm font-semibold">Assign staff</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          We’ll run the validator before the assignment is saved.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {(usersQuery.data ?? []).map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={() => previewMutation.mutate()}
          disabled={!userId || previewMutation.isPending}
        >
          {previewMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            'Check'
          )}
        </Button>
      </div>

      {preview ? (
        <div className="space-y-2">
          {preview.projection ? <ProjectionPanel projection={preview.projection} /> : null}
          {errors.length === 0 && warnings.length === 0 ? (
            <FindingRow
              tone="ok"
              icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              title="Looks good"
              detail="No conflicts found."
            />
          ) : null}
          {errors.map((finding) => (
            <FindingRow
              key={finding.code}
              tone="error"
              icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
              title={findingTitle(finding.code)}
              detail={finding.message}
            />
          ))}
          {warnings.map((finding) => (
            <FindingRow
              key={finding.code}
              tone="warning"
              icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
              title={findingTitle(finding.code)}
              detail={finding.message}
            />
          ))}

          {preview.alternatives && preview.alternatives.length > 0 ? (
            <div className="mt-2 space-y-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Suggested alternatives
              </p>
              <ul className="space-y-1">
                {preview.alternatives.slice(0, 5).map((alt) => (
                  <li
                    key={alt.user.id}
                    className="border-border/40 flex items-start justify-between gap-2 rounded-lg border p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {alt.user.firstName} {alt.user.lastName}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {alt.reasons.join(' · ')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserId(alt.user.id)}
                    >
                      Pick
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {overridable && !hardBlocked ? (
            <div className="space-y-1.5">
              <Label htmlFor="override-reason" className="text-xs">
                Override reason (required)
              </Label>
              <Input
                id="override-reason"
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
                placeholder="e.g. emergency coverage — Sarah out sick"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {mutations.assign.error && !errorPreview ? (
        // Only show a fallback banner when the error did NOT carry a structured
        // preview — otherwise the panel above already explains the broken rule
        // and lists alternatives, and a second copy is just noise.
        <ValidationFindingsList error={mutations.assign.error} fallback="Could not assign." />
      ) : null}

      <Button
        type="button"
        size="sm"
        onClick={() =>
          mutations.assign.mutate({
            shiftId,
            input: {
              userId,
              overrideUsed: overridable && overrideReason.trim().length > 0,
              overrideReason: overrideReason.trim() || undefined,
            },
          })
        }
        disabled={
          !userId ||
          hardBlocked ||
          mutations.assign.isPending ||
          (overridable && overrideReason.trim().length < 2)
        }
        className={cn('w-full')}
      >
        Confirm assignment
      </Button>
    </section>
  );
}

/**
 * "What-if" projection summary shown above the findings list. Lets the
 * manager see, at a glance, what the candidate's totals will look like
 * post-assignment so they can make an informed call before clicking through.
 */
function ProjectionPanel({
  projection,
}: {
  readonly projection: NonNullable<AssignmentPreview['projection']>;
}) {
  const dailyTone =
    projection.projectedDailyHours > 12
      ? 'text-destructive'
      : projection.projectedDailyHours > 8
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-foreground';
  const weeklyTone =
    projection.projectedWeeklyHours > 40
      ? 'text-destructive'
      : projection.projectedWeeklyHours >= 35
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-foreground';
  const consecutiveTone =
    projection.projectedConsecutiveDays >= 7
      ? 'text-destructive'
      : projection.projectedConsecutiveDays >= 6
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-foreground';
  return (
    <div className="border-border/60 bg-muted/30 grid grid-cols-3 gap-2 rounded-lg border p-2.5 text-center">
      <ProjectionCell label="Daily" value={`${projection.projectedDailyHours}h`} tone={dailyTone} />
      <ProjectionCell
        label="Weekly"
        value={`${projection.projectedWeeklyHours}h`}
        tone={weeklyTone}
      />
      <ProjectionCell
        label="Streak"
        value={`${projection.projectedConsecutiveDays}d`}
        tone={consecutiveTone}
      />
    </div>
  );
}

function ProjectionCell({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className={cn('text-sm font-semibold', tone)}>{value}</p>
    </div>
  );
}

function FindingRow({
  tone,
  icon,
  title,
  detail,
}: {
  readonly tone: 'ok' | 'warning' | 'error';
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly detail: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border p-2.5 text-xs',
        tone === 'ok' &&
          'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
        tone === 'warning' &&
          'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300',
        tone === 'error' && 'border-destructive/30 bg-destructive/5 text-destructive',
      )}
    >
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="opacity-90">{detail}</p>
      </div>
    </div>
  );
}
