"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPatch } from "@/lib/api-client";
import { messageFromError } from "@/common/utils/error-message";
import { toast } from "sonner";
import { useCurrentUser } from "@/modules/auth";
import { MyCertificationsPanel } from "@/modules/certifications";

interface Settings {
  readonly notifyInApp: boolean;
  readonly notifyEmail: boolean;
  readonly desiredWeeklyHours: number;
}

const KEY = ["settings", "me"] as const;

export function SettingsView() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const query = useQuery({
    queryKey: KEY,
    queryFn: () => apiGet<Settings>("/users/me"),
  });
  const [form, setForm] = useState<Settings>({
    notifyInApp: true,
    notifyEmail: true,
    desiredWeeklyHours: 40,
  });

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const save = useMutation({
    mutationFn: async (input: Settings) => {
      await apiPatch<Settings, { notifyInApp: boolean; notifyEmail: boolean }>(
        "/users/me/notifications",
        { notifyInApp: input.notifyInApp, notifyEmail: input.notifyEmail },
      );
      return apiPatch<Settings, { desiredWeeklyHours: number }>(
        "/users/me/desired-hours",
        { desiredWeeklyHours: input.desiredWeeklyHours },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Settings saved.");
    },
    onError: (error) => {
      toast.error(messageFromError(error, "Could not save settings."));
    },
  });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Notifications and preferences.
        </p>
      </header>

      {query.isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading…
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(form);
          }}
          className="border-border/60 bg-card/40 max-w-xl space-y-6 rounded-3xl border p-6"
        >
          <fieldset className="space-y-3">
            <legend className="text-foreground text-base font-semibold">
              Notifications
            </legend>
            <Label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={form.notifyInApp}
                onCheckedChange={(value) =>
                  setForm((prev) => ({ ...prev, notifyInApp: value === true }))
                }
              />
              Show in-app notifications
            </Label>
            <Label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={form.notifyEmail}
                onCheckedChange={(value) =>
                  setForm((prev) => ({ ...prev, notifyEmail: value === true }))
                }
              />
              Send email notifications
            </Label>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="desired">Desired weekly hours</Label>
            <Input
              id="desired"
              type="number"
              min={0}
              max={80}
              value={form.desiredWeeklyHours}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  desiredWeeklyHours: Number(event.target.value || 0),
                }))
              }
              className="max-w-[180px]"
            />
            <p className="text-muted-foreground text-xs">
              Used by analytics to compare your scheduled hours against what
              you’d like.
            </p>
          </div>

          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Save changes
          </Button>
        </form>
      )}

      {currentUser?.role === "EMPLOYEE" && currentUser.id ? (
        <MyCertificationsPanel userId={currentUser.id} />
      ) : null}
    </section>
  );
}
