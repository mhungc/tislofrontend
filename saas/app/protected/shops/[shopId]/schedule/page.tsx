"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WeeklyScheduleEditor } from "@/components/schedule/WeeklyScheduleEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type WeeklySchedule } from "@/lib/types";

const timezones = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Argentina/Buenos_Aires",
  "Europe/Madrid",
];

export default function SchedulePage() {
  const params = useParams<{ shopId: string }>();
  const shopId = params.shopId as string;
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/shops/${shopId}/schedule`);
    if (res.ok) {
      const data = await res.json();
      setSchedule(data);
    }
  }, [shopId]);

  useEffect(() => {
    if (shopId) load();
  }, [shopId, load]);

  async function save() {
    if (!schedule) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      if (!res.ok) throw new Error("Error guardando");
    } finally {
      setSaving(false);
    }
  }

  if (!schedule) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Horario semanal</h1>
      <WeeklyScheduleEditor shopId={shopId} />
      <Card>
        <CardContent className="pt-6">
          <Button onClick={save} disabled={saving}>Guardar cambios</Button>
        </CardContent>
      </Card>
    </div>
  );
}