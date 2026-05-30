import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { BookingShell } from "@/components/layout/BookingShell";
import { mockServices } from "@/lib/mock-data";

export default async function ServiceSelectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <BookingShell>
      <ServiceSelection slug={slug} services={mockServices} />
    </BookingShell>
  );
}
