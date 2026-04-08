import { PrismaClient } from '@prisma/client';
import { sendBookingReminderEmail } from '../../../../lib/services/sendBookingReminderEmail';

const prisma = new PrismaClient();

export interface ReminderRunSummary {
  ranAt: string;
  tomorrowDate: string;
  todayDate: string;
  pending24h: number;
  matched24h: number;
  sent24h: string[];
  pendingToday: number;
  matchedToday: number;
  sentToday: string[];
}

function isSameUTCDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/**
 * Runs once a day (Vercel Hobby cron).
 * - 24h reminder: every booking happening TOMORROW (any time).
 * - Same-day reminder: every booking happening TODAY (any time).
 */
export async function processBookingReminders() {
  const now = new Date();
  console.log('[REMINDER] Ejecutando proceso de recordatorios:', now.toISOString());

  const bookingInclude = {
    shops: {
      select: {
        name: true,
        address: true,
        phone: true,
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

  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);

  // ── 24h reminder: reservas de mañana ─────────────────────────────────────
  const allBookings24h = await prisma.bookings.findMany({
    where: { reminder_24h_sent: false },
    include: bookingInclude,
  });

  const bookings24h = allBookings24h.filter((booking) =>
    isSameUTCDate(new Date(booking.booking_date), tomorrow)
  );

  const summary: ReminderRunSummary = {
    ranAt: now.toISOString(),
    tomorrowDate: tomorrow.toISOString().split('T')[0],
    todayDate: today.toISOString().split('T')[0],
    pending24h: allBookings24h.length,
    matched24h: bookings24h.length,
    sent24h: [],
    pendingToday: 0,
    matchedToday: 0,
    sentToday: [],
  };

  console.log('[REMINDER] Recordatorios 24h (mañana):', {
    date: tomorrow.toISOString().split('T')[0],
    total: bookings24h.length,
  });

  for (const booking of bookings24h) {
    console.log(`[REMINDER] Enviando recordatorio 24h → ID: ${booking.id}, cliente: ${booking.customer_email}`);
    await sendBookingReminderEmail(toReminderBooking(booking), '24h');
    await prisma.bookings.update({
      where: { id: booking.id },
      data: { reminder_24h_sent: true },
    });
    summary.sent24h.push(booking.id);
  }

  // ── Same-day reminder: reservas de hoy ───────────────────────────────────
  const allBookingsToday = await prisma.bookings.findMany({
    where: { reminder_2h_sent: false },
    include: bookingInclude,
  });

  const bookingsToday = allBookingsToday.filter((booking) =>
    isSameUTCDate(new Date(booking.booking_date), today)
  );

  summary.pendingToday = allBookingsToday.length;
  summary.matchedToday = bookingsToday.length;

  console.log('[REMINDER] Recordatorios mismo día (hoy):', {
    date: today.toISOString().split('T')[0],
    total: bookingsToday.length,
  });

  for (const booking of bookingsToday) {
    console.log(`[REMINDER] Enviando recordatorio hoy → ID: ${booking.id}, cliente: ${booking.customer_email}`);
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

  console.log('[REMINDER] Resumen de ejecución:', summary);
  return summary;
}
