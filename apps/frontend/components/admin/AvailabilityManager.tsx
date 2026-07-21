"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { selectClass } from "@/components/ui/page-header";
import { ErrorBanner, ManagerHeader } from "@/components/admin/manager-ui";
import { apiDelete, apiGet, apiPost, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { errMessage, useResource } from "@/lib/resource";
import { mockAvailability } from "@/lib/mock-data";
import type { AvailabilityBlock } from "@/types/availability";

type Location = { locationId: number; name: string };
type HoursApiRow = { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean };

const mockLocations: Location[] = [{ locationId: 1, name: "Sede central" }];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function AvailabilityManager() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [locationId, setLocationId] = useState<number>(mockLocations[0].locationId);
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(plusDaysIso(7));
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    items: blocks,
    setItems: setBlocks,
    loading,
    error,
    setError,
    reload
  } = useResource<AvailabilityBlock>(`${endpoints.availabilityBlocks.list}?pageSize=100`, mockAvailability);

  useEffect(() => {
    if (isMockMode()) return;
    apiGet<{ items: Location[] }>(endpoints.locations.list)
      .then((res) => {
        if (res.items.length === 0) return;
        setLocations(res.items);
        setLocationId(res.items[0].locationId);
      })
      .catch(() => undefined);
  }, []);

  async function generateSlots() {
    setError(null);
    setNotice(null);

    if (isMockMode()) {
      setNotice("Modo demo: la generacion real de bloques requiere la API.");
      return;
    }

    setGenerating(true);
    try {
      const hours = await apiGet<HoursApiRow[]>(`${endpoints.businessHours}?locationId=${locationId}`);
      const byDow = new Map(hours.map((h) => [h.dayOfWeek, h]));

      const plan: { blockDate: string; startTime: string; endTime: string }[] = [];
      const start = new Date(`${fromDate}T00:00:00`);
      const end = new Date(`${toDate}T00:00:00`);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay();
        const day = byDow.get(dow);
        if (!day || day.isClosed || !day.openTime || !day.closeTime) continue;

        const openMin = toMinutes(day.openTime.slice(0, 5));
        const closeMin = toMinutes(day.closeTime.slice(0, 5));
        const isoDate = d.toISOString().slice(0, 10);

        for (let t = openMin; t + durationMinutes <= closeMin; t += durationMinutes + breakMinutes) {
          plan.push({ blockDate: isoDate, startTime: toHHMM(t), endTime: toHHMM(t + durationMinutes) });
        }
      }

      if (plan.length === 0) {
        setError("No hay dias abiertos en ese rango segun los horarios configurados de esta sede.");
        return;
      }

      setProgress({ done: 0, total: plan.length });
      const created: AvailabilityBlock[] = [];
      for (const slot of plan) {
        try {
          const block = await apiPost<AvailabilityBlock>(endpoints.availabilityBlocks.list, {
            locationId,
            blockDate: slot.blockDate,
            startTime: slot.startTime,
            endTime: slot.endTime
          });
          created.push(block);
        } catch {
          // un bloque duplicado/invalido no debe abortar el resto del lote
        }
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      }

      setBlocks((current) => [...current, ...created]);
      setNotice(`Se crearon ${created.length} de ${plan.length} horarios disponibles.`);
    } catch (err) {
      setError(errMessage(err, "No se pudieron generar los horarios."));
    } finally {
      setGenerating(false);
      setProgress(null);
    }
  }

  async function deleteBlock(block: AvailabilityBlock) {
    if (isMockMode()) {
      setBlocks((current) => current.filter((b) => b.availabilityBlockId !== block.availabilityBlockId));
      return;
    }
    setError(null);
    try {
      await apiDelete(endpoints.availabilityBlocks.byId(block.availabilityBlockId));
      setBlocks((current) => current.filter((b) => b.availabilityBlockId !== block.availabilityBlockId));
    } catch (err) {
      setError(errMessage(err, "No se pudo eliminar el horario."));
    }
  }

  const upcoming = [...blocks].sort((a, b) => (a.blockDate + a.startTime).localeCompare(b.blockDate + b.startTime));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ManagerHeader
        title="Disponibilidad"
        subtitle="Genera los horarios puntuales que tus clientes pueden reservar, a partir de tus horarios de atencion."
      />

      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
      {notice ? (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">{notice}</div>
      ) : null}

      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base">Generar horarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="av-loc">Sede</Label>
              <select id="av-loc" className={selectClass} value={locationId} onChange={(e) => setLocationId(Number(e.target.value))}>
                {locations.map((l) => (
                  <option key={l.locationId} value={l.locationId}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="av-dur">Duracion del turno</Label>
                <select id="av-dur" className={selectClass} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))}>
                  {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="av-break">Descanso entre turnos</Label>
                <select id="av-break" className={selectClass} value={breakMinutes} onChange={(e) => setBreakMinutes(Number(e.target.value))}>
                  {[0, 5, 10, 15].map((m) => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="av-from">Desde</Label>
              <Input id="av-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="av-to">Hasta</Label>
              <Input id="av-to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Solo se crean horarios en los dias marcados como abiertos en{" "}
            <span className="font-medium text-foreground">Horarios</span> para esta sede.
          </p>

          <Button onClick={generateSlots} disabled={generating}>
            <CalendarPlus />
            {generating ? progress ? `Generando ${progress.done}/${progress.total}...` : "Generando..." : "Generar horarios"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border py-4">
          <CardTitle className="text-base">Horarios disponibles</CardTitle>
          <span className="text-sm text-muted-foreground">{upcoming.length} bloque(s)</span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="pr-6 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell className="pl-6"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="ml-auto h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : upcoming.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    Aun no hay horarios generados. Usa el formulario de arriba.
                  </TableCell>
                </TableRow>
              ) : (
                upcoming.map((block) => (
                  <TableRow key={block.availabilityBlockId}>
                    <TableCell className="pl-6 font-medium">{block.blockDate}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={block.isReserved ? "muted" : "success"}>{block.isReserved ? "Reservado" : "Disponible"}</Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => deleteBlock(block)}
                        disabled={block.isReserved}
                        title={block.isReserved ? "No se puede eliminar: tiene una reserva activa" : "Eliminar"}
                      >
                        <Trash2 />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
