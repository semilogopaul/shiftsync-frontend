import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface AuthShellProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}

/**
 * Shared chrome for the auth pages: brand on the left (decorative gradient
 * panel), the form on the right. Collapses to a single column on mobile.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="bg-background relative grid min-h-screen lg:grid-cols-2">
      <aside
        aria-hidden="true"
        className="from-primary/15 via-fuchsia-500/10 relative hidden overflow-hidden bg-gradient-to-br to-transparent lg:block"
      >
        <div className="from-primary/30 absolute -left-32 top-24 h-96 w-96 rounded-full bg-gradient-to-br to-rose-500/20 blur-3xl animate-pulse duration-1000" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-sky-500/30 to-fuchsia-500/20 blur-3xl animate-pulse duration-1000" style={{ animationDelay: "1s" }} />
        <div className="relative flex h-full flex-col justify-center items-center p-12 z-10">
          <div className="max-w-2xl mx-auto text-center w-full">
            <h2 className="text-5xl font-black leading-tight tracking-tight">
              Manage shifts seamlessly. <br /><span className="text-primary italic font-bold">Boost your productivity.</span>
            </h2>
          </div>
        </div>
      </aside>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-10 relative">
        <Link href="/" className="absolute top-8 left-8 inline-flex items-center lg:hidden">
            <span className="sr-only">Go back</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Link>
        <div className="mx-auto mt-10 w-full max-w-md lg:mt-0">
          <div className="mb-10 flex flex-col items-center sm:items-start">
            <Link href="/" className="mb-6 hidden hover:opacity-80 transition-opacity sm:inline-flex">
              <Image
                src="/logo/shiftsync-grey-logo.png"
                alt="ShiftSync"
                width={800}
                height={320}
                className="h-[108px] w-auto -ml-4 dark:hidden"
                priority
              />
              <Image
                src="/logo/shiftsync-white-logo.png"
                alt="ShiftSync"
                width={720}
                height={320}
                className="hidden h-[108px] w-auto -ml-4 dark:block"
                priority
              />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-center sm:text-left">{title}</h1>
            {subtitle ? (
              <p className="text-muted-foreground mt-2 text-sm text-center sm:text-left">{subtitle}</p>
            ) : null}
          </div>
          <div className="mt-8">{children}</div>
          {footer ? (
            <div className="text-muted-foreground mt-8 text-center text-sm">
              {footer}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
