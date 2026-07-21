"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { selectClass } from "@/components/ui/page-header";
import { ManagerHeader } from "@/components/admin/manager-ui";
import { apiGet, apiPut, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { apiList, errMessage } from "@/lib/resource";

type Location = { locationId: number; name: string };

// dia_semana per db/03-seed-data.sql: 0=Domingo .. 6=Sabado (JS getDay convention).
const WEEK: { label: string; dow: number }[] = [
  { label: "Lunes", dow: 1 },
  { label: "Martes", dow: 2 },
  { label: "Miercoles", dow: 3 },
  { label: "Jueves", dow: 4 },
  { label: "Viernes", dow: 5 },
  { label: "Sabado", dow: 6 },
  { label: "Domingo", dow: 0 }
];

type DayRow = { dow: number; label: string; isClosed: boolean; openTime: string; closeTime: string };

type HoursApiRow = { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean };

const mockLocations: Location[] = [
  { locationId: 1, name: "Sede central" },
  { locationId: 2, name: "Sucursal oeste" }
];

function defaultSchedule(): DayRow[] {
  return WEEK.map(({ label, dow }) => ({
    dow,
    label,
    isClosed: dow === 0 || dow === 6,
    openTime: "09:00",
    closeTime: "17:00"
  }));
}

function toTime(value: string | null): string {
  return value ? value.slice(0, 5) : "";
}

export function BusinessHoursManager() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [selectedLocationId, setSelectedLocationId] = useState<number>(mockLocations[0].locationId);
  const [schedule, setSchedule] = useState<DayRow[]>(defaultSchedule());
  const [baseOpenTime, setBaseOpenTime] = useState("09:00");
  const [baseCloseTime, setBaseCloseTime] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [loading, setLoading] = useState(!isMockMode());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Cargar sedes (API) para poblar el selector con ids reales.
  useEffect(() => {
    if (isMockMode()) return;
    apiList<Location>(endpoints.locations.list)
      .then((rows) => {
        if (rows.length === 0) return;
        setLocations(rows);
        setSelectedLocationId(rows[0].locationId);
      })
      .catch((err) => setError(errMessage(err, "No se pudieron cargar las sedes.")));
  }, []);

  // Cargar horarios de la sede seleccionada.
  useEffect(() => {
    if (isMockMode()) {
      setSchedule(defaultSchedule());
      return;
    }
    setLoading(true);
    setError(null);
    apiGet<HoursApiRow[]>(`${endpoints.businessHours}?locationId=${selectedLocationId}`)
      .then((rows) => {
        const byDow = new Map(rows.map((r) => [r.dayOfWeek, r]));
        setSchedule(
          WEEK.map(({ label, dow }) => {
            const row = byDow.get(dow);
            return {
              dow,
              label,
              isClosed: row ? row.isClosed : true,
              openTime: toTime(row?.openTime ?? null) || "09:00",
              closeTime: toTime(row?.closeTime ?? null) || "17:00"
            };
          })
        );
      })
      .catch((err) => setError(errMessage(err, "No se pudieron cargar los horarios.")))
      .finally(() => setLoading(false));
  }, [selectedLocationId]);

  function updateDay(dow: number, patch: Partial<DayRow>) {
    setSchedule((current) => current.map((d) => (d.dow === dow ? { ...d, ...patch } : d)));
    setSaved(false);
  }

  function toggleSelectedDay(dow: number) {
    setSelectedDays((current) => (current.includes(dow) ? current.filter((d) => d !== dow) : [...current, dow]));
  }

  function applyBaseSchedule() {
    setSchedule((current) =>
      current.map((d) => (selectedDays.includes(d.dow) ? { ...d, isClosed: false, openTime: baseOpenTime, closeTime: baseCloseTime } : d))
    );
    setSaved(false);
  }

  async function saveHours() {
    setSaved(false);
    if (isMockMode()) {
      setSaved(true);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const hours = schedule.map((d) => ({
        dayOfWeek: d.dow,
        openTime: d.isClosed ? null : d.openTime,
        closeTime: d.isClosed ? null : d.closeTime,
        isClosed: d.isClosed
      }));
      await apiPut(endpoints.businessHours, { locationId: selectedLocationId, hours });
      setSaved(true);
    } catch (err) {
      setError(errMessage(err, "No se pudieron guardar los horarios."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ManagerHeader
        title="Horarios del negocio"
        subtitle="Configura los horarios de atencion por sede. La agenda publicada usa estos horarios."
        action={
          <Button onClick={saveHours} disabled={saving || loading}>
            {saving ? "Guardando..." : "Guardar horarios"}
          </Button>
        }
      />

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : null}
      {saved ? (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">Horarios guardados.</div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-5">
        <h2 className="font-semibold">Sede y horario base</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="bh-loc">Sede</Label>
            <select id="bh-loc" className={selectClass} value={selectedLocationId} onChange={(e) => setSelectedLocationId(Number(e.target.value))}>
              {locations.map((location) => (
                <option key={location.locationId} value={location.locationId}>{location.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bh-open">Apertura</Label>
            <Input id="bh-open" type="time" value={baseOpenTime} onChange={(e) => setBaseOpenTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bh-close">Cierre</Label>
            <Input id="bh-close" type="time" value={baseCloseTime} onChange={(e) => setBaseCloseTime(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={applyBaseSchedule}>Aplicar</Button>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Dias a los que se aplica el horario base</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {schedule.map((item) => {
              const on = selectedDays.includes(item.dow);
              return (
                <button
                  key={item.dow}
                  type="button"
                  onClick={() => toggleSelectedDay(item.dow)}
                  className={`h-8 rounded-md border px-3 text-sm font-medium transition-colors ${on ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base">Semana operativa</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
        <div className="divide-y divide-border">
          {loading ? (
            <p className="px-5 py-10 text-center text-muted-foreground">Cargando horarios...</p>
          ) : (
            schedule.map((item) => (
              <article key={item.dow} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="w-32 shrink-0">
                  <h3 className="font-semibold">{item.label}</h3>
                  <button type="button" onClick={() => updateDay(item.dow, { isClosed: !item.isClosed })} className="text-xs text-primary hover:underline">
                    {item.isClosed ? "Marcar abierto" : "Marcar cerrado"}
                  </button>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  {item.isClosed ? (
                    <span className="text-sm text-muted-foreground">Cerrado</span>
                  ) : (
                    <>
                      <Input type="time" value={item.openTime} onChange={(e) => updateDay(item.dow, { openTime: e.target.value })} className="h-9 w-28" />
                      <span className="text-sm text-muted-foreground">a</span>
                      <Input type="time" value={item.closeTime} onChange={(e) => updateDay(item.dow, { closeTime: e.target.value })} className="h-9 w-28" />
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
