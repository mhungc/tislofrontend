-- 1. Verificar que las tablas existen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('service_modifiers', 'booking_service_modifiers', 'customer_tags');

-- 2. Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Enable all for authenticated users" ON service_modifiers;
DROP POLICY IF EXISTS "Allow all operations" ON service_modifiers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON booking_service_modifiers;
DROP POLICY IF EXISTS "Allow all operations" ON booking_service_modifiers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON customer_tags;
DROP POLICY IF EXISTS "Allow all operations" ON customer_tags;

-- 3. Deshabilitar RLS temporalmente para verificar
ALTER TABLE service_modifiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_service_modifiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags DISABLE ROW LEVEL SECURITY;

-- 4. Volver a habilitar RLS con políticas correctas
ALTER TABLE service_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_service_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas específicas para service_modifiers
CREATE POLICY "service_modifiers_select" ON service_modifiers
FOR SELECT USING (
  service_id IN (
    SELECT s.id FROM services s
    JOIN shops sh ON s.shop_id = sh.id
    JOIN profiles p ON sh.owner_id = p.id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "service_modifiers_insert" ON service_modifiers
FOR INSERT WITH CHECK (
  service_id IN (
    SELECT s.id FROM services s
    JOIN shops sh ON s.shop_id = sh.id
    JOIN profiles p ON sh.owner_id = p.id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "service_modifiers_update" ON service_modifiers
FOR UPDATE USING (
  service_id IN (
    SELECT s.id FROM services s
    JOIN shops sh ON s.shop_id = sh.id
    JOIN profiles p ON sh.owner_id = p.id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "service_modifiers_delete" ON service_modifiers
FOR DELETE USING (
  service_id IN (
    SELECT s.id FROM services s
    JOIN shops sh ON s.shop_id = sh.id
    JOIN profiles p ON sh.owner_id = p.id
    WHERE p.id = auth.uid()
  )
);

-- 6. Políticas para booking_service_modifiers
CREATE POLICY "booking_modifiers_all" ON booking_service_modifiers
FOR ALL USING (
  booking_id IN (
    SELECT b.id FROM bookings b
    JOIN shops sh ON b.shop_id = sh.id
    JOIN profiles p ON sh.owner_id = p.id
    WHERE p.id = auth.uid()
  )
);

-- 7. Políticas para customer_tags (más permisivas)
CREATE POLICY "customer_tags_all" ON customer_tags
FOR ALL USING (auth.role() = 'authenticated');