-- Habilitar RLS en las nuevas tablas
ALTER TABLE service_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_service_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;

-- Políticas para service_modifiers
CREATE POLICY "Users can view modifiers of their services" ON service_modifiers
FOR SELECT USING (
  service_id IN (
    SELECT s.id FROM services s
    JOIN shops sh ON s.shop_id = sh.id
    WHERE sh.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create modifiers for their services" ON service_modifiers
FOR INSERT WITH CHECK (
  service_id IN (
    SELECT s.id FROM services s
    JOIN shops sh ON s.shop_id = sh.id
    WHERE sh.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update modifiers of their services" ON service_modifiers
FOR UPDATE USING (
  service_id IN (
    SELECT s.id FROM services s
    JOIN shops sh ON s.shop_id = sh.id
    WHERE sh.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete modifiers of their services" ON service_modifiers
FOR DELETE USING (
  service_id IN (
    SELECT s.id FROM services s
    JOIN shops sh ON s.shop_id = sh.id
    WHERE sh.owner_id = auth.uid()
  )
);

-- Políticas para booking_service_modifiers
CREATE POLICY "Users can view booking modifiers of their shops" ON booking_service_modifiers
FOR SELECT USING (
  booking_id IN (
    SELECT b.id FROM bookings b
    JOIN shops sh ON b.shop_id = sh.id
    WHERE sh.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create booking modifiers for their shops" ON booking_service_modifiers
FOR INSERT WITH CHECK (
  booking_id IN (
    SELECT b.id FROM bookings b
    JOIN shops sh ON b.shop_id = sh.id
    WHERE sh.owner_id = auth.uid()
  )
);

-- Políticas para customer_tags
CREATE POLICY "Users can view customer tags" ON customer_tags
FOR SELECT USING (true);

CREATE POLICY "Users can create customer tags" ON customer_tags
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update customer tags" ON customer_tags
FOR UPDATE USING (true);