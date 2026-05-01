import { Hero } from "./hero";
import { LandingHeader } from "./landing-header";

/**
 * Home page — hero section only. All other sections live on their own routes:
 *   /features, /how-it-works, /why, /faq, /contact
 */
export function LandingPage() {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-[100] m-2 rounded-md px-3 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:left-2 focus:top-2"
      >
        Skip to content
      </a>
      <LandingHeader />
      <main id="main" className="flex-1">
        <Hero />
      </main>
    </div>
  );
}
