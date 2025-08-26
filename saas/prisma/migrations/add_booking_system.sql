-- Crear tabla booking_links
CREATE TABLE IF NOT EXISTS public.booking_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para booking_links
CREATE INDEX IF NOT EXISTS idx_booking_links_shop_id ON public.booking_links(shop_id);
CREATE INDEX IF NOT EXISTS idx_booking_links_token ON public.booking_links(token);
CREATE INDEX IF NOT EXISTS idx_booking_links_expires_at ON public.booking_links(expires_at);

-- Actualizar tabla bookings para soportar reservas sin customer_id
ALTER TABLE public.bookings 
ALTER COLUMN customer_id DROP NOT NULL;

-- Agregar campos para datos del cliente directamente en bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(255);

-- Actualizar booking_services para incluir duration_minutes
ALTER TABLE public.booking_services 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

-- Actualizar bookings para incluir campos necesarios
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS total_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) DEFAULT 0;

-- Cambiar tipos de datos para start_time y end_time
ALTER TABLE public.bookings 
ALTER COLUMN start_time TYPE VARCHAR(5),
ALTER COLUMN end_time TYPE VARCHAR(5);

-- Habilitar RLS en booking_links
ALTER TABLE public.booking_links ENABLE ROW LEVEL SECURITY;

-- Política para que los propietarios puedan gestionar sus enlaces
CREATE POLICY "Users can manage their shop booking links" ON public.booking_links
    FOR ALL USING (
        shop_id IN (
            SELECT id FROM public.shops WHERE owner_id = auth.uid()
        )
    );

-- Política para acceso público a enlaces válidos (solo lectura)
CREATE POLICY "Public can read valid booking links" ON public.booking_links
    FOR SELECT USING (
        is_active = true AND 
        expires_at > now() AND 
        (max_uses IS NULL OR current_uses < max_uses)
    );