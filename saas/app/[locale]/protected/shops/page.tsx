"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import Link from "next/link";

interface Shop {
  id: string;
  name: string;
  description?: string;
  timezone: string;
}

const timezones = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Argentina/Buenos_Aires",
  "Europe/Madrid",
];

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [timezone, setTimezone] = useState(timezones[0]);
  const [loading, setLoading] = useState(false);

  async function fetchShops() {
    const res = await fetch("/api/shops");
    const data = await res.json();
    setShops(data.shops ?? []);
  }

  useEffect(() => {
    fetchShops();
  }, []);

  async function createShop() {
    setLoading(true);
    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, timezone }),
      });
      if (!res.ok) throw new Error("Error creando tienda");
      setName("");
      setDescription("");
      setTimezone(timezones[0]);
      await fetchShops();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Tiendas / Servicios</h1>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mi tienda" />
            </div>
            <div>
              <Label>Zona horaria</Label>
              <Select value={timezone} onValueChange={(value) => setTimezone(value)}>
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Descripción</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <Button onClick={createShop} disabled={loading || !name.trim()}>Crear tienda</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shops.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.timezone}</div>
                </div>
                <div className="flex gap-2">
                  <Link className="underline text-sm" href={`/protected/shops/${s.id}/services`}>Servicios</Link>
                  <Link className="underline text-sm" href={`/protected/shops/${s.id}/schedule`}>Horario</Link>
                  <Link className="underline text-sm" href={`/protected/shops/${s.id}/calendar`}>Agenda</Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}