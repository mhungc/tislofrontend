import { NextResponse } from "next/server";
import { createShop, listShops } from "@/lib/mockdb";

export async function GET() {
  return NextResponse.json({ shops: listShops() });
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const created = createShop({ name: body.name, timezone: body.timezone, description: body.description });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}