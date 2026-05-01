import { RoleGate } from "@/modules/app-shell";
import { UsersAdminView } from "@/modules/users/components/users-admin-view";

export default function Page() {
  return (
    <RoleGate allow={["ADMIN"]}>
      <UsersAdminView />
    </RoleGate>
  );
}
