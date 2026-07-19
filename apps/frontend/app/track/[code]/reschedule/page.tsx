"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BookingShell } from "@/components/layout/BookingShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { ApiError, apiPost, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { mockAvailability } from "@/lib/mock-data";

export default function TrackReschedulePage() {
  const params = useParams<{ code: string }>();
  const code = params?.code ?? "";
  const slots = mockAvailability.filter((block) => !block.isReserved);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!selected) return;
    setError(null);
    if (isMockMode()) {
      setDone(true);
      return;
    }
    setLoading(true);
    try {
      await apiPost(endpoints.track.reschedule(code), { newAvailabilityBlockId: selected });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail || err.title : "No se pudo reagendar la reserva.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BookingShell>
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        {done ? (
          <>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              Reserva reagendada
            </span>
            <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight">Nuevo horario confirmado</h1>
            <p className="mt-2 text-muted-foreground">
              Tu reserva <span className="font-mono">{code}</span> quedo reagendada.
            </p>
            <div className="mt-6">
              <Link href={`/track/${code}`} className={buttonVariants()}>
                Ver detalle
              </Link>
            </div>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              Reagendar reserva
            </span>
            <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight">Elige un nuevo horario</h1>
            <p className="mt-2 text-muted-foreground">Solo se muestran horarios disponibles.</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {slots.map((slot) => {
                const isSelected = selected === slot.availabilityBlockId;
                return (
                  <button
                    type="button"
                    key={slot.availabilityBlockId}
                    onClick={() => setSelected(slot.availabilityBlockId)}
                    className={`flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-soft"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">{slot.blockDate}</span>
                    <strong className="text-sm font-semibold">
                      {slot.startTime} - {slot.endTime}
                    </strong>
                  </button>
                );
              })}
            </div>

            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/track/${code}`} className={buttonVariants({ variant: "outline" })}>
                Volver al detalle
              </Link>
              <Button onClick={submit} disabled={!selected || loading}>
                {loading ? "Reagendando..." : "Confirmar nuevo horario"}
              </Button>
            </div>
          </>
        )}
      </div>
    </BookingShell>
  );
}
