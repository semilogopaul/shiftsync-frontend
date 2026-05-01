import { FEATURES } from "../data/content";
import Image from "next/image";
import { BackgroundDecoration } from "./background-decoration";
import { CheckCircle2 } from "lucide-react";

export function FeatureGrid() {
  return (
    <section className="relative isolate min-h-[100dvh] flex items-center justify-center overflow-hidden pt-36 pb-24">
      <BackgroundDecoration />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-500/10 via-transparent to-transparent" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Core Features</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Everything you need. <br />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </h1>
          
          <div className="space-y-8 mt-8">
            {FEATURES.slice(0, 4).map((feature) => {
              return (
                <div key={feature.title} className="flex gap-5 group">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="relative h-[500px] rounded-3xl bg-secondary/30 border border-border/50 backdrop-blur-3xl flex items-center justify-center p-8 shadow-2xl">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
          <Image
            src="/mascot/mascot.png"
            alt="ShiftSync Mascot"
            width={500}
            height={500}
            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </section>
  );
}
