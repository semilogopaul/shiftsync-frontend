"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { messageFromError } from "@/common/utils/error-message";
import { useAuth } from "../hooks/use-auth";

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    forgotPassword.mutate(email.trim().toLowerCase());
  };

  if (forgotPassword.isSuccess) {
    return (
      <div
        role="status"
        className="border-primary/30 bg-primary/5 text-foreground flex flex-col items-center gap-3 rounded-2xl border p-6 text-center"
      >
        <CheckCircle2 className="text-primary h-8 w-8" aria-hidden="true" />
        <p className="text-sm leading-relaxed">
          If an account exists for <strong>{email}</strong>, you’ll receive a
          reset link in the next few minutes. Check your spam folder if it
          hasn’t arrived in 10 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input className="h-12 bg-background/50 rounded-xl"
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@coastaleats.com"
        />
      </div>

      {forgotPassword.error ? (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
        >
          {messageFromError(forgotPassword.error, "Could not send reset link.")}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-md shadow-md"
        size="lg"
        disabled={forgotPassword.isPending}
      >
        {forgotPassword.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        Send reset link
      </Button>
    </form>
  );
}
