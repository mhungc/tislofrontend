import { PrismaClient } from '@prisma/client';
import { sendBookingReminderEmail } from './sendBookingReminderEmail';

const prisma = new PrismaClient();

/**
 * Finds bookings that need reminders and sends emails.
 * Updates reminder flags after sending.
 */
export async function processBookingReminders() {
  // 24h reminder
  const now = new Date();
    console.log('[REMINDER] Ejecutando proceso de recordatorios:', now.toISOString());
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 10 * 60 * 1000);

  // Find bookings for 24h reminder
  const bookings24h = await prisma.bookings.findMany({
    where: {
      reminder_24h_sent: false,
      start_time: {
        gte: in24h,
        lt: new Date(in24h.getTime() + 60 * 60 * 1000), // within 1h window
      },
    },
  });

  for (const booking of bookings24h) {
      console.log(`[REMINDER] Enviando recordatorio 24h para reserva ID: ${booking.id}, cliente: ${booking.customer_email}`);
    await sendBookingReminderEmail(booking, '24h');
    await prisma.bookings.update({
      where: { id: booking.id },
      data: { reminder_24h_sent: true },
    });
  }

  // Buscar todas las reservas candidatas (reminder_2h_sent: false)
  const allBookings2h = await prisma.bookings.findMany({
    where: {
      reminder_2h_sent: false,
    },
  });

  // Calcular ventana de tiempo
  const windowStart = in2h;
  const windowEnd = new Date(in2h.getTime() + 60 * 60 * 1000);
  console.log('[REMINDER][DEBUG] Ventana 2h (10min):', {
    gte: windowStart.toISOString(),
    lt: windowEnd.toISOString(),
  });

  for (const booking of allBookings2h) {
    // Combinar booking_date y start_time en un Date
    const [hours, minutes] = booking.start_time.split(':').map(Number);
    const bookingDate = new Date(booking.booking_date);
    bookingDate.setHours(hours, minutes, 0, 0);
    // Comparar con la ventana
    if (bookingDate >= windowStart && bookingDate < windowEnd) {
      console.log(`[REMINDER] Enviando recordatorio 2h para reserva ID: ${booking.id}, cliente: ${booking.customer_email}`);
      await sendBookingReminderEmail(booking, '2h');
      await prisma.bookings.update({
        where: { id: booking.id },
        data: { reminder_2h_sent: true },
      });
    } else {
      console.log(`[REMINDER][DEBUG] Reserva fuera de ventana: ID ${booking.id}, datetime ${bookingDate.toISOString()}`);
    }
  }
}
