import type { Metadata } from "next";
import { ContactPage, PageShell } from "@/modules/landing";

export const metadata: Metadata = {
  title: "Contact — ShiftSync",
  description:
    "Get in touch with the ShiftSync team. We respond within one business day.",
};

export default function Page() {
  return (
    <PageShell>
      <ContactPage />
    </PageShell>
  );
}
