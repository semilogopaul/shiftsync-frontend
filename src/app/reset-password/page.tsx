import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell, ResetPasswordForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Reset password",
};

interface PageProps {
  readonly searchParams: Promise<{ token?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { token } = await searchParams;
  if (!token) {
    redirect("/forgot-password");
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something strong — we’ll sign you in once it’s saved."
      footer={
        <p>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
