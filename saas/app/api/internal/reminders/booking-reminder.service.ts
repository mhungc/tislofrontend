import { PrismaClient } from '@prisma/client';
import { sendBookingReminderEmail } from '../../../../lib/services/sendBookingReminderEmail';

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
        gte: in24h.toISOString(),
        lt: new Date(in24h.getTime() + 60 * 60 * 1000).toISOString(), // within 1h window
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

  // Find bookings for 2h reminder
  // DEBUG: Mostrar ventana de tiempo para el recordatorio de 2h (10min en pruebas)
  console.log('[REMINDER][DEBUG] Ventana 2h (10min):', {
    gte: in2h.toISOString(),
    lt: new Date(in2h.getTime() + 60 * 60 * 1000).toISOString(),
  });

  // Unificar filtro de candidatas y envío: solo mostrar y procesar las que cumplen la ventana de tiempo y flag
  // Buscar todas las reservas pendientes de recordatorio 2h para filtrar por fecha/hora completa
  const allBookings2h = await prisma.bookings.findMany({
    where: {
      reminder_2h_sent: false,
    },
  });
  // Construir fecha/hora completa y filtrar en memoria
  const bookings2h = allBookings2h.filter(booking => {
    // Combinar booking_date (Date) y start_time (HH:mm) en un Date completo en UTC
    const [hours, minutes] = booking.start_time.split(':');
    const bookingDate = new Date(booking.booking_date);
    bookingDate.setUTCHours(Number(hours), Number(minutes), 0, 0);
    return bookingDate >= in2h && bookingDate < new Date(in2h.getTime() + 60 * 60 * 1000);
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
