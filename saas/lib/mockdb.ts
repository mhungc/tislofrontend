import { nanoid } from "nanoid";
import { addMinutes, isBefore } from "date-fns";
import { bookingSchema, createEmptyWeeklySchedule, serviceSchema, shopSchema, weeklyScheduleSchema, type Booking, type Service, type Shop, type WeeklySchedule } from "./types";
import { isRangeInsideBusinessHours, overlapsExistingBookings } from "./schedule";

const shops: Shop[] = [];
const services: Service[] = [];
const schedules = new Map<string, WeeklySchedule>();
const bookings: Booking[] = [];

function findShop(shopId: string): Shop | undefined {
  return shops.find((s) => s.id === shopId);
}

export function listShops(): Shop[] {
  return [...shops];
}

export function createShop(input: { name: string; timezone?: string; description?: string }): Shop {
  const newShop: Shop = {
    id: nanoid(),
    name: input.name,
    description: input.description ?? "",
    timezone: input.timezone ?? "America/Mexico_City",
  };
  const parsed = shopSchema.parse(newShop);
  shops.push(parsed);
  // Crear horario por defecto
  const defaultSchedule = createEmptyWeeklySchedule(parsed.id, parsed.timezone);
  schedules.set(parsed.id, defaultSchedule);
  return parsed;
}

export function getShop(shopId: string): Shop | undefined {
  return findShop(shopId);
}

export function updateShop(shopId: string, changes: Partial<Omit<Shop, "id">>): Shop | undefined {
  const index = shops.findIndex((s) => s.id === shopId);
  if (index === -1) return undefined;
  const updated: Shop = { ...shops[index], ...changes };
  const parsed = shopSchema.parse(updated);
  shops[index] = parsed;
  // Si cambia zona horaria, también actualizar horario
  if (changes.timezone) {
    const sched = schedules.get(shopId);
    if (sched) schedules.set(shopId, { ...sched, timezone: changes.timezone });
  }
  return parsed;
}

export function deleteShop(shopId: string): boolean {
  const i = shops.findIndex((s) => s.id === shopId);
  if (i === -1) return false;
  shops.splice(i, 1);
  // limpiar dependencias
  for (let j = services.length - 1; j >= 0; j--) if (services[j].shopId === shopId) services.splice(j, 1);
  for (let k = bookings.length - 1; k >= 0; k--) if (bookings[k].shopId === shopId) bookings.splice(k, 1);
  schedules.delete(shopId);
  return true;
}

export function listServices(shopId: string): Service[] {
  return services.filter((s) => s.shopId === shopId);
}

export function createService(input: { shopId: string; name: string; durationMinutes: number; price: number; description?: string }): Service {
  if (!findShop(input.shopId)) throw new Error("Shop not found");
  const newService: Service = {
    id: nanoid(),
    shopId: input.shopId,
    name: input.name,
    durationMinutes: input.durationMinutes,
    price: input.price,
    description: input.description ?? "",
  };
  const parsed = serviceSchema.parse(newService);
  services.push(parsed);
  return parsed;
}

export function updateService(serviceId: string, changes: Partial<Omit<Service, "id" | "shopId">>): Service | undefined {
  const index = services.findIndex((s) => s.id === serviceId);
  if (index === -1) return undefined;
  const updated: Service = { ...services[index], ...changes } as Service;
  const parsed = serviceSchema.parse(updated);
  services[index] = parsed;
  return parsed;
}

export function deleteService(serviceId: string): boolean {
  const i = services.findIndex((s) => s.id === serviceId);
  if (i === -1) return false;
  services.splice(i, 1);
  return true;
}

export function getSchedule(shopId: string): WeeklySchedule | undefined {
  return schedules.get(shopId);
}

export function upsertSchedule(input: WeeklySchedule): WeeklySchedule {
  const parsed = weeklyScheduleSchema.parse(input);
  schedules.set(parsed.shopId, parsed);
  return parsed;
}

export function listBookings(shopId: string): Booking[] {
  return bookings.filter((b) => b.shopId === shopId);
}

export function createBooking(input: { shopId: string; serviceId: string; startISO: string; title?: string }): Booking {
  const shop = findShop(input.shopId);
  if (!shop) throw new Error("Shop not found");
  const service = services.find((s) => s.id === input.serviceId && s.shopId === input.shopId);
  if (!service) throw new Error("Service not found");
  const schedule = schedules.get(input.shopId);
  if (!schedule) throw new Error("Schedule not found");

  const start = new Date(input.startISO);
  const end = addMinutes(start, service.durationMinutes);
  if (!isBefore(start, end)) throw new Error("Invalid time range");

  // Validar que cae dentro de horario disponible y no choca con otras reservas
  if (!isRangeInsideBusinessHours(schedule, start, end)) {
    throw new Error("El horario seleccionado está fuera de la disponibilidad");
  }
  if (overlapsExistingBookings(listBookings(input.shopId), start, end)) {
    throw new Error("El horario seleccionado ya está ocupado");
  }

  const newBooking: Booking = bookingSchema.parse({
    id: nanoid(),
    shopId: input.shopId,
    serviceId: input.serviceId,
    title: input.title ?? `Reserva - ${service.name}`,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  });
  bookings.push(newBooking);
  return newBooking;
}

// Datos seed para desarrollo
(function seed() {
  if (shops.length === 0) {
    const s1 = createShop({ name: "Mi Peluquería Centro", timezone: "America/Mexico_City" });
    createService({ shopId: s1.id, name: "Corte de cabello", durationMinutes: 45, price: 150 });
    createService({ shopId: s1.id, name: "Peinado fiesta", durationMinutes: 60, price: 300 });
  }
})();