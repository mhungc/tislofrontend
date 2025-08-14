import { z } from "zod";

export const timeStringSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/i, "Formato HH:mm requerido");

export const intervalSchema = z
  .object({
    start: timeStringSchema, // HH:mm
    end: timeStringSchema,   // HH:mm
  })
  .refine((v) => v.start < v.end, {
    message: "La hora de fin debe ser mayor que la de inicio",
    path: ["end"],
  });

export const dayScheduleSchema = z.object({
  day: z.number().int().min(0).max(6),
  enabled: z.boolean(),
  intervals: z.array(intervalSchema),
});

export const weeklyScheduleSchema = z.object({
  shopId: z.string().min(1),
  timezone: z.string().min(1),
  days: z.array(dayScheduleSchema).length(7),
});

export const shopSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  timezone: z.string().min(1),
  description: z.string().optional().or(z.literal("")),
});

export const serviceSchema = z.object({
  id: z.string(),
  shopId: z.string(),
  name: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  price: z.number().nonnegative(),
  description: z.string().optional().or(z.literal("")),
});

export const bookingSchema = z.object({
  id: z.string(),
  shopId: z.string(),
  serviceId: z.string(),
  title: z.string(),
  startISO: z.string(),
  endISO: z.string(),
});

export type Interval = z.infer<typeof intervalSchema>;
export type DaySchedule = z.infer<typeof dayScheduleSchema>;
export type WeeklySchedule = z.infer<typeof weeklyScheduleSchema>;
export type Shop = z.infer<typeof shopSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Booking = z.infer<typeof bookingSchema>;

export const weekdayLabelsEs: string[] = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const defaultTimezone = "America/Mexico_City";

export function createEmptyWeeklySchedule(shopId: string, timezone: string): WeeklySchedule {
  const days: DaySchedule[] = [];
  for (let i = 0; i < 7; i++) {
    days.push({ day: i, enabled: i >= 1 && i <= 5, intervals: i >= 1 && i <= 5 ? [{ start: "09:00", end: "13:00" }, { start: "15:00", end: "19:00" }] : [] });
  }
  return { shopId, timezone, days };
}