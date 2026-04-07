import { NextRequest, NextResponse } from 'next/server';
import { processBookingReminders } from './booking-reminder.service';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;

  // Allow local/manual runs when secret is not configured.
  if (!secret) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${secret}`;
}

async function handleReminderRun(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await processBookingReminders();
  return NextResponse.json({ status: 'ok' });
}

// Vercel Cron invokes this endpoint via GET.
export async function GET(request: NextRequest) {
  return handleReminderRun(request);
}

// Keep POST for manual triggers from scripts/tools.
export async function POST(request: NextRequest) {
  return handleReminderRun(request);
}
