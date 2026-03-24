
import { Booking } from '../types/database';
import { BookingEmailService } from './booking-email-service';

const emailService = new BookingEmailService();

function buildReminderEmailData(booking: any, type: '24h' | '2h') {
  return {
    customerName: booking.customer_name || '',
    customerEmail: booking.customer_email || '',
    bookingDate: booking.booking_date instanceof Date ? booking.booking_date.toISOString() : booking.booking_date,
    startTime: booking.start_time,
    endTime: booking.end_time,
    totalDuration: booking.total_duration || 0,
    totalPrice: booking.total_price || 0,
    services: (booking.booking_services || []).map((s: any) => ({
      name: s.services?.name || '',
      duration_minutes: s.duration_minutes || 0,
      price: s.price || 0,
    })),
    modifiers: (booking.booking_modifiers || []).map((m: any) => ({
      name: m.name || '',
      duration_modifier: m.duration_modifier || 0,
      price_modifier: m.price_modifier || 0,
    })),
    shopName: booking.shops?.name || '',
    shopAddress: booking.shops?.address || '',
    shopPhone: booking.shops?.phone || '',
    locale: 'es',
    reminderType: type,
  };
}

export async function sendBookingReminderEmail(booking: Booking, type: '24h' | '2h') {
  const emailData = buildReminderEmailData(booking, type);
  await emailService.sendReminderEmail(emailData);
}
