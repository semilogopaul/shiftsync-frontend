'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useCertificationsForUser } from '../hooks/use-certifications';
import { ShieldCheck } from 'lucide-react';

/**
 * Read-only "My certifications" panel for staff so they can see, on their
 * settings page, which locations they're cleared for and what skills they
 * carry. Helps them understand why they may or may not see certain shifts
 * in /schedule.
 */
export function MyCertificationsPanel({ userId }: { readonly userId: string }) {
  const query = useCertificationsForUser(userId);
  const rows = query.data ?? [];

  return (
    <section className="border-border/60 bg-card/40 space-y-3 rounded-2xl border p-5">
      <header className="flex items-center gap-2">
        <ShieldCheck className="text-primary h-4 w-4" aria-hidden="true" />
        <h2 className="text-foreground text-sm font-semibold">My certifications</h2>
      </header>
      {query.isLoading ? (
        <div className="divide-border/40 divide-y">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You aren’t certified at any location yet. A manager needs to grant this before you can be
          assigned to shifts.
        </p>
      ) : (
        <ul className="divide-border/40 divide-y">
          {rows.map((cert) => (
            <li
              key={cert.id}
              className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span className="text-foreground font-medium">
                {cert.location?.name ?? cert.locationId}
              </span>
              <span className="text-muted-foreground text-xs">
                {cert.skills.length === 0
                  ? 'No skills'
                  : cert.skills.map((s) => s.skill.name).join(' · ')}
                {cert.expiresAt
                  ? ` · expires ${new Date(cert.expiresAt).toLocaleDateString()}`
                  : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
