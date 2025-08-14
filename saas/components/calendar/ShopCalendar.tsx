"use client";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildBusinessHoursForFullCalendar, createEventFromBooking } from "@/lib/schedule";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Booking, WeeklySchedule } from "@/lib/types";

interface Service { id: string; name: string; durationMinutes: number; }

type DateSelectArg = {
  startStr: string;
  endStr: string;
};

type FCEvent = { id: string; title: string; start: string; end: string };

type FCBusinessHours = { daysOfWeek: number[]; startTime: string; endTime: string }[];

export function ShopCalendar({ shopId }: { shopId: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  const loadAll = useCallback(async () => {
    const [svcRes, schedRes, bookRes] = await Promise.all([
      fetch(`/api/shops/${shopId}/services`),
      fetch(`/api/shops/${shopId}/schedule`),
      fetch(`/api/shops/${shopId}/bookings`),
    ]);
    const svcs = await svcRes.json();
    const sched = await schedRes.json();
    const books = await bookRes.json();
    setServices((svcs.services ?? []) as Service[]);
    setSchedule(sched as WeeklySchedule);
    setBookings((books.bookings ?? []) as Booking[]);
    if ((svcs.services ?? []).length > 0) setSelectedServiceId(svcs.services[0].id as string);
  }, [shopId]);

  useEffect(() => {
    if (shopId) loadAll();
  }, [shopId, loadAll]);

  const businessHours: FCBusinessHours = useMemo(
    () => (schedule ? (buildBusinessHoursForFullCalendar(schedule) as FCBusinessHours) : []),
    [schedule],
  );
  const events: FCEvent[] = useMemo(
    () => bookings.map((b) => createEventFromBooking(b) as FCEvent),
    [bookings],
  );

  const handleSelect = useCallback(async (selectionInfo: DateSelectArg) => {
    if (!selectedServiceId) return;
    const startISO = selectionInfo.startStr;
    const res = await fetch(`/api/shops/${shopId}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: selectedServiceId, startISO }),
    });
    if (res.ok) {
      await loadAll();
    } else {
      const err = await res.json();
      alert((err.error as string) ?? "No se pudo crear la reserva");
    }
  }, [selectedServiceId, shopId, loadAll]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm">Servicio</label>
        <Select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="max-w-xs">
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>
          ))}
        </Select>
        <Button onClick={loadAll} variant="secondary">Actualizar</Button>
      </div>
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
        selectable={true}
        selectMirror={true}
        select={handleSelect as unknown as (arg: unknown) => void}
        events={events as unknown as { id: string; title: string; start: string; end: string }[]}
        businessHours={businessHours as unknown as { daysOfWeek: number[]; startTime: string; endTime: string }[]}
        nowIndicator={true}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        height="auto"
      />
    </div>
  );
}