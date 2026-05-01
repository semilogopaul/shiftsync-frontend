import Link from "next/link";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Final CTA. Bright, opinionated, and explicit about the next step. The
 * gradient panel uses on-brand colours and a soft glow to draw the eye after
 * the FAQ.
 */
export function CtaBanner() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-primary/15 via-fuchsia-500/10 to-transparent p-10 shadow-2xl backdrop-blur sm:p-16">
        <div
          aria-hidden="true"
          className="from-primary/30 absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br to-rose-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-sky-500/20 to-fuchsia-500/10 blur-3xl"
        />

        <div className="relative grid items-center gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div>
            <h2
              id="cta-heading"
              className="text-3xl font-bold tracking-tight text-balance sm:text-4xl"
            >
              Friday-night ready in fifteen minutes.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Spin up your locations, invite your team, publish a week. We’ll
              handle the validation, overtime math, and Sunday-night chaos for
              you.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end md:flex-col md:items-stretch">
            <Button
              asChild
              size="lg"
              className="rounded-full shadow-lg shadow-primary/25"
            >
              <Link href="/register">
                Create your account
                <MoveRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
