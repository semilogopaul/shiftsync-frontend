import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Why ShiftSync", href: "/why" },
    { label: "FAQ", href: "/faq" },
  ],
  Company: [
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
  Account: [
    { label: "Sign in", href: "/login" },
    { label: "Create account", href: "/register" },
  ],
} as const;

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-border/60 relative border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="ShiftSync home"
              className="inline-flex items-center"
            >
              <Image
                src="/logo/shiftsync-grey-logo.png"
                alt="ShiftSync"
                width={800}
                height={320}
                className="h-[71px] w-auto dark:hidden -ml-4"
              />
              <Image
                src="/logo/shiftsync-white-logo.png"
                alt="ShiftSync"
                width={720}
                height={320}
                className="hidden h-[71px] w-auto dark:block"
              />
            </Link>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              Multi-location workforce scheduling for restaurant operators
              who are done patching spreadsheets together.
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Get started free
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <p className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  {title}
                </p>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border/60 mt-12 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            © {year} ShiftSync. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Built for the people who keep restaurants running.
          </p>
        </div>
      </div>
    </footer>
  );
}
