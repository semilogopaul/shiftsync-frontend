'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/modules/auth';
import { RealtimeBridge } from '@/common/hooks/use-realtime';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

export function AppShell({ children }: { readonly children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isFetched } = useCurrentUser();

  useEffect(() => {
    if (isFetched && !user) {
      router.replace('/login');
    }
  }, [isFetched, user, router]);

  if (isLoading || !user) {
    return (
      <div className="bg-background flex min-h-screen">
        {/* Sidebar skeleton */}
        <aside className="border-border/60 bg-card/50 fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-4 border-r p-4 lg:flex">
          <Skeleton className="h-12 w-40" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </aside>
        {/* Main content skeleton */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <header className="border-border/60 bg-background/70 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 sm:px-6 lg:px-8">
            <div className="flex-1" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </header>
          <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
            </div>
            <Skeleton className="h-64 rounded-3xl" />
          </main>
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen">
      <RealtimeBridge />
      <Sidebar user={user} />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <TopBar user={user} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
