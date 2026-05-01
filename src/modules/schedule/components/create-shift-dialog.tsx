"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValidationFindingsList } from "@/common/components/validation-findings-list";
import {
  formatTimeRange,
  isOvernight,
  wallTimeInZoneToUtcIso,
} from "@/common/utils/datetime";
import { useLocations } from "@/modules/locations";
import { useSkills } from "@/modules/skills";
import { useShiftMutations } from "../hooks/use-shifts";

interface CreateShiftDialogProps {
  readonly onClose: () => void;
}

const shiftDateByDays = (isoDate: string, days: number): string => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
};

export function CreateShiftDialog({ onClose }: CreateShiftDialogProps) {
  const { data: locations = [] } = useLocations();
  const { data: skills = [] } = useSkills();
  const mutations = useShiftMutations();

  const [locationId, setLocationId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [headcount, setHeadcount] = useState(1);
  const [skillId, setSkillId] = useState<string>("none");
  const [notes, setNotes] = useState("");

  const selectedLocation = locations.find((l) => l.id === locationId);
  const overnight = isOvernight(startTime, endTime);

  // Live "this will save as" preview rendered in the location's own zone so
  // managers can confirm the wall-clock interpretation before submitting.
  const preview = useMemo(() => {
    if (!selectedLocation) return null;
    try {
      const startsAt = wallTimeInZoneToUtcIso(date, startTime, selectedLocation.timezone);
      const endDate = overnight ? shiftDateByDays(date, 1) : date;
      const endsAt = wallTimeInZoneToUtcIso(endDate, endTime, selectedLocation.timezone);
      return {
        startsAt,
        endsAt,
        label: formatTimeRange(startsAt, endsAt, selectedLocation.timezone),
      };
    } catch {
      return null;
    }
  }, [date, startTime, endTime, overnight, selectedLocation]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!locationId || !skillId || skillId === "none" || !preview) return;
    mutations.create.mutate(
      {
        locationId,
        startsAt: preview.startsAt,
        endsAt: preview.endsAt,
        headcount,
        skillId,
        notes: notes.trim() || null,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="bg-background/80 absolute inset-0 backdrop-blur-sm"
      />
      <div className="bg-card border-border/60 absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 shadow-2xl">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">New shift</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Drafts won’t be visible to staff until you publish.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Pick a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start</Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End</Label>
              <Input
                id="end"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="headcount">Headcount</Label>
              <Input
                id="headcount"
                type="number"
                min={1}
                value={headcount}
                onChange={(event) =>
                  setHeadcount(Math.max(1, Number(event.target.value)))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill">Required skill</Label>
              <Select value={skillId} onValueChange={setSkillId}>
                <SelectTrigger id="skill">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional"
            />
          </div>

          {selectedLocation && preview ? (
            <p className="border-border/60 bg-muted/40 text-muted-foreground rounded-lg border px-3 py-2 text-xs">
              Will save as {preview.label} ({selectedLocation.timezone})
              {overnight ? " — overnight, ends next day" : ""}
            </p>
          ) : null}

          <ValidationFindingsList
            error={mutations.create.error}
            fallback="Could not create shift."
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!locationId || !preview || mutations.create.isPending}
            >
              {mutations.create.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Create draft
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
