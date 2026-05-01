import { cn } from "@/lib/utils";

interface BackgroundDecorationProps {
  readonly className?: string;
}

/**
 * Decorative gradient blobs + grid that sit behind the hero. Pointer events
 * disabled so they never interfere with content interaction.
 */
export function BackgroundDecoration({ className }: BackgroundDecorationProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Soft grid */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--color-foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-foreground) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at top, black 30%, transparent 70%)",
        }}
      />
      {/* Primary blob */}
      <div className="animate-blob absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_color-mix(in_oklab,_var(--color-primary)_55%,_transparent)_0%,_transparent_65%)] blur-3xl" />
      {/* Secondary blob */}
      <div className="animate-blob animation-delay-2000 absolute right-[-10%] top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_color-mix(in_oklab,_hsl(195_100%_60%)_45%,_transparent)_0%,_transparent_65%)] blur-3xl" />
      {/* Tertiary blob */}
      <div className="animate-blob animation-delay-4000 absolute bottom-[-10%] left-[-10%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,_color-mix(in_oklab,_hsl(330_85%_65%)_40%,_transparent)_0%,_transparent_65%)] blur-3xl" />
    </div>
  );
}
