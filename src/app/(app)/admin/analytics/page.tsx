import { RoleGate } from "@/modules/app-shell";
import { AnalyticsView } from "@/modules/analytics";

export default function Page() {
  return (
    <RoleGate allow={["MANAGER", "ADMIN"]}>
      <AnalyticsView />
    </RoleGate>
  );
}
