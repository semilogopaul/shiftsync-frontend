import type { ReactNode } from "react";
import { AppShell } from "@/modules/app-shell";

export default function AppLayout({ children }: { readonly children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
