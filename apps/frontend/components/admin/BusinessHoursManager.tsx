"use client";

import { useState } from "react";

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
    setSchedulesByLocation((current) => ({
      ...current,
      [selectedLocation]: updater(current[selectedLocation])
    }));
  }

  function toggleSelectedDay(day: string) {
    setSelectedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  }

  function applyBaseSchedule() {
    updateSelectedSchedule((current) => current.map((item) => selectedDays.includes(item.day) ? {
      ...item,
      isClosed: false,
      intervals: [{ id: Date.now() + item.day.length, openTime: baseOpenTime, closeTime: baseCloseTime }]
    } : item));
  }

  function toggleDay(day: string) {
    updateSelectedSchedule((current) => current.map((item) => {
      if (item.day !== day) return item;
      const nextClosed = !item.isClosed;
      return {
        ...item,
        isClosed: nextClosed,
        intervals: nextClosed ? [] : [{ id: Date.now(), openTime: "09:00", closeTime: "17:00" }]
      };
    }));
  }

  function addInterval(day: string) {
    updateSelectedSchedule((current) => current.map((item) => item.day === day ? {
      ...item,
      isClosed: false,
      intervals: [...item.intervals, { id: Date.now(), openTime: "13:00", closeTime: "17:00" }]
    } : item));
  }

  function updateInterval(day: string, id: number, field: "openTime" | "closeTime", value: string) {
    updateSelectedSchedule((current) => current.map((item) => item.day === day ? {
      ...item,
      intervals: item.intervals.map((interval) => interval.id === id ? { ...interval, [field]: value } : interval)
    } : item));
  }

  function removeInterval(day: string, id: number) {
    updateSelectedSchedule((current) => current.map((item) => item.day === day ? {
      ...item,
      intervals: item.intervals.filter((interval) => interval.id !== id)
    } : item));
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Horarios del negocio</h1>
          <p>Configura los horarios de atencion por sede. La agenda publicada usara estos horarios para crear citas reservables.</p>
        </div>
        <button className="btn" type="button">Guardar horarios</button>
      </div>

      <section className="panel" style={{ marginBottom: "24px" }}>
        <div className="panel-header"><h2>Sede y horario base</h2></div>
        <div className="base-schedule-panel">
          <label className="field-group settings-full">
            <span>Sede</span>
            <select value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)}>
              {locations.map((location) => <option key={location}>{location}</option>)}
            </select>
          </label>
          <label className="field-group">
            <span>Hora de apertura</span>
            <input type="time" value={baseOpenTime} onChange={(event) => setBaseOpenTime(event.target.value)} />
          </label>
          <label className="field-group">
            <span>Hora de cierre</span>
            <input type="time" value={baseCloseTime} onChange={(event) => setBaseCloseTime(event.target.value)} />
          </label>
          <div className="settings-full">
            <span className="field-helper">Dias a los que se aplicara en esta sede</span>
            <div className="day-chip-list">
              {schedule.map((item) => (
                <button key={item.day} type="button" className={selectedDays.includes(item.day) ? "selected" : ""} onClick={() => toggleSelectedDay(item.day)}>
                  {item.day}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-actions">
            <button className="btn" type="button" onClick={applyBaseSchedule}>Aplicar horario base</button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header"><h2>Semana operativa de {selectedLocation}</h2></div>
        <div className="business-hours-list">
          {schedule.map((item) => (
            <article className="business-day-row" key={item.day}>
              <div>
                <h3>{item.day}</h3>
                <button className="text-action" type="button" onClick={() => toggleDay(item.day)}>
                  {item.isClosed ? "Marcar como abierto" : "Marcar como cerrado"}
                </button>
              </div>
              <div className="day-intervals">
                {item.isClosed ? <span className="closed-day">Cerrado</span> : item.intervals.map((interval) => (
                  <div className="interval-row" key={interval.id}>
                    <input type="time" value={interval.openTime} onChange={(event) => updateInterval(item.day, interval.id, "openTime", event.target.value)} />
                    <span>a</span>
                    <input type="time" value={interval.closeTime} onChange={(event) => updateInterval(item.day, interval.id, "closeTime", event.target.value)} />
                    <button className="text-action danger" type="button" onClick={() => removeInterval(item.day, interval.id)}>Quitar</button>
                  </div>
                ))}
                {!item.isClosed ? <button className="text-action" type="button" onClick={() => addInterval(item.day)}>Agregar intervalo</button> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
