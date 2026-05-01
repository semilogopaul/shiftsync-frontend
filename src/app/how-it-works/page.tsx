import type { Metadata } from "next";
import { HowItWorks, PageShell } from "@/modules/landing";

export const metadata: Metadata = {
  title: "How it Works — ShiftSync",
  description:
    "Three steps from setup to a fully live schedule. No consultant required.",
};

export default function Page() {
  return (
    <PageShell>
      <HowItWorks />
    </PageShell>
  );
}
