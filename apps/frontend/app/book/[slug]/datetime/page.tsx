import { Suspense } from "react";
import { DatetimeSelection } from "@/components/booking/DatetimeSelection";
import { BookingShell } from "@/components/layout/BookingShell";
import { mockAvailability } from "@/lib/mock-data";

export default async function DatetimeSelectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <BookingShell>
      <Suspense fallback={<p>Cargando horarios...</p>}>
        <DatetimeSelection slug={slug} blocks={mockAvailability} />
      </Suspense>
    </BookingShell>
  );
}
