"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "../data/content";
import { BackgroundDecoration } from "./background-decoration";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative isolate min-h-[100dvh] flex items-center justify-center overflow-hidden py-24">
      <BackgroundDecoration />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="mx-auto max-w-4xl px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">FAQ</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
            Questions you're <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">probably thinking.</span>
          </h1>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div 
                key={i} 
                className={cn(
                  "border rounded-2xl bg-secondary/30 backdrop-blur-sm overflow-hidden transition-all",
                  isOpen ? "border-primary/50 shadow-md bg-secondary/50" : "border-border/50 hover:bg-secondary/40"
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-lg">{item.question}</span>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isOpen && "rotate-180")} />
                </button>
                <div 
                  className={cn(
                    "px-6 text-muted-foreground transition-all duration-300 ease-in-out origin-top",
                    isOpen ? "pb-6 max-h-96 opacity-100" : "max-h-0 pb-0 opacity-0 overflow-hidden"
                  )}
                >
                  <p className="leading-relaxed">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
