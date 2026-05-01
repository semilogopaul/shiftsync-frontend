import { RoleGate } from "@/modules/app-shell";
import { AuditView } from "@/modules/audit";

export default function Page() {
  return (
    <RoleGate allow={["ADMIN"]}>
      <AuditView />
    </RoleGate>
  );
}
