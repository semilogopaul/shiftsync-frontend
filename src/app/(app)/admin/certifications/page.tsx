import { RoleGate } from "@/modules/app-shell";
import { CertificationsView } from "@/modules/certifications";

export default function Page() {
  return (
    <RoleGate allow={["MANAGER", "ADMIN"]}>
      <CertificationsView />
    </RoleGate>
  );
}
