import { BusinessHoursManager } from "@/components/admin/BusinessHoursManager";
import { PrivateShell } from "@/components/layout/PrivateShell";

export default function BusinessHoursPage() {
  return (
    <PrivateShell>
      <BusinessHoursManager />
    </PrivateShell>
  );
}
