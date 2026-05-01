import type { Metadata } from "next";
import { FeatureGrid } from "@/modules/landing";
import { PageShell } from "@/modules/landing";

export const metadata: Metadata = {
  title: "Features — ShiftSync",
  description:
    "Six core capabilities that cover every scheduling headache for multi-location restaurant operators.",
};

export default function Page() {
  return (
    <PageShell>
      <FeatureGrid />
    </PageShell>
  );
}
