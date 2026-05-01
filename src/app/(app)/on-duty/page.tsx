import { RoleGate } from "@/modules/app-shell";
import { OnDutyView } from "@/modules/on-duty";

export default function Page() {
  return (
    <RoleGate allow={["MANAGER", "ADMIN"]}>
      <OnDutyView />
    </RoleGate>
  );
}
