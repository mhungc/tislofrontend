import { NextResponse } from "next/server";
import { createBooking, listBookings } from "@/lib/mockdb";

function extractShopId(req: Request): string {
  const { pathname } = new URL(req.url);
  const parts = pathname.split("/");
  const i = parts.indexOf("shops");
  return i >= 0 && parts[i + 1] ? decodeURIComponent(parts[i + 1]) : "";
}

export async function GET(req: Request) {
  const shopId = extractShopId(req);
  return NextResponse.json({ bookings: listBookings(shopId) });
}

export async function POST(req: Request) {
  const shopId = extractShopId(req);
  const body = await req.json();
  try {
    const created = createBooking({ shopId, serviceId: body.serviceId, startISO: body.startISO, title: body.title });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}