import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { VerifyEmailView } from "@/modules/auth/components/verify-email-view";
import { AuthShell } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Verify email",
};

interface PageProps {
  readonly searchParams: Promise<{ token?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { token } = await searchParams;
  if (!token) {
    redirect("/login");
  }

  return (
    <AuthShell
      title="Verifying your email"
      subtitle="Just a moment while we confirm your address."
      footer={
        <p>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <VerifyEmailView token={token} />
    </AuthShell>
  );
}
