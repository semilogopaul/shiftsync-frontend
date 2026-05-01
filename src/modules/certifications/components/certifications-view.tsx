'use client';

import { useMemo, useState } from 'react';
import { Loader2, MapPin, ShieldCheck, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ValidationFindingsList } from '@/common/components/validation-findings-list';
import { useLocations } from '@/modules/locations';
import { useSkills } from '@/modules/skills';
import { usersService } from '@/modules/users';
import {
  useCertificationMutations,
  useCertificationsForLocation,
} from '../hooks/use-certifications';
import type { Certification } from '../services/certifications-service';

/**
 * Admin/manager UI for granting and revoking per-location certifications.
 *
 * Backend contract (`shiftsync-backend/src/modules/certifications`):
 *  - Cert is unique by `(userId, locationId)`. Re-granting an existing-but-
 *    revoked cert reactivates the row and replaces its skill set.
 *  - Revoke is a soft-delete (sets `decertifiedAt`) so historical assignments
 *    remain explicable. Toggling "Show history" surfaces revoked rows here.
 *  - Manager scoping is enforced server-side: a manager can only grant/revoke
 *    at locations they manage. We let the BE be the gate; the UI just lists
 *    every location and surfaces the structured 422/403 if the user is out
 *    of scope.
 */
export function CertificationsView() {
  const { data: locations = [], isLoading: locsLoading } = useLocations();
  const [locationId, setLocationId] = useState<string>('');
  const [includeHistory, setIncludeHistory] = useState(false);
  const [granting, setGranting] = useState(false);

  // Default to the first location once locations load — the page is useless
  // without a selected location, and asking the user to pick first is just
  // an extra click for the common case.
  const effectiveLocationId = locationId || (locations.length > 0 ? locations[0].id : '');

  const certsQuery = useCertificationsForLocation(effectiveLocationId || null, includeHistory);

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Certifications</h1>
          <p className="text-muted-foreground text-sm">
            Who can work at this location, and which skills they can fill.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={effectiveLocationId} onValueChange={(value) => setLocationId(value)}>
            <SelectTrigger className="h-10 w-56">
              <SelectValue placeholder="Choose location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="text-muted-foreground inline-flex cursor-pointer items-center gap-2 text-xs">
            <Checkbox
              checked={includeHistory}
              onCheckedChange={(value) => setIncludeHistory(value === true)}
            />
            Show revoked
          </label>
          <Button type="button" onClick={() => setGranting(true)} disabled={!effectiveLocationId}>
            Grant
          </Button>
        </div>
      </header>

      {locsLoading ? (
        <Loading />
      ) : !effectiveLocationId ? (
        <Empty
          icon={<MapPin className="text-muted-foreground h-6 w-6" aria-hidden="true" />}
          message="Create a location first."
        />
      ) : certsQuery.isLoading ? (
        <Loading />
      ) : (certsQuery.data ?? []).filter((c) => includeHistory || !c.decertifiedAt).length === 0 ? (
        <Empty
          icon={<ShieldCheck className="text-muted-foreground h-6 w-6" aria-hidden="true" />}
          message="Nobody is certified at this location yet."
        />
      ) : (
        <CertList rows={certsQuery.data ?? []} showRevoked={includeHistory} />
      )}

      {granting && effectiveLocationId ? (
        <GrantDialog locationId={effectiveLocationId} onClose={() => setGranting(false)} />
      ) : null}
    </section>
  );
}

function Loading() {
  return (
    <div className="border-border/60 divide-y rounded-2xl border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function Empty({ icon, message }: { readonly icon: React.ReactNode; readonly message: string }) {
  return (
    <div className="border-border/60 bg-card/40 flex flex-col items-center gap-3 rounded-3xl border py-16 text-center">
      {icon}
      <p className="text-foreground text-sm font-medium">{message}</p>
    </div>
  );
}

function CertList({
  rows,
  showRevoked,
}: {
  readonly rows: readonly Certification[];
  readonly showRevoked: boolean;
}) {
  const mutations = useCertificationMutations();
  const visible = showRevoked ? rows : rows.filter((c) => !c.decertifiedAt);
  return (
    <ul className="border-border/60 divide-y rounded-2xl border">
      {visible.map((cert) => {
        const revoked = Boolean(cert.decertifiedAt);
        const expired = cert.expiresAt != null && new Date(cert.expiresAt) < new Date();
        return (
          <li key={cert.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-medium">
                {cert.user ? `${cert.user.firstName} ${cert.user.lastName}` : cert.userId}
                {revoked ? (
                  <span className="text-muted-foreground ml-2 inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    Revoked
                  </span>
                ) : expired ? (
                  <span className="ml-2 inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Expired
                  </span>
                ) : null}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {cert.skills.length === 0
                  ? 'No skills'
                  : cert.skills.map((s) => s.skill.name).join(' · ')}
                {cert.expiresAt
                  ? ` · expires ${new Date(cert.expiresAt).toLocaleDateString()}`
                  : ''}
              </p>
            </div>
            {!revoked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/40 hover:bg-destructive/10 shrink-0 text-xs"
                onClick={() => {
                  if (
                    typeof window !== 'undefined' &&
                    !window.confirm(
                      `Revoke ${cert.user?.firstName ?? 'this user'}'s certification? Historical assignments stay intact.`,
                    )
                  )
                    return;
                  mutations.revoke.mutate(cert.id);
                }}
                disabled={mutations.revoke.isPending}
              >
                {mutations.revoke.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden="true" />
                ) : null}
                Revoke
              </Button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function GrantDialog({
  locationId,
  onClose,
}: {
  readonly locationId: string;
  readonly onClose: () => void;
}) {
  const mutations = useCertificationMutations();
  const { data: skills = [] } = useSkills();
  // Cert grants at a location are always for STAFF; manager/admin shouldn't
  // need certs themselves. Backend will reject if a non-staff is supplied.
  const usersQuery = useQuery({
    queryKey: ['users', 'all-staff'],
    queryFn: () => usersService.directory({ role: 'EMPLOYEE' }),
    staleTime: 60_000,
  });
  const [userId, setUserId] = useState('');
  const [skillIds, setSkillIds] = useState<readonly string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');

  const allUsers = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const usersById = useMemo(() => new Map(allUsers.map((u) => [u.id, u])), [allUsers]);

  const toggleSkill = (id: string) => {
    setSkillIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const submit = () => {
    mutations.grant.mutate(
      {
        userId,
        locationId,
        skillIds,
        expiresAt: expiresAt ? new Date(expiresAt + 'T00:00:00Z').toISOString() : undefined,
        notes: notes.trim() || undefined,
      },
      { onSuccess: onClose },
    );
  };

  const canSubmit = Boolean(userId) && skillIds.length > 0 && !mutations.grant.isPending;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="bg-background/80 absolute inset-0 backdrop-blur-sm"
      />
      <div className="bg-card border-border/60 absolute left-1/2 top-1/2 w-[min(540px,92vw)] -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl border p-5 shadow-2xl">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Grant certification</h2>
            <p className="text-muted-foreground text-xs">
              Choose a staff member and which skills they’re cleared for here.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>

        <div className="space-y-1.5">
          <Label htmlFor="cert-user">Staff member</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger id="cert-user">
              <SelectValue placeholder={usersQuery.isLoading ? 'Loading…' : 'Pick someone'} />
            </SelectTrigger>
            <SelectContent>
              {allUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userId && usersById.get(userId)?.email ? (
            <p className="text-muted-foreground text-xs">{usersById.get(userId)?.email}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label>Skills</Label>
          <div className="flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <p className="text-muted-foreground text-xs">No skills configured yet.</p>
            ) : (
              skills.map((skill) => {
                const active = skillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
                      (active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 text-muted-foreground hover:bg-muted')
                    }
                  >
                    {skill.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cert-expires">Expires (optional)</Label>
            <Input
              id="cert-expires"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cert-notes">Notes (optional)</Label>
            <Input
              id="cert-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. food handler course #3421"
              maxLength={500}
            />
          </div>
        </div>

        {mutations.grant.error ? (
          <ValidationFindingsList
            error={mutations.grant.error}
            fallback="Could not grant certification."
          />
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!canSubmit}>
            {mutations.grant.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Grant
          </Button>
        </div>
      </div>
    </div>
  );
}
