"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Service {
  id: string;
  shopId: string;
  name: string;
  durationMinutes: number;
  price: number;
  description?: string;
}

export default function ServicesPage() {
  const params = useParams<{ shopId: string }>();
  const shopId = params.shopId as string;

  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    const res = await fetch(`/api/shops/${shopId}/services`);
    const data = await res.json();
    setServices(data.services ?? []);
  }, [shopId]);

  useEffect(() => {
    if (shopId) fetchServices();
  }, [shopId, fetchServices]);

  async function createService() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, durationMinutes: duration, price, description }),
      });
      if (!res.ok) throw new Error("Error creando servicio");
      setName("");
      setDuration(60);
      setPrice(0);
      setDescription("");
      await fetchServices();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Servicios</h1>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Corte de cabello" />
            </div>
            <div>
              <Label>Duración (min)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
            <div>
              <Label>Precio</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <Button onClick={createService} disabled={loading || !name.trim()}>Crear servicio</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {services.map((svc) => (
          <Card key={svc.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{svc.name}</div>
                  <div className="text-xs text-muted-foreground">{svc.durationMinutes} min · ${svc.price.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}