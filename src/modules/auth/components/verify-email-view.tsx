"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "../services/auth-service";
import { messageFromError } from "@/common/utils/error-message";

type Status = "pending" | "success" | "error";

interface VerifyEmailViewProps {
  readonly token: string;
}

export function VerifyEmailView({ token }: VerifyEmailViewProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    authService
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMessage(messageFromError(err, "Verification failed. The link may have expired."));
      });
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail.trim()) return;
    setResendState("sending");
    try {
      await authService.resendVerification(resendEmail.trim());
    } finally {
      setResendState("sent");
    }
  };

  if (status === "pending") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
        <p className="text-muted-foreground text-sm">Verifying your email address…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <div>
          <p className="text-foreground font-semibold">Email verified!</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Your account is now active. You can sign in.
          </p>
        </div>
        <Button onClick={() => router.push("/login")} className="mt-2 w-full rounded-xl h-12">
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <div>
          <p className="text-foreground font-semibold">Verification failed</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {errorMessage ?? "This link is invalid or has expired."}
          </p>
        </div>
      </div>

      {resendState === "sent" ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-300">
          If that email is registered, a new verification link is on its way.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground text-center text-sm">
            Need a new link? Enter your email below.
          </p>
          <div className="space-y-2">
            <Label htmlFor="resend-email">Email address</Label>
            <Input
              id="resend-email"
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 rounded-xl bg-background/50"
            />
          </div>
          <Button
            onClick={handleResend}
            disabled={resendState === "sending" || !resendEmail.trim()}
            className="w-full rounded-xl h-12"
          >
            {resendState === "sending" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
