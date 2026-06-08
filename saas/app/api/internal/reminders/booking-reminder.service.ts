import { PrismaClient } from '@prisma/client';
import { toZonedTime } from 'date-fns-tz';
import { sendBookingReminderEmail } from '../../../../lib/services/sendBookingReminderEmail';

const prisma = new PrismaClient();

export interface ReminderRunSummary {
  ranAt: string;
  utcDate: string;
  pending24h: number;
  matched24h: number;
  sent24h: string[];
  pendingToday: number;
  matchedToday: number;
  sentToday: string[];
}

/**
 * Devuelve la fecha actual (YYYY-MM-DD) en el timezone dado.
 * Ejemplo: toZonedTime('2026-06-09T09:15:00Z', 'Pacific/Honolulu') → "2026-06-08"
 */
function getLocalDateString(utcNow: Date, timezone: string): string {
  const zoned = toZonedTime(utcNow, timezone);
  const y = zoned.getFullYear();
  const m = String(zoned.getMonth() + 1).padStart(2, '0');
  const d = String(zoned.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Extrae la parte de fecha (YYYY-MM-DD) de un booking_date almacenado como Date.
 * booking_date se guarda como @db.Date (medianoche UTC).
 */
function getBookingDateString(bookingDate: Date): string {
  return bookingDate.toISOString().split('T')[0];
}

/**
 * Runs once a day (Vercel Hobby cron).
 * Procesa recordatorios por zona horaria de cada tienda:
 * - 24h reminder: reservas para MAÑANA en la zona horaria de la tienda
 * - Same-day reminder: reservas para HOY en la zona horaria de la tienda
 */
export async function processBookingReminders() {
  const now = new Date();
  const utcDate = now.toISOString().split('T')[0];
  console.log('[REMINDER] Ejecutando proceso de recordatorios:', now.toISOString());

  const bookingInclude = {
    shops: {
      select: {
        name: true,
        address: true,
        phone: true,
        timezone: true,
      },
    },
    booking_services: {
      include: {
        services: {
          select: {
            name: true,
          },
        },
      },
    },
    booking_modifiers: {
      include: {
        service_modifiers: {
          select: {
            name: true,
          },
        },
      },
    },
  } as const;

  const toReminderBooking = (booking: any) => ({
    ...booking,
    booking_modifiers: (booking.booking_modifiers || []).map((modifier: any) => ({
      name: modifier.service_modifiers?.name || null,
      duration_modifier: modifier.applied_duration || 0,
      price_modifier: modifier.applied_price || 0,
    })),
  });

  const summary: ReminderRunSummary = {
    ranAt: now.toISOString(),
    utcDate,
    pending24h: 0,
    matched24h: 0,
    sent24h: [],
    pendingToday: 0,
    matchedToday: 0,
    sentToday: [],
  };

  // ── 24h reminder: reservas de mañana (según timezone de cada tienda) ────
  const allBookings24h = await prisma.bookings.findMany({
    where: { reminder_24h_sent: false },
    include: bookingInclude,
  });

  const bookings24h = allBookings24h.filter((booking) => {
    const tz = booking.shops?.timezone || 'UTC';
    const localToday = getLocalDateString(now, tz);
    const bookingDate = getBookingDateString(new Date(booking.booking_date));
    // bookingDate es "mañana" si está un día después de "hoy"
    const localTomorrow = localToday; // calculamos abajo
    const [y, m, d] = localToday.split('-').map(Number);
    const tomorrowDate = new Date(Date.UTC(y, m - 1, d + 1));
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];
    return bookingDate === tomorrowStr;
  });

  summary.pending24h = allBookings24h.length;
  summary.matched24h = bookings24h.length;

  console.log('[REMINDER] Recordatorios 24h (mañana en timezone local):', {
    total: bookings24h.length,
  });

  for (const booking of bookings24h) {
    console.log(`[REMINDER] Enviando recordatorio 24h → ID: ${booking.id}, tienda: ${booking.shops?.name}, cliente: ${booking.customer_email}`);
    await sendBookingReminderEmail(toReminderBooking(booking), '24h');
    await prisma.bookings.update({
      where: { id: booking.id },
      data: { reminder_24h_sent: true },
    });
    summary.sent24h.push(booking.id);
  }

  // ── Same-day reminder: reservas de hoy (según timezone de cada tienda) ──
  const allBookingsToday = await prisma.bookings.findMany({
    where: { reminder_2h_sent: false },
    include: bookingInclude,
  });

  const bookingsToday = allBookingsToday.filter((booking) => {
    const tz = booking.shops?.timezone || 'UTC';
    const localToday = getLocalDateString(now, tz);
    const bookingDate = getBookingDateString(new Date(booking.booking_date));
    return bookingDate === localToday;
  });

  summary.pendingToday = allBookingsToday.length;
  summary.matchedToday = bookingsToday.length;

  console.log('[REMINDER] Recordatorios mismo día (hoy en timezone local):', {
    total: bookingsToday.length,
  });

  for (const booking of bookingsToday) {
    console.log(`[REMINDER] Enviando recordatorio hoy → ID: ${booking.id}, tienda: ${booking.shops?.name}, cliente: ${booking.customer_email}`);
    try {
      await sendBookingReminderEmail(toReminderBooking(booking), '2h');
    } catch (err) {
      console.error(`[REMINDER][ERROR] Fallo al enviar recordatorio hoy → ID: ${booking.id}`, err);
    }
    await prisma.bookings.update({
      where: { id: booking.id },
      data: { reminder_2h_sent: true },
    });
    summary.sentToday.push(booking.id);
  }

  console.log('[REMINDER] Resumen de ejecución:', JSON.stringify(summary, null, 2));
  return summary;
}
