"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { messageFromError } from "@/common/utils/error-message";
import { useAuth } from "../hooks/use-auth";

export function RegisterForm() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);
    if (!accepted) {
      setValidationError(
        "Please accept the Terms of Service and Privacy Policy to continue.",
      );
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;
    if (!passwordRegex.test(password)) {
      setValidationError(
        "Password must be at least 12 characters and contain uppercase, lowercase, and a number.",
      );
      return;
    }
    register.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const errorText =
    validationError ?? (register.error ? messageFromError(register.error, "Could not create account.") : null);

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="firstName"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="h-12 bg-background/50 rounded-xl pl-10"
              placeholder="Jane"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="lastName"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="h-12 bg-background/50 rounded-xl pl-10"
              placeholder="Doe"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@coastaleats.com"
            className="h-12 bg-background/50 rounded-xl pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={12}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="************"
            className="h-12 bg-background/50 rounded-xl pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <p className="text-muted-foreground text-xs">
          Use at least 12 characters including uppercase, lowercase, and a number.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="accept-terms"
          checked={accepted}
          onCheckedChange={(value) => setAccepted(value === true)}
          aria-describedby="accept-terms-label"
          className="mt-1"
        />
        <Label
          id="accept-terms-label"
          htmlFor="accept-terms"
          className="text-muted-foreground text-sm font-normal leading-relaxed"
        >
          I agree to ShiftSync’s{" "}
          <Link href="/terms" className="text-primary underline" target="_blank">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline" target="_blank">
            Privacy Policy
          </Link>
          .
        </Label>
      </div>

      {errorText ? (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
        >
          {errorText}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-md shadow-md"
        size="lg"
        disabled={register.isPending}
      >
        {register.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        Create account
      </Button>
    </form>
  );
}
