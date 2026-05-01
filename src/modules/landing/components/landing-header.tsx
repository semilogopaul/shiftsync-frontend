'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '../data/content';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes (during render, not in an effect).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-2xl py-3'
          : 'border-b border-transparent bg-transparent py-4 sm:py-6',
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8 transition-all duration-300">
        <Link
          href="/"
          aria-label="ShiftSync home"
          className="group flex shrink-0 items-center mr-4 lg:mr-8"
        >
          <Image
            src="/logo/shiftsync-grey-logo.png"
            alt="ShiftSync"
            width={800}
            height={320}
            priority
            className="h-16 lg:h-16 w-auto transition-opacity group-hover:opacity-80 dark:hidden"
          />
          <Image
            src="/logo/shiftsync-white-logo.png"
            alt="ShiftSync"
            width={720}
            height={320}
            priority
            className="hidden h-16 lg:h-16 w-auto transition-opacity group-hover:opacity-80 dark:block"
          />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-1.5 bg-secondary/40 border border-border/50 rounded-full px-3 py-2 backdrop-blur-xl shadow-sm"
        >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-full px-5 py-2 text-[15px] font-semibold whitespace-nowrap transition-all duration-300',
                  active
                    ? 'text-primary-foreground bg-primary shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80',
                )}
              >
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ModeToggle />
          </div>
          <Button
            asChild
            variant="ghost"
            className="hidden rounded-full font-bold lg:inline-flex text-[15px] px-6 py-5 hover:bg-secondary border border-transparent hover:border-border/50 transition-all"
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="rounded-full shadow-lg font-bold text-[15px] px-6 py-5 hidden md:inline-flex hover:-translate-y-0.5 transition-transform"
          >
            <Link href="/register">Sign up</Link>
          </Button>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-foreground bg-secondary/50 border border-border/50 hover:bg-accent grid h-10 w-10 place-items-center rounded-full transition-colors lg:hidden shadow-sm backdrop-blur-md"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-[300px] h-full bg-secondary/80 backdrop-blur-2xl border-l border-border/40 shadow-2xl flex flex-col pt-8 px-6 animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-10 pl-2">
              <Image
                src="/logo/shiftsync-grey-logo.png"
                alt="ShiftSync"
                width={800}
                height={320}
                priority
                className="h-16 w-auto dark:hidden"
              />
              <Image
                src="/logo/shiftsync-white-logo.png"
                alt="ShiftSync"
                width={720}
                height={320}
                priority
                className="hidden h-16 w-auto dark:block"
              />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full bg-background/50 hover:bg-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Mobile primary" className="flex flex-col space-y-4 w-full">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'rounded-xl px-5 py-4 text-xl font-bold transition-all duration-200 border',
                      active
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'text-muted-foreground border-transparent hover:bg-accent/50 hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-8 flex flex-col gap-4 border-t border-border/40 pt-8">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl w-full h-14 text-lg font-bold"
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl w-full h-14 text-lg font-bold shadow-lg"
                >
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>

              <div className="mt-12 flex justify-start sm:hidden">
                <div className="bg-secondary/50 rounded-full p-2 border border-border/50">
                  <ModeToggle />
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
