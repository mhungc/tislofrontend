"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { weekdayLabelsEs, type DaySchedule, type Interval, type WeeklySchedule } from "@/lib/types";

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Input
      type="time"
      step={60 * 5}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-28"
    />
  );
}

export function WeeklyScheduleEditor({
  value,
  onChange,
  timezoneOptions,
}: {
  value: WeeklySchedule;
  onChange: (v: WeeklySchedule) => void;
  timezoneOptions: string[];
}) {
  const [draft, setDraft] = useState<WeeklySchedule>(value);

  useEffect(() => setDraft(value), [value]);

  function updateDay(dayIndex: number, changes: Partial<DaySchedule>) {
    setDraft((d) => {
      const days = d.days.map((day) => (day.day === dayIndex ? { ...day, ...changes } : day));
      const next = { ...d, days };
      onChange(next);
      return next;
    });
  }

  function addInterval(dayIndex: number) {
    updateDay(dayIndex, {
      intervals: [
        ...draft.days.find((d) => d.day === dayIndex)!.intervals,
        { start: "09:00", end: "13:00" },
      ],
    });
  }

  function updateInterval(dayIndex: number, idx: number, changes: Partial<Interval>) {
    const day = draft.days.find((d) => d.day === dayIndex)!;
    const intervals = day.intervals.map((iv, i) => (i === idx ? { ...iv, ...changes } : iv));
    updateDay(dayIndex, { intervals });
  }

  function removeInterval(dayIndex: number, idx: number) {
    const day = draft.days.find((d) => d.day === dayIndex)!;
    const intervals = day.intervals.filter((_, i) => i !== idx);
    updateDay(dayIndex, { intervals });
  }

  const tzOptions = useMemo(() => timezoneOptions, [timezoneOptions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Label className="w-32">Zona horaria</Label>
          <Select
            value={draft.timezone}
            onChange={(e) => {
              const tz = e.target.value;
              const next = { ...draft, timezone: tz };
              setDraft(next);
              onChange(next);
            }}
          >
            {tzOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {draft.days.map((day) => (
          <div key={day.day} className="border rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label className="w-28">{weekdayLabelsEs[day.day]}</Label>
                <Switch
                  checked={day.enabled}
                  onClick={() => updateDay(day.day, { enabled: !day.enabled })}
                />
              </div>
              <div>
                <Button variant="secondary" size="sm" onClick={() => addInterval(day.day)} disabled={!day.enabled}>
                  Añadir intervalo
                </Button>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {day.intervals.length === 0 && day.enabled && (
                <p className="text-sm text-muted-foreground">No hay intervalos. Añade uno.</p>
              )}
              {day.intervals.map((iv, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <TimeInput
                    value={iv.start}
                    onChange={(v) => updateInterval(day.day, idx, { start: v })}
                  />
                  <span>a</span>
                  <TimeInput
                    value={iv.end}
                    onChange={(v) => updateInterval(day.day, idx, { end: v })}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeInterval(day.day, idx)}>
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}