import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, RegisterForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Spin up a ShiftSync workspace.",
};

export default function Page() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Spin up a workspace and invite your managers in minutes."
      footer={
        <p>
          Already on ShiftSync?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
