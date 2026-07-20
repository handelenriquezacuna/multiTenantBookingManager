"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, selectClass } from "@/components/ui/page-header";

type DaySchedule = {
  day: string;
  isClosed: boolean;
  intervals: Array<{ id: number; openTime: string; closeTime: string }>;
};

const locations = ["Sede central", "Sucursal oeste"];

const centralSchedule: DaySchedule[] = [
  { day: "Lunes", isClosed: false, intervals: [{ id: 1, openTime: "09:00", closeTime: "12:00" }, { id: 2, openTime: "13:00", closeTime: "17:00" }] },
  { day: "Martes", isClosed: false, intervals: [{ id: 3, openTime: "09:00", closeTime: "12:00" }, { id: 4, openTime: "13:00", closeTime: "17:00" }] },
  { day: "Miercoles", isClosed: false, intervals: [{ id: 5, openTime: "09:00", closeTime: "12:00" }, { id: 6, openTime: "13:00", closeTime: "17:00" }] },
  { day: "Jueves", isClosed: false, intervals: [{ id: 7, openTime: "09:00", closeTime: "12:00" }, { id: 8, openTime: "13:00", closeTime: "17:00" }] },
  { day: "Viernes", isClosed: false, intervals: [{ id: 9, openTime: "09:00", closeTime: "12:00" }, { id: 10, openTime: "13:00", closeTime: "16:00" }] },
  { day: "Sabado", isClosed: true, intervals: [] },
  { day: "Domingo", isClosed: true, intervals: [] }
];

const westSchedule: DaySchedule[] = [
  { day: "Lunes", isClosed: false, intervals: [{ id: 11, openTime: "10:00", closeTime: "14:00" }] },
  { day: "Martes", isClosed: false, intervals: [{ id: 12, openTime: "10:00", closeTime: "14:00" }] },
  { day: "Miercoles", isClosed: false, intervals: [{ id: 13, openTime: "10:00", closeTime: "14:00" }] },
  { day: "Jueves", isClosed: false, intervals: [{ id: 14, openTime: "10:00", closeTime: "14:00" }] },
  { day: "Viernes", isClosed: true, intervals: [] },
  { day: "Sabado", isClosed: false, intervals: [{ id: 15, openTime: "09:00", closeTime: "12:00" }] },
  { day: "Domingo", isClosed: true, intervals: [] }
];

const initialSchedules: Record<string, DaySchedule[]> = {
  "Sede central": centralSchedule,
  "Sucursal oeste": westSchedule
};

export function BusinessHoursManager() {
  const [selectedLocation, setSelectedLocation] = useState("Sede central");
  const [schedulesByLocation, setSchedulesByLocation] = useState(initialSchedules);
  const [baseOpenTime, setBaseOpenTime] = useState("09:00");
  const [baseCloseTime, setBaseCloseTime] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]);

  const schedule = schedulesByLocation[selectedLocation];

  function updateSelectedSchedule(updater: (current: DaySchedule[]) => DaySchedule[]) {
    setSchedulesByLocation((current) => ({ ...current, [selectedLocation]: updater(current[selectedLocation]) }));
  }

  function toggleSelectedDay(day: string) {
    setSelectedDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  }

  function applyBaseSchedule() {
    updateSelectedSchedule((current) =>
      current.map((item) =>
        selectedDays.includes(item.day)
          ? { ...item, isClosed: false, intervals: [{ id: Date.now() + item.day.length, openTime: baseOpenTime, closeTime: baseCloseTime }] }
          : item
      )
    );
  }

  function toggleDay(day: string) {
    updateSelectedSchedule((current) =>
      current.map((item) => {
        if (item.day !== day) return item;
        const nextClosed = !item.isClosed;
        return { ...item, isClosed: nextClosed, intervals: nextClosed ? [] : [{ id: Date.now(), openTime: "09:00", closeTime: "17:00" }] };
      })
    );
  }

  function addInterval(day: string) {
    updateSelectedSchedule((current) =>
      current.map((item) => (item.day === day ? { ...item, isClosed: false, intervals: [...item.intervals, { id: Date.now(), openTime: "13:00", closeTime: "17:00" }] } : item))
    );
  }

  function updateInterval(day: string, id: number, field: "openTime" | "closeTime", value: string) {
    updateSelectedSchedule((current) =>
      current.map((item) => (item.day === day ? { ...item, intervals: item.intervals.map((interval) => (interval.id === id ? { ...interval, [field]: value } : interval)) } : item))
    );
  }

  function removeInterval(day: string, id: number) {
    updateSelectedSchedule((current) =>
      current.map((item) => (item.day === day ? { ...item, intervals: item.intervals.filter((interval) => interval.id !== id) } : item))
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Horarios del negocio"
        subtitle="Configura los horarios de atencion por sede. La agenda publicada usa estos horarios."
        action={<Button size="sm">Guardar horarios</Button>}
      />

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-semibold">Sede y horario base</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="bh-loc">Sede</Label>
            <select id="bh-loc" className={selectClass} value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              {locations.map((location) => (
                <option key={location}>{location}</option>
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
        <p className="mt-4 text-xs text-muted-foreground">Dias a los que se aplica en esta sede</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {schedule.map((item) => {
            const on = selectedDays.includes(item.day);
            return (
              <button
                key={item.day}
                type="button"
                onClick={() => toggleSelectedDay(item.day)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {item.day}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Semana operativa de {selectedLocation}</h2>
        </div>
        <div className="divide-y divide-border">
          {schedule.map((item) => (
            <article key={item.day} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
              <div className="w-32 shrink-0">
                <h3 className="font-semibold">{item.day}</h3>
                <button type="button" onClick={() => toggleDay(item.day)} className="text-xs text-primary hover:underline">
                  {item.isClosed ? "Marcar abierto" : "Marcar cerrado"}
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {item.isClosed ? (
                  <span className="text-sm text-muted-foreground">Cerrado</span>
                ) : (
                  item.intervals.map((interval) => (
                    <div key={interval.id} className="flex items-center gap-2">
                      <Input type="time" value={interval.openTime} onChange={(e) => updateInterval(item.day, interval.id, "openTime", e.target.value)} className="h-9 w-28" />
                      <span className="text-sm text-muted-foreground">a</span>
                      <Input type="time" value={interval.closeTime} onChange={(e) => updateInterval(item.day, interval.id, "closeTime", e.target.value)} className="h-9 w-28" />
                      <button type="button" onClick={() => removeInterval(item.day, interval.id)} className="text-xs text-destructive hover:underline">Quitar</button>
                    </div>
                  ))
                )}
                {!item.isClosed ? (
                  <button type="button" onClick={() => addInterval(item.day)} className="self-start text-xs text-primary hover:underline">
                    + Agregar intervalo
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
