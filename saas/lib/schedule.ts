import { addMinutes, isBefore, isEqual, isWithinInterval } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { type Booking, type WeeklySchedule } from "./types";

export type BusinessHoursItem = { daysOfWeek: number[]; startTime: string; endTime: string };

export function isRangeInsideBusinessHours(schedule: WeeklySchedule, startUTC: Date, endUTC: Date): boolean {
  if (!isBefore(startUTC, endUTC)) return false;
  const tz = schedule.timezone;
  const startZoned = toZonedTime(startUTC, tz);
  const endZoned = toZonedTime(endUTC, tz);
  const day = startZoned.getDay();
  const sameDay = day === endZoned.getDay();
  if (!sameDay) return false; // no permitir cruces de día para simplificar
  const dayCfg = schedule.days.find((d) => d.day === day);
  if (!dayCfg || !dayCfg.enabled || dayCfg.intervals.length === 0) return false;
  // construir intervalos del día en UTC
  for (const interval of dayCfg.intervals) {
    const [hS, mS] = interval.start.split(":").map((n) => parseInt(n, 10));
    const [hE, mE] = interval.end.split(":").map((n) => parseInt(n, 10));
    const startLocal = new Date(startZoned);
    startLocal.setHours(hS, mS, 0, 0);
    const endLocal = new Date(startZoned);
    endLocal.setHours(hE, mE, 0, 0);

    const ivStartUTC = fromZonedTime(startLocal, tz);
    const ivEndUTC = fromZonedTime(endLocal, tz);

    if (
      (isEqual(startUTC, ivStartUTC) || isWithinInterval(startUTC, { start: ivStartUTC, end: ivEndUTC })) &&
      (isEqual(endUTC, ivEndUTC) || isWithinInterval(endUTC, { start: ivStartUTC, end: ivEndUTC }))
    ) {
      return true;
    }
  }
  return false;
}

export function overlapsExistingBookings(all: Booking[], start: Date, end: Date): boolean {
  return all.some((b) => {
    const bStart = new Date(b.startISO);
    const bEnd = new Date(b.endISO);
    return start < bEnd && end > bStart;
  });
}

export function buildBusinessHoursForFullCalendar(schedule: WeeklySchedule): BusinessHoursItem[] {
  // Devuelve array compatible con businessHours de FullCalendar
  const items: BusinessHoursItem[] = [];
  for (const d of schedule.days) {
    if (!d.enabled) continue;
    for (const iv of d.intervals) {
      items.push({ daysOfWeek: [d.day], startTime: iv.start, endTime: iv.end });
    }
  }
  return items;
}

export function createEventFromBooking(b: Booking) {
  return {
    id: b.id,
    title: b.title,
    start: b.startISO,
    end: b.endISO,
  };
}

export function computeEndByDuration(startISO: string, durationMinutes: number): string {
  const end = addMinutes(new Date(startISO), durationMinutes);
  return end.toISOString();
}