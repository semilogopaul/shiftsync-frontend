import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export interface LegalSection {
  readonly heading: string;
  readonly body: ReactNode;
}

interface LegalPageProps {
  readonly title: string;
  readonly lastUpdated: string;
  readonly sections: readonly LegalSection[];
  readonly footerNote?: ReactNode;
}

/**
 * Shared layout for legal documents (privacy + terms). Pure presentational —
 * the page-level files own their copy and just hand it down here.
 */
export function LegalPage({
  title,
  lastUpdated,
  sections,
  footerNote,
}: LegalPageProps) {
  return (
    <div className="bg-background min-h-screen">
      <header className="border-border/60 border-b">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="ShiftSync home"
            className="flex items-center"
          >
            <Image
              src="/logo/shiftsync-grey-logo.png"
              alt="ShiftSync"
              width={800}
              height={320}
              className="h-[95px] w-auto dark:hidden -ml-4"
            />
            <Image
              src="/logo/shiftsync-white-logo.png"
              alt="ShiftSync"
              width={720}
              height={320}
              className="hidden h-[95px] w-auto dark:block"
            />
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Last updated · {lastUpdated}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>

        <div className="prose-tight mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              <div className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed sm:text-base">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        {footerNote ? (
          <div className="text-muted-foreground border-border/60 mt-12 border-t pt-6 text-sm">
            {footerNote}
          </div>
        ) : null}
      </main>
    </div>
  );
}
