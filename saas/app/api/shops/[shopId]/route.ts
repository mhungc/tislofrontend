import { NextResponse } from "next/server";
import { deleteShop, getShop, updateShop } from "@/lib/mockdb";

function extractShopId(req: Request): string {
  const { pathname } = new URL(req.url);
  const parts = pathname.split("/");
  const i = parts.indexOf("shops");
  return i >= 0 && parts[i + 1] ? decodeURIComponent(parts[i + 1]) : "";
}

export async function GET(req: Request) {
  const shopId = extractShopId(req);
  const shop = getShop(shopId);
  if (!shop) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(shop);
}

export async function PATCH(req: Request) {
  const shopId = extractShopId(req);
  const body = await req.json();
  const updated = updateShop(shopId, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const shopId = extractShopId(req);
  const ok = deleteShop(shopId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}