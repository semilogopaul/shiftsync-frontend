"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BackgroundDecoration } from "./background-decoration";

export function ContactPage() {
  const [state, setState] = useState<"idle"|"sending"|"sent">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    await new Promise(r => setTimeout(r, 1200));
    setState("sent");
  };

  return (
    <section className="relative isolate min-h-[100dvh] flex items-center justify-center overflow-hidden py-24">
      <BackgroundDecoration />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="mx-auto max-w-5xl px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-16 items-center">
        
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Contact Us</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            We're real people <span className="opacity-50">who actually reply.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Sales question? Support issue? Curiosity? Drop us a line. We respond within one business day.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm text-muted-foreground font-medium">Email us</p>
                  <a href="mailto:hello@shiftsync.app" className="font-semibold hover:text-primary transition-colors">hello@shiftsync.app</a>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
                  <MessageSquare className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm text-muted-foreground font-medium">Response time</p>
                  <p className="font-semibold">Within 24 hours</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-secondary/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
          {state === "sent" ? (
             <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
                   <ArrowRight className="w-8 h-8 -rotate-45" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground max-w-sm">We'll get back to {form.email} as soon as we can.</p>
                <Button variant="outline" className="mt-8 rounded-full" onClick={() => { setState("idle"); setForm({name:"",email:"",message:""})}}>
                  Send another
                </Button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                 <Input 
                   required
                   placeholder="Your Name" 
                   value={form.name} 
                   onChange={e => setForm(p => ({...p, name: e.target.value}))} 
                   className="h-14 rounded-2xl bg-background/50" 
                 />
              </div>
              <div>
                 <Input 
                   required
                   type="email"
                   placeholder="Email Address" 
                   value={form.email} 
                   onChange={e => setForm(p => ({...p, email: e.target.value}))} 
                   className="h-14 rounded-2xl bg-background/50" 
                 />
              </div>
              <div>
                 <Textarea 
                   required
                   placeholder="How can we help?" 
                   rows={5}
                   value={form.message} 
                   onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm(p => ({...p, message: e.target.value}))} 
                   className="rounded-2xl bg-background/50 resize-none pt-4" 
                 />
              </div>
              <Button type="submit" disabled={state === "sending"} className="w-full h-14 rounded-full text-lg shadow-lg">
                {state === "sending" ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
