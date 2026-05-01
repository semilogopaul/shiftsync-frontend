'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BackgroundDecoration } from './background-decoration';
import { cn } from '@/lib/utils';
import { MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AVATARS = [
  { id: 1, src: '/images/human-1.png', color: 'text-rose-500', bg: 'bg-rose-500' },
  { id: 2, src: '/images/human-2.png', color: 'text-blue-500', bg: 'bg-blue-500' },
  { id: 3, src: '/images/human-3.png', color: 'text-emerald-500', bg: 'bg-emerald-500' },
  { id: 4, src: '/images/human-4.png', color: 'text-amber-500', bg: 'bg-amber-500' },
];

export function Hero() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth > 640,
  );
  const [time, setTime] = useState(0);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth > 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setTime(Date.now() / 1000);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate min-h-[100dvh] overflow-hidden flex flex-col items-center justify-center pt-20 sm:pt-24 pb-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% -10%, color-mix(in oklab, var(--color-primary) 15%, transparent) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 80% 20%, color-mix(in oklab, hsl(280 100% 65%) 12%, transparent) 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 20% 60%, color-mix(in oklab, hsl(330 90% 62%) 10%, transparent) 0%, transparent 50%), var(--color-background)',
        }}
      />
      <BackgroundDecoration />

      {/* Orbiting Avatars — hidden on mobile to avoid crowding the text */}
      <div className="absolute inset-0 pointer-events-none z-10 hidden sm:flex items-center justify-center overflow-hidden">
        {AVATARS.map((avatar, i) => {
          const angle = (i * 360) / AVATARS.length + 45; // 45, 135, 225, 315
          const rad = (angle * Math.PI) / 180;

          // Smoother radii, farther to not overlap text
          const radiusXDesktop = 620;
          const radiusYDesktop = 360;
          const radiusXMobile = 220;
          const radiusYMobile = 380;

          const rx = Math.cos(rad);
          const ry = Math.sin(rad);

          // Give a floating effect combining simple trig
          // A softer, slower elegant float
          const floatY = Math.sin(time * 1.2 + i * 2) * 20;
          const floatX = Math.cos(time * 0.8 + i * 1.5) * 10;
          const rotation = Math.sin(time * 0.5 + i) * 5;

          return (
            <div
              key={avatar.id}
              className={cn(
                'absolute w-14 h-14 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 shadow-2xl z-10 border-background backdrop-blur-md',
              )}
              style={{
                transform: `
                  translate(
                    calc(${rx * (isDesktop ? radiusXDesktop : radiusXMobile)}px + ${floatX}px), 
                    calc(${ry * (isDesktop ? radiusYDesktop : radiusYMobile)}px + ${floatY}px)
                  )
                  rotate(${rotation}deg)
                `,
              }}
            >
              <Image
                src={avatar.src}
                alt={`Team member ${avatar.id}`}
                fill
                className="rounded-full object-cover"
              />

              <div
                className={cn('absolute -bottom-5 -right-5 drop-shadow-xl sm:block', avatar.color)}
              >
                <MousePointer2 className="w-8 h-8 fill-current stroke-white stroke-[1.5px]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-6 lg:px-8 text-center flex flex-col items-center z-20 mt-10 sm:mt-0">
        <h1
          id="hero-heading"
          className="text-[2rem] leading-[1.15] sm:text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto"
        >
          Scheduling made so easy,{' '}
          <span className="hidden sm:inline">
            <br />
          </span>
          <span className="bg-gradient-to-br from-primary via-fuchsia-500 to-rose-400 bg-clip-text text-transparent">
            it runs itself.
          </span>
        </h1>
        <p className="max-w-2xl text-base sm:text-xl text-muted-foreground mb-10 px-2 sm:px-0 leading-relaxed font-medium">
          Bring your whole team together. Watch shifts fill instantly. Say goodbye to spreadsheet
          chaos and frantic group chats.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center px-4 sm:px-0">
          <Button
            size="lg"
            asChild
            className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
          >
            <Link href="/register">Start for free</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl bg-secondary/50 backdrop-blur-md border-border/50 hover:bg-secondary transition-colors duration-300"
          >
            <Link href="/how-it-works">See how it works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
