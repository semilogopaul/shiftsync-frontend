import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  CalendarClock,
  ChartLine,
  Globe2,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Zap,
} from "lucide-react";

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface Feature {
  readonly title: string;
  readonly description: string;
  readonly Icon: LucideIcon;
  readonly accent: "primary" | "emerald" | "amber" | "rose" | "sky" | "violet";
}

export interface PainPoint {
  readonly pain: string;
  readonly answer: string;
  readonly Icon: LucideIcon;
}

export interface Stat {
  readonly value: string;
  readonly label: string;
}

export interface Step {
  readonly index: string;
  readonly title: string;
  readonly description: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Why ShiftSync", href: "/why" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const STATS: readonly Stat[] = [
  { value: "4", label: "Locations, one schedule" },
  { value: "2", label: "Timezones handled natively" },
  { value: "<60s", label: "From callout to coverage" },
  { value: "0", label: "Spreadsheets required" },
] as const;

export const FEATURES: readonly Feature[] = [
  {
    title: "Smart shift validation",
    description:
      "Every assignment clears a 9-rule validator — skills, certifications, availability windows, rest periods, double-booking, and overtime thresholds. Override with reason when life demands it, and every exception is logged.",
    Icon: ShieldCheck,
    accent: "primary",
  },
  {
    title: "Last-minute coverage, solved",
    description:
      "When a server calls out at 6pm for a 7pm shift, the on-call manager gets an urgent push with five qualified replacements. One tap reassigns. Full audit trail. Crisis averted.",
    Icon: Zap,
    accent: "amber",
  },
  {
    title: "Overtime before it costs you",
    description:
      "Live projections of weekly hours per staff member, flagging the exact assignment that tips someone past 35h or 40h — before payroll closes, not after.",
    Icon: ChartLine,
    accent: "emerald",
  },
  {
    title: "Shift swaps with guardrails",
    description:
      "Staff trade shifts among themselves; managers approve. Pending swaps auto-cancel when shifts change. Drops expire 24 hours before start so you're never blindsided.",
    Icon: ArrowLeftRight,
    accent: "violet",
  },
  {
    title: "Multi-timezone, no headaches",
    description:
      "Every location has its own IANA timezone. DST transitions, recurring availability, and overnight shifts are handled by the same validation engine — not your sanity.",
    Icon: Globe2,
    accent: "sky",
  },
  {
    title: "Fairness, visible",
    description:
      "Premium-shift distribution, per-staff fairness scores, and who's under or over their desired hours. Answer \"I never get Saturdays\" with one chart, not an argument.",
    Icon: Sparkles,
    accent: "rose",
  },
] as const;

export const PAIN_POINTS: readonly PainPoint[] = [
  {
    pain: "Staff calling out with no coverage plan",
    answer:
      "Self-callout surfaces up to five qualified replacements to managers in real time. One tap reassigns with a full audit trail attached.",
    Icon: Timer,
  },
  {
    pain: "Overtime costs spiraling out of view",
    answer:
      "Per-week projections pinpoint the exact assignment crossing 40h. Warnings fire on every assignment — not when payroll already processed it.",
    Icon: ChartLine,
  },
  {
    pain: "\"Unfair schedule\" complaints every week",
    answer:
      "Premium-shift fairness scores per staff member, scoped by location and date range. Defend or correct the schedule in seconds.",
    Icon: Users,
  },
  {
    pain: "Who's actually working right now?",
    answer:
      "Live on-duty board per location with real-time clock-in updates over WebSocket. No refresh, no guessing.",
    Icon: CalendarClock,
  },
  {
    pain: "Managers locked into one location's talent",
    answer:
      "Multi-location certifications make cross-location coverage real. Admins see the global view. No one is hoarding great employees.",
    Icon: Globe2,
  },
] as const;

export const STEPS: readonly Step[] = [
  {
    index: "01",
    title: "Set up locations & staff",
    description:
      "Define each location, its timezone, the skills required, and which staff are certified to work there. Takes minutes, not hours.",
  },
  {
    index: "02",
    title: "Build and validate the week",
    description:
      "Create shifts, assign staff with live validation, run a what-if preview before confirming, and publish the schedule to everyone in one click.",
  },
  {
    index: "03",
    title: "Run the floor, stay in control",
    description:
      "Staff swap, drop, and clock in from their phones. Managers approve, override when needed, and watch overtime projections update in real time.",
  },
] as const;

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Does ShiftSync handle multiple timezones?",
    answer:
      "Yes — every location has its own IANA timezone. Recurring availability, DST transitions, and overnight shifts (e.g. 11pm–3am) are all handled natively by the validation engine.",
  },
  {
    question: "What happens when a staff member calls out last minute?",
    answer:
      "The self-callout flow removes them from the shift, computes up to five qualified replacements, and sends an URGENT notification (in-app + email) to every manager of that location — with a one-tap reassign action.",
  },
  {
    question: "How do you prevent overtime surprises?",
    answer:
      "The validator warns at 35h (approaching) and 40h (over cap) on every single assignment, fires real-time notifications, and surfaces the exact tipping assignment in the analytics overtime dashboard.",
  },
  {
    question: "Is every action audited?",
    answer:
      "Yes. Every shift creation, edit, assignment, override, swap, drop, clock event, and login is captured in an append-only audit log. Admins can export to CSV scoped by date range and location.",
  },
  {
    question: "How is the platform secured?",
    answer:
      "HTTP-only cookies for auth, refresh-token rotation with replay detection, rate-limited login and forgot-password endpoints, role-based access control (Employee, Manager, Admin), and passwords hashed with argon2id.",
  },
  {
    question: "Can I try it before committing?",
    answer:
      "Absolutely. Create a free account — no credit card required. You can set up a full location with real staff and run a live schedule in under 15 minutes.",
  },
] as const;

