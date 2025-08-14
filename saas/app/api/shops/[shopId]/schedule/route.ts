import { NextResponse } from "next/server";
import { getSchedule, upsertSchedule } from "@/lib/mockdb";

function extractShopId(req: Request): string {
  const { pathname } = new URL(req.url);
  const parts = pathname.split("/");
  const i = parts.indexOf("shops");
  return i >= 0 && parts[i + 1] ? decodeURIComponent(parts[i + 1]) : "";
}

export async function GET(req: Request) {
  const shopId = extractShopId(req);
  const sched = getSchedule(shopId);
  if (!sched) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sched);
}

export async function PUT(req: Request) {
  const shopId = extractShopId(req);
  const body = await req.json();
  try {
    const updated = upsertSchedule({ ...body, shopId });
    return NextResponse.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}