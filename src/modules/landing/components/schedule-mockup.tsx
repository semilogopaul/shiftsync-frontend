import { Bell, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotProps {
  readonly name: string;
  readonly role: string;
  readonly time: string;
  readonly tone: "ok" | "warn" | "live";
}

const SLOTS: readonly SlotProps[] = [
  { name: "Sarah K.", role: "Bartender", time: "5pm – 11pm", tone: "ok" },
  { name: "Maria L.", role: "Server", time: "5pm – 12am", tone: "live" },
  { name: "Jordan P.", role: "Line cook", time: "4pm – 12am", tone: "warn" },
  { name: "Alex R.", role: "Host", time: "5pm – 10pm", tone: "ok" },
] as const;

const TONE_STYLES: Record<SlotProps["tone"], string> = {
  ok: "border-emerald-500/30 bg-emerald-500/5",
  warn: "border-amber-500/30 bg-amber-500/5",
  live: "border-primary/40 bg-primary/5",
};

const TONE_DOT: Record<SlotProps["tone"], string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  live: "bg-primary",
};

const TONE_LABEL: Record<SlotProps["tone"], string> = {
  ok: "Confirmed",
  warn: "Approaching 40h",
  live: "On duty now",
};

/**
 * Stylised schedule preview for the hero. Static markup (no real data); a
 * subtle pulse on the "live" badge sells the realtime story.
 */
export function ScheduleMockup() {
  return (
    <div
      role="img"
      aria-label="Preview of the ShiftSync schedule view showing four staff members assigned to a Friday evening shift"
      className="border-border/60 bg-card/80 relative w-full overflow-hidden rounded-3xl border shadow-2xl backdrop-blur"
    >
      {/* Top bar */}
      <div className="border-border/60 flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Coastal Eats · Pacific Pier
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
            <span className="bg-emerald-500 inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
            Live
          </span>
          <Bell className="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      {/* Date strip */}
      <div className="grid grid-cols-7 gap-1 border-border/60 border-b px-6 py-3 text-[10px] font-medium uppercase tracking-wider">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={`${d}-${i}`}
            className={cn(
              "rounded-md py-1 text-center",
              i === 4
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Slots */}
      <ul className="space-y-2 p-4">
        {SLOTS.map((slot) => (
          <li
            key={slot.name}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
              TONE_STYLES[slot.tone],
            )}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="bg-background grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
              >
                {slot.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div className="leading-tight">
                <p className="font-semibold">{slot.name}</p>
                <p className="text-muted-foreground text-xs">{slot.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:inline-flex">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {slot.time}
              </span>
              <span className="bg-background inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider">
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[slot.tone])}
                />
                {TONE_LABEL[slot.tone]}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="border-border/60 flex items-center justify-between border-t px-6 py-4 text-xs">
        <span className="text-muted-foreground inline-flex items-center gap-2">
          <CheckCircle2
            className="h-3.5 w-3.5 text-emerald-500"
            aria-hidden="true"
          />
          All assignments validated · 0 conflicts
        </span>
        <span className="text-primary font-semibold">+ Add shift</span>
      </div>
    </div>
  );
}
