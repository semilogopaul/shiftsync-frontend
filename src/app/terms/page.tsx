import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/modules/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules of engagement for using ShiftSync.",
};

export default function Page() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="April 2026"
      sections={[
        {
          heading: "1. Acceptance",
          body: (
            <p>
              By creating an account or using ShiftSync, you agree to these
              Terms and to our{" "}
              <Link href="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>
              . If you are using ShiftSync on behalf of an organisation, you
              confirm that you are authorised to bind that organisation to
              these Terms.
            </p>
          ),
        },
        {
          heading: "2. Your account",
          body: (
            <p>
              You are responsible for keeping your credentials confidential and
              for activity that takes place under your account. Notify your
              administrator immediately if you believe an account has been
              compromised.
            </p>
          ),
        },
        {
          heading: "3. Acceptable use",
          body: (
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Do not use the service to violate applicable labor laws or to
                misrepresent worked hours.
              </li>
              <li>
                Do not attempt to access data belonging to organisations or
                users other than your own.
              </li>
              <li>
                Do not probe, scan, or attempt to bypass authentication or
                authorisation controls.
              </li>
              <li>
                Do not upload content that is unlawful, harmful, or infringing.
              </li>
            </ul>
          ),
        },
        {
          heading: "4. Roles and authority",
          body: (
            <p>
              Administrator and manager actions (publishing schedules,
              approving swaps, applying overrides) are recorded in an audit
              log. By using elevated roles you accept responsibility for the
              decisions you make through them.
            </p>
          ),
        },
        {
          heading: "5. Service availability",
          body: (
            <p>
              We strive for high availability but do not guarantee
              uninterrupted access. We may schedule maintenance and will
              attempt to do so outside of typical operational hours.
            </p>
          ),
        },
        {
          heading: "6. Termination",
          body: (
            <p>
              Your administrator can deactivate your account at any time. We
              may suspend accounts that violate these Terms. On termination,
              audit-relevant data may be retained as described in the Privacy
              Policy.
            </p>
          ),
        },
        {
          heading: "7. Disclaimer & liability",
          body: (
            <p>
              The service is provided “as is”. To the maximum extent permitted
              by law, ShiftSync is not liable for indirect or consequential
              losses arising from use of the service. ShiftSync is a tool to
              assist scheduling decisions; ultimate responsibility for
              compliance with labor law lies with the employing organisation.
            </p>
          ),
        },
        {
          heading: "8. Changes",
          body: (
            <p>
              We may update these Terms over time. Material changes will be
              announced in-product. Continuing to use the service after a
              change constitutes acceptance of the revised Terms.
            </p>
          ),
        },
      ]}
      footerNote={
        <p>
          Questions? Email{" "}
          <a className="text-primary underline" href="mailto:legal@shiftsync.app">
            legal@shiftsync.app
          </a>
          .
        </p>
      }
    />
  );
}
