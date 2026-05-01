"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/modules/auth";
import { RealtimeBridge } from "@/common/hooks/use-realtime";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { readonly children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isFetched } = useCurrentUser();

  useEffect(() => {
    if (isFetched && !user) {
      router.replace("/login");
    }
  }, [isFetched, user, router]);

  if (isLoading || !user) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" aria-hidden="true" />
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
