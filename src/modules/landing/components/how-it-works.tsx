import { STEPS } from "../data/content";
import Image from "next/image";
import { BackgroundDecoration } from "./background-decoration";

export function HowItWorks() {
  return (
    <section className="relative isolate min-h-[100dvh] flex items-center justify-center overflow-hidden pt-36 pb-24">
      <BackgroundDecoration />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative h-[500px] rounded-3xl bg-secondary/30 border border-border/50 backdrop-blur-3xl flex items-center justify-center p-8 shadow-2xl order-last lg:order-first">
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-3xl" />
          <Image
            src="/mascot/mascot-alt.png"
            alt="ShiftSync Mascot working"
            width={500}
            height={500}
            className="object-contain drop-shadow-2xl hover:-rotate-3 transition-transform duration-500"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-3">How It Works</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-12">
            Three simple steps to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-primary">sanity.</span>
          </h1>
          
          <div className="space-y-10">
            {STEPS.map((step, idx) => {
              return (
                <div key={step.title} className="relative flex gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-background border-2 border-primary text-xl font-bold z-10 shadow-md">
                    {idx + 1}
                  </div>
                  {idx !== STEPS.length - 1 && (
                    <div className="absolute top-14 left-7 w-0.5 h-full -ml-px bg-border z-0" />
                  )}
                  <div className="pt-3">
                    <h3 className="font-semibold text-xl mb-1">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
