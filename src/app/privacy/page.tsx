import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/modules/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ShiftSync collects, stores and protects your scheduling data.",
};

export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="April 2026"
      sections={[
        {
          heading: "1. Who we are",
          body: (
            <p>
              ShiftSync (“we”, “us”) provides workforce scheduling software for
              multi-location operators. This policy explains what personal data
              we collect when you or your employer use the service, why we
              collect it, and the choices you have.
            </p>
          ),
        },
        {
          heading: "2. Data we collect",
          body: (
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Account data:</strong> name, email, role, certifications,
                skills, desired weekly hours.
              </li>
              <li>
                <strong>Scheduling data:</strong> shifts, assignments,
                availability windows, swap and drop requests, clock-in events.
              </li>
              <li>
                <strong>Operational telemetry:</strong> audit log entries
                (who/what/when), notification read state, login timestamps.
              </li>
              <li>
                <strong>Technical data:</strong> session cookies, IP address,
                user-agent — used for security and abuse prevention only.
              </li>
            </ul>
          ),
        },
        {
          heading: "3. Why we use it",
          body: (
            <p>
              We process your data to operate the scheduling service, validate
              shift assignments against labor rules, surface fairness analytics,
              send notifications you have opted into, and maintain an audit
              trail for your employer. We do not sell personal data and we do
              not use it for advertising.
            </p>
          ),
        },
        {
          heading: "4. How long we keep it",
          body: (
            <p>
              Operational data (shifts, assignments, audit logs) is retained
              for as long as your employer’s account is active and for a
              reasonable period afterwards to satisfy labor-record obligations.
              Authentication cookies expire automatically; you can sign out at
              any time to invalidate the active session immediately.
            </p>
          ),
        },
        {
          heading: "5. Your rights",
          body: (
            <p>
              You can request a copy of your data, ask us to correct
              inaccuracies, or ask us to delete data that is not part of an
              audit-retention obligation. Reach out to your administrator
              first; for direct enquiries email{" "}
              <a className="text-primary underline" href="mailto:privacy@shiftsync.app">
                privacy@shiftsync.app
              </a>
              .
            </p>
          ),
        },
        {
          heading: "6. Security",
          body: (
            <p>
              Passwords are hashed with industry-standard algorithms.
              Authentication uses HTTP-only, secure cookies. All transport is
              over TLS. We follow the OWASP Top 10 guidance for application
              security and run continuous dependency monitoring.
            </p>
          ),
        },
        {
          heading: "7. Changes to this policy",
          body: (
            <p>
              When we make material changes we will notify you in-product and
              update the “last updated” date above. Continued use of the
              service after a change constitutes acceptance.
            </p>
          ),
        },
      ]}
      footerNote={
        <p>
          See also our{" "}
          <Link href="/terms" className="text-primary underline">
            Terms of Service
          </Link>
          .
        </p>
      }
    />
  );
}
