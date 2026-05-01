import { LandingHeader } from "../components/landing-header";

interface PageShellProps {
  readonly children: React.ReactNode;
}

/**
 * Wraps inner landing pages (Features, How it works, etc.) with the shared
 * header and footer. The main content region sits below the fixed 64px header.
 */
export function PageShell({ children }: PageShellProps) {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-[100] m-2 rounded-md px-3 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:left-2 focus:top-2"
      >
        Skip to content
      </a>
      <LandingHeader />
      <main id="main" className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
}
