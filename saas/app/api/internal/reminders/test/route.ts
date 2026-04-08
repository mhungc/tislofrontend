import { NextRequest, NextResponse } from 'next/server';
import { BookingRepository } from '@/lib/repositories/booking-repository';
import { sendBookingReminderEmail } from '@/lib/services/sendBookingReminderEmail';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  const secretQuery = new URL(request.url).searchParams.get('secret');
  return authHeader === `Bearer ${secret}` || secretQuery === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('bookingId');
  const reminderType = searchParams.get('type') === '2h' ? '2h' : '24h';

  if (!bookingId) {
    return NextResponse.json({
      error: 'bookingId is required',
      usage: '/api/internal/reminders/test?secret=YOUR_CRON_SECRET&bookingId=BOOKING_ID&type=24h'
    }, { status: 400 });
  }

  console.log('[REMINDER_TEST] Inicio de prueba manual', {
    bookingId,
    reminderType,
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    fromEmail: process.env.RESEND_FROM_EMAIL || 'ReservaFácil <onboarding@resend.dev>',
    triggeredAt: new Date().toISOString(),
  });

  const bookingRepository = new BookingRepository();
  const booking = await bookingRepository.getById(bookingId);

  if (!booking) {
    console.log('[REMINDER_TEST] Reserva no encontrada', { bookingId });
    return NextResponse.json({ error: 'Booking not found', bookingId }, { status: 404 });
  }

  console.log('[REMINDER_TEST] Reserva encontrada', {
    bookingId: booking.id,
    customerEmail: booking.customer_email,
    customerName: booking.customer_name,
    bookingDate: booking.booking_date,
    startTime: booking.start_time,
    endTime: booking.end_time,
    shopName: booking.shops?.name,
    servicesCount: booking.booking_services?.length || 0,
  });

  const reminderBooking = {
    ...booking,
    booking_modifiers: (booking.booking_modifiers || []).map((modifier) => ({
      name: modifier.service_modifiers?.name || null,
      duration_modifier: modifier.applied_duration || 0,
      price_modifier: modifier.applied_price || 0,
    })),
  };

  await sendBookingReminderEmail(reminderBooking, reminderType);

  console.log('[REMINDER_TEST] Prueba manual finalizada', {
    bookingId: booking.id,
    reminderType,
    customerEmail: booking.customer_email,
    finishedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    status: 'ok',
    message: 'Reminder test triggered',
    bookingId: booking.id,
    reminderType,
    customerEmail: booking.customer_email,
    shopName: booking.shops?.name || null,
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
  });
}