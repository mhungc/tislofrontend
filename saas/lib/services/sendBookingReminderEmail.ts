
import { BookingEmailService } from './booking-email-service';

const emailService = new BookingEmailService();

type DecimalLike = { toNumber: () => number };

type ReminderBooking = {
  customer_name?: string | null;
  customer_email?: string | null;
  booking_date?: Date | string | null;
  start_time?: string | null;
  end_time?: string | null;
  total_duration?: number | null;
  total_price?: number | DecimalLike | null;
  booking_services?: Array<{
    services?: { name?: string | null } | null;
    duration_minutes?: number | null;
    price?: number | DecimalLike | null;
  }> | null;
  booking_modifiers?: Array<{
    name?: string | null;
    duration_modifier?: number | null;
    price_modifier?: number | DecimalLike | null;
  }> | null;
  shops?: {
    name?: string | null;
    address?: string | null;
    phone?: string | null;
  } | null;
  // Prisma `bookings.customer_id` can be null for guest bookings.
  customer_id?: string | null;
};

function toNumber(value: number | DecimalLike | null | undefined): number {
  if (typeof value === 'number') return value;
  if (value && typeof value.toNumber === 'function') return value.toNumber();
  return 0;
}

function buildReminderEmailData(booking: ReminderBooking, type: '24h' | '2h') {
  return {
    customerName: booking.customer_name || '',
    customerEmail: booking.customer_email || '',
    bookingDate: booking.booking_date instanceof Date ? booking.booking_date.toISOString() : booking.booking_date,
    startTime: booking.start_time,
    endTime: booking.end_time,
    totalDuration: booking.total_duration || 0,
    totalPrice: toNumber(booking.total_price),
    services: (booking.booking_services || []).map((s: any) => ({
      name: s.services?.name || '',
      duration_minutes: s.duration_minutes || 0,
      price: toNumber(s.price),
    })),
    modifiers: (booking.booking_modifiers || []).map((m: any) => ({
      name: m.name || '',
      duration_modifier: m.duration_modifier || 0,
      price_modifier: toNumber(m.price_modifier),
    })),
    shopName: booking.shops?.name || '',
    shopAddress: booking.shops?.address || '',
    shopPhone: booking.shops?.phone || '',
    locale: 'es',
    reminderType: type,
  };
}

export async function sendBookingReminderEmail(booking: ReminderBooking, type: '24h' | '2h') {
  const emailData = buildReminderEmailData(booking, type);
  await emailService.sendReminderEmail(emailData);
}
