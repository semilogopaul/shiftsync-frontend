import type { Metadata } from "next";
import { PainPoints, PageShell } from "@/modules/landing";

export const metadata: Metadata = {
  title: "Why ShiftSync — ShiftSync",
  description:
    "The five problems every growing restaurant group hits — and exactly how ShiftSync solves each one.",
};

export default function Page() {
  return (
    <PageShell>
      <PainPoints />
    </PageShell>
  );
}
