"use client";

import { useParams } from "next/navigation";
import { ShopCalendar } from "@/components/calendar/ShopCalendar";

export default function CalendarPage() {
  const params = useParams<{ shopId: string }>();
  const shopId = params.shopId as string;
  if (!shopId) return null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Agenda</h1>
      <ShopCalendar shopId={shopId} />
    </div>
  );
}