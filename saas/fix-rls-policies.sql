-- Verificar si las tablas existen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('service_modifiers', 'booking_service_modifiers', 'customer_tags');

-- Eliminar políticas existentes si hay problemas
DROP POLICY IF EXISTS "Enable all for authenticated users" ON service_modifiers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON booking_service_modifiers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON customer_tags;

-- Crear políticas más permisivas temporalmente
CREATE POLICY "Allow all operations" ON service_modifiers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON booking_service_modifiers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON customer_tags FOR ALL USING (true);