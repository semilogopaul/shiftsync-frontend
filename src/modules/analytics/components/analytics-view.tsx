"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocations } from "@/modules/locations";
import {
  useDistribution,
  useOvertime,
} from "../hooks/use-analytics";

const PRIMARY = "var(--color-primary)";
const TIPPING = "#ef4444";
const SOFT = "#94a3b8";

export function AnalyticsView() {
  const { data: locations = [] } = useLocations();
  const [locationId, setLocationId] = useState<string | "all">("all");
  const params = locationId === "all" ? {} : { locationId };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Analytics & insights
          </h1>
          <p className="text-muted-foreground text-sm">
            Overtime risk and hour distribution across the organisation.
          </p>
        </div>
        <Select value={locationId} onValueChange={setLocationId}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <OvertimePanel params={params} />
        <DistributionPanel params={params} />
      </div>
      <PremiumPanel params={params} />
    </section>
  );
}

interface PanelParams {
  readonly params: { readonly locationId?: string };
}

function OvertimePanel({ params }: PanelParams) {
  const query = useOvertime(params);
  const rows = query.data?.staff ?? [];
  const data = rows.map((row) => ({
    name: `${row.firstName} ${row.lastName.charAt(0)}.`,
    hours: Number(row.totalHours.toFixed(1)),
    tipping: Boolean(row.tippingAssignment),
  }));
  const flagged = data.filter((row) => row.hours >= 35).length;

  return (
    <ChartCard
      icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
      tone="amber"
      title="Overtime watch"
      subtitle="Projected weekly hours per staff. Red bars are at the OT tipping point."
      meta={
        flagged > 0 ? (
          <span className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold">
            {flagged} approaching OT
          </span>
        ) : null
      }
      isLoading={query.isLoading}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
          <YAxis stroke="var(--muted-foreground)" fontSize={11} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`${Number(value)} h`, "Projected"]}
          />
          <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "OT cap", fill: "#ef4444", fontSize: 10 }} />
          <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
            {data.map((row, index) => (
              <Cell
                key={`cell-${row.name}-${index}`}
                fill={row.tipping ? TIPPING : PRIMARY}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function DistributionPanel({ params }: PanelParams) {
  const query = useDistribution(params);
  const rows = query.data?.staff ?? [];
  const data = rows.map((row) => ({
    name: `${row.firstName} ${row.lastName.charAt(0)}.`,
    Scheduled: Number(row.totalHours.toFixed(1)),
    Desired: Number((row.desiredHoursForWindow ?? row.desiredWeeklyHours ?? 0).toFixed(1)),
  }));

  // Roll up the schedule-status chips so the manager can see at a glance how
  // many people are under-/over-scheduled relative to their stated desired
  // hours. The full per-staff breakdown is rendered in the table below.
  const counts = rows.reduce(
    (acc, row) => {
      acc[row.scheduleStatus] = (acc[row.scheduleStatus] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const summary =
    rows.length === 0
      ? "No data."
      : [
          counts.UNDER ? `${counts.UNDER} under` : null,
          counts.ON_TARGET ? `${counts.ON_TARGET} on target` : null,
          counts.OVER ? `${counts.OVER} over` : null,
        ]
          .filter(Boolean)
          .join(" · ") || "No desired hours set.";

  return (
    <ChartCard
      icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}
      tone="primary"
      title="Hours distribution"
      subtitle="Scheduled vs desired hours per staff."
      meta={
        rows.length > 0 ? (
          <span className="text-muted-foreground border-border/60 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium">
            {summary}
          </span>
        ) : null
      }
      isLoading={query.isLoading}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
          <YAxis stroke="var(--muted-foreground)" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="Scheduled" fill={PRIMARY} radius={[6, 6, 0, 0]} />
          <Bar dataKey="Desired" fill={SOFT} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {rows.length > 0 ? (
        <ul className="border-border/40 mt-4 divide-y rounded-xl border">
          {rows.map((row) => (
            <li
              key={row.userId}
              className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
            >
              <span className="text-foreground truncate font-medium">
                {row.firstName} {row.lastName}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {row.totalHours.toFixed(1)}h
                {row.desiredHoursForWindow != null
                  ? ` / ${row.desiredHoursForWindow.toFixed(1)}h`
                  : ""}
              </span>
              <ScheduleStatusChip status={row.scheduleStatus} />
            </li>
          ))}
        </ul>
      ) : null}
    </ChartCard>
  );
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

/**
 * Premium-shift distribution. Surfaces both how many premium hours each staff
 * member has worked AND the per-staff fairness score the BE computes against
 * the org-wide premium share. Lets managers answer the "I never get Saturday
 * nights" complaint at a glance.
 */
function PremiumPanel({ params }: PanelParams) {
  const query = useDistribution(params);
  const rows = query.data?.staff ?? [];
  const data = rows
    .filter((row) => row.totalHours > 0)
    .map((row) => ({
      name: `${row.firstName} ${row.lastName.charAt(0)}.`,
      Premium: Number(row.premiumHours.toFixed(1)),
      fairness: row.fairnessScore,
    }));
  const orgShare = query.data?.org.premiumShare ?? 0;
  const totalPremium = query.data?.org.totalPremiumHours ?? 0;

  return (
    <ChartCard
      icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
      tone="fuchsia"
      title="Premium shift distribution"
      subtitle={`Org-wide ${(orgShare * 100).toFixed(1)}% of hours are premium · ${totalPremium.toFixed(1)}h total`}
      isLoading={query.isLoading}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
          <YAxis stroke="var(--muted-foreground)" fontSize={11} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, _name, ctx) => [
              `${Number(value ?? 0)} h · fairness ${(ctx?.payload as { fairness?: number } | undefined)?.fairness ?? "-"}/100`,
              "Premium",
            ]}
          />
          <Bar dataKey="Premium" radius={[6, 6, 0, 0]}>
            {data.map((row, index) => (
              <Cell
                key={`prem-${row.name}-${index}`}
                fill={row.fairness >= 80 ? PRIMARY : row.fairness >= 60 ? "#f59e0b" : TIPPING}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface ChartCardProps {
  readonly icon: React.ReactNode;
  readonly tone: "primary" | "amber" | "fuchsia" | "sky";
  readonly title: string;
  readonly subtitle: string;
  readonly meta?: React.ReactNode;
  readonly isLoading: boolean;
  readonly isEmpty: boolean;
  readonly children: React.ReactNode;
}

function ChartCard({
  icon,
  tone,
  title,
  subtitle,
  meta,
  isLoading,
  isEmpty,
  children,
}: ChartCardProps) {
  const toneClass =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "amber"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : tone === "fuchsia"
          ? "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
          : "bg-sky-500/10 text-sky-600 dark:text-sky-400";

  return (
    <div className="border-border/60 bg-card/40 rounded-3xl border p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${toneClass}`}>
            {icon}
          </span>
          <div>
            <h2 className="text-foreground text-base font-semibold">{title}</h2>
            <p className="text-muted-foreground text-xs">{subtitle}</p>
          </div>
        </div>
        {meta}
      </header>

      <div className="mt-4">
        {isLoading ? (
          <div className="text-muted-foreground flex h-[260px] items-center justify-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading…
          </div>
        ) : isEmpty ? (
          <div className="text-muted-foreground flex h-[260px] items-center justify-center text-sm">
            No data yet.
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/**
 * Per-staff status chip rendered next to the distribution table. Maps the
 * backend `scheduleStatus` to a colored pill so a manager can answer
 * "is anyone under-/over-scheduled relative to their stated desired hours?"
 * at a glance — required by review.txt §5.
 */
function ScheduleStatusChip({
  status,
}: {
  readonly status: "OK" | "UNDER" | "ON_TARGET" | "OVER" | "UNKNOWN";
}) {
  const map: Record<typeof status, { label: string; className: string }> = {
    OK: {
      label: "OK",
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    ON_TARGET: {
      label: "On target",
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    UNDER: {
      label: "Under",
      className:
        "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    },
    OVER: {
      label: "Over",
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    UNKNOWN: {
      label: "—",
      className:
        "border-border/60 bg-muted/30 text-muted-foreground",
    },
  };
  const { label, className } = map[status];
  return (
    <span
      className={
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
        className
      }
    >
      {label}
    </span>
  );
}
