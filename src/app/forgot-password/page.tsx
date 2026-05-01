import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, ForgotPasswordForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function Page() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We’ll email you a link to choose a new one."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
