import { Suspense } from "react";
import { CustomerStep } from "@/components/booking/CustomerStep";
import { BookingShell } from "@/components/layout/BookingShell";

export default async function CustomerDataPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <BookingShell>
      <Suspense fallback={<p>Cargando formulario...</p>}>
        <CustomerStep slug={slug} />
      </Suspense>
    </BookingShell>
  );
}
