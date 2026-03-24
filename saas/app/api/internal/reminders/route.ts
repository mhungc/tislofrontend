import { NextResponse } from 'next/server';
import { processBookingReminders } from './booking-reminder.service';

// Protect this route with a secret or cron header in production
export async function POST() {
  await processBookingReminders();
  return NextResponse.json({ status: 'ok' });
}
