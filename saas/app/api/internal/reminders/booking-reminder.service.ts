import { PrismaClient } from '@prisma/client';
import { sendBookingReminderEmail } from '../../../../lib/services/sendBookingReminderEmail';

const prisma = new PrismaClient();

function bookingStartDateTime(bookingDate: Date, startTime: string): Date {
  const [hours, minutes] = startTime.split(':').map(Number);
  const bookingDateTime = new Date(bookingDate);
  bookingDateTime.setUTCHours(hours, minutes, 0, 0);
  return bookingDateTime;
}

function isWithinWindow(dateTime: Date, windowStart: Date, windowEnd: Date): boolean {
  return dateTime >= windowStart && dateTime < windowEnd;
}

/**
 * Finds bookings that need reminders and sends emails.
 * Updates reminder flags after sending.
 */
export async function processBookingReminders() {
  const now = new Date();
  console.log('[REMINDER] Ejecutando proceso de recordatorios:', now.toISOString());
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const window24hEnd = new Date(in24h.getTime() + 60 * 60 * 1000);
  const window2hEnd = new Date(in2h.getTime() + 60 * 60 * 1000);

  const allBookings24h = await prisma.bookings.findMany({
    where: { reminder_24h_sent: false },
  });

  const bookings24h = allBookings24h.filter((booking) => {
    const startDateTime = bookingStartDateTime(booking.booking_date, booking.start_time);
    return isWithinWindow(startDateTime, in24h, window24hEnd);
  });

  console.log('[REMINDER][DEBUG] Ventana 24h:', {
    gte: in24h.toISOString(),
    lt: window24hEnd.toISOString(),
    total: bookings24h.length,
  });

  for (const booking of bookings24h) {
    console.log(`[REMINDER] Enviando recordatorio 24h para reserva ID: ${booking.id}, cliente: ${booking.customer_email}`);
    await sendBookingReminderEmail(booking, '24h');
    await prisma.bookings.update({
      where: { id: booking.id },
      data: { reminder_24h_sent: true },
    });
  }

  console.log('[REMINDER][DEBUG] Ventana 2h:', {
    gte: in2h.toISOString(),
    lt: window2hEnd.toISOString(),
  });

  const allBookings2h = await prisma.bookings.findMany({
    where: { reminder_2h_sent: false },
  });

  const bookings2h = allBookings2h.filter((booking) => {
    const startDateTime = bookingStartDateTime(booking.booking_date, booking.start_time);
    return isWithinWindow(startDateTime, in2h, window2hEnd);
  });

  console.log(`[REMINDER][DEBUG] Total reservas candidatas para 2h: ${bookings2h.length}`);
  for (const booking of bookings2h) {
    console.log('[REMINDER][DEBUG] Reserva candidata:', {
      id: booking.id,
      start_time: booking.start_time,
      booking_date: booking.booking_date,
      reminder_2h_sent: booking.reminder_2h_sent,
    });
  }
  if (bookings2h.length === 0) {
    console.log('[REMINDER][DEBUG] No hay reservas candidatas para enviar recordatorio 2h.');
  }
  for (const booking of bookings2h) {
    console.log(`[REMINDER][DEBUG] Intentando enviar recordatorio 2h para reserva ID: ${booking.id}, cliente: ${booking.customer_email}`);
    try {
      await sendBookingReminderEmail(booking, '2h');
      console.log(`[REMINDER][DEBUG] Recordatorio 2h enviado para reserva ID: ${booking.id}`);
    } catch (err) {
      console.error(`[REMINDER][ERROR] Fallo al enviar recordatorio 2h para reserva ID: ${booking.id}`, err);
    }
    await prisma.bookings.update({
      where: { id: booking.id },
      data: { reminder_2h_sent: true },
    });
  }
}
