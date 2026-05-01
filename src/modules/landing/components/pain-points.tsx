import { PAIN_POINTS } from "../data/content";
import { XCircle, CheckCircle2 } from "lucide-react";
import { BackgroundDecoration } from "./background-decoration";
import Image from "next/image";

export function PainPoints() {
  return (
    <section className="relative isolate min-h-[100dvh] flex items-center justify-center overflow-hidden py-24">
      <BackgroundDecoration />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid xl:grid-cols-2 gap-16 items-center">
        
        <div className="flex flex-col justify-center space-y-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Why ShiftSync</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
              Stop letting spreadsheets <span className="italic text-primary">dictate your life.</span>
            </h1>
          </div>
          
          <div className="space-y-8">
            {PAIN_POINTS.slice(0, 3).map((point) => (
              <div key={point.pain} className="group">
                <div className="flex gap-3 text-foreground/80 mb-2">
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-muted-foreground" />
                  <p className="font-semibold">{point.pain}</p>
                </div>
                <div className="flex gap-3 text-foreground ml-8 pl-4 border-l-2 border-primary/30">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                  <p className="text-muted-foreground">{point.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[600px] w-full rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center">
          <Image 
            src="/images/professional-man.jpeg"
            alt="Professional tracking shifts"
            fill
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
