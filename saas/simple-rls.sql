-- Políticas RLS simples para desarrollo
-- Ejecutar en Supabase SQL Editor

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "service_modifiers_select" ON service_modifiers;
DROP POLICY IF EXISTS "service_modifiers_insert" ON service_modifiers;
DROP POLICY IF EXISTS "service_modifiers_update" ON service_modifiers;
DROP POLICY IF EXISTS "service_modifiers_delete" ON service_modifiers;
DROP POLICY IF EXISTS "booking_modifiers_all" ON booking_service_modifiers;
DROP POLICY IF EXISTS "customer_tags_all" ON customer_tags;

-- Políticas simples que permiten todo para usuarios autenticados
CREATE POLICY "modifiers_all_authenticated" ON service_modifiers
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "booking_modifiers_all_authenticated" ON booking_service_modifiers
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "customer_tags_all_authenticated" ON customer_tags
FOR ALL USING (auth.role() = 'authenticated');