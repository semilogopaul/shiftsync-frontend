import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, LoginForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to ShiftSync.",
};

export default function Page() {
  return (
    <AuthShell
      title="Welcome Back!"
      subtitle="Sign in to your ShiftSync workspace."
      footer={
        <p>
          New here?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
