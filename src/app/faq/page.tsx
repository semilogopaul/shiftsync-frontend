import type { Metadata } from "next";
import { Faq, PageShell } from "@/modules/landing";

export const metadata: Metadata = {
  title: "FAQ — ShiftSync",
  description: "Straightforward answers to the questions we get most often.",
};

export default function Page() {
  return (
    <PageShell>
      <Faq />
    </PageShell>
  );
}
