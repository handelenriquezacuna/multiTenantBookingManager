"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { AvailabilityBlock } from "@/types/availability";

export function DatetimeSelection({ slug, blocks }: { slug: string; blocks: AvailabilityBlock[] }) {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service") || "";
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const available = blocks.filter((block) => !block.isReserved);

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium tracking-tight">Escoge fecha y hora</h1>
      <p className="mt-2 text-muted-foreground">
        Solo se muestran horarios disponibles para reservar.
      </p>

      <div className="mt-6">
        {available.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No hay horarios disponibles por ahora.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {available.map((block) => {
              const selected = selectedBlockId === block.availabilityBlockId;
              return (
                <button
                  type="button"
                  key={block.availabilityBlockId}
                  onClick={() => setSelectedBlockId(block.availabilityBlockId)}
                  aria-pressed={selected}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-accent/60"
                  }`}
                >
                  <span className="text-xs text-muted-foreground">{block.blockDate}</span>
                  <strong className="text-sm font-semibold">
                    {block.startTime} - {block.endTime}
                  </strong>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Link href={`/book/${slug}/service`} className={buttonVariants({ variant: "outline" })}>
          Volver
        </Link>
        {selectedBlockId ? (
          <Link
            href={`/book/${slug}/customer?service=${serviceId}&block=${selectedBlockId}`}
            className={buttonVariants()}
          >
            Continuar
          </Link>
        ) : (
          <span className={`${buttonVariants()} pointer-events-none opacity-50`}>
            Selecciona un horario
          </span>
        )}
      </div>
    </div>
  );
}
