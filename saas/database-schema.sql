-- 🏗️ Esquema de Base de Datos para SaaS de Reservas
-- MVP: Sistema de reservas con tiendas, servicios y configuración de horarios

-- ========================================
-- TABLAS DE AUTENTICACIÓN Y USUARIOS
-- ========================================

-- Tabla de perfiles de usuario (extensión de auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLAS PRINCIPALES DEL NEGOCIO
-- ========================================

-- Tiendas (shops)
CREATE TABLE shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  timezone TEXT,
  business_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Servicios ofrecidos por las tiendas
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuración de horarios semanales por tienda
CREATE TABLE shop_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_working_day BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shop_id, day_of_week)
);

-- Excepciones de horario (días específicos con horarios diferentes)
CREATE TABLE schedule_exceptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  exception_date DATE NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shop_id, exception_date)
);

-- ========================================
-- TABLAS DE RESERVAS Y CLIENTES
-- ========================================

-- Clientes (pueden ser anónimos o registrados)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservas
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detalles de servicios en cada reserva
CREATE TABLE booking_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLAS DE NOTIFICACIONES Y COMUNICACIÓN
-- ========================================

-- Plantillas de mensajes para WhatsApp/Email
CREATE TABLE message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email')),
  subject TEXT, -- Para emails
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historial de notificaciones enviadas
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email')),
  recipient TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ========================================

-- Índices para búsquedas rápidas
CREATE INDEX idx_shops_owner_id ON shops(owner_id);
CREATE INDEX idx_services_shop_id ON services(shop_id);
CREATE INDEX idx_bookings_shop_date ON bookings(shop_id, booking_date);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_shop_schedules_shop_day ON shop_schedules(shop_id, day_of_week);
CREATE INDEX idx_schedule_exceptions_shop_date ON schedule_exceptions(shop_id, exception_date);

-- ========================================
-- FUNCIONES Y TRIGGERS
-- ========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_schedules_updated_at BEFORE UPDATE ON shop_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_exceptions_updated_at BEFORE UPDATE ON schedule_exceptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para shops
CREATE POLICY "Shop owners can manage their shops" ON shops FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Anyone can view active shops" ON shops FOR SELECT USING (is_active = true);

-- Políticas para services
CREATE POLICY "Shop owners can manage their services" ON services FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true);

-- Políticas para shop_schedules
CREATE POLICY "Shop owners can manage their schedules" ON shop_schedules FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Anyone can view shop schedules" ON shop_schedules FOR SELECT USING (true);

-- Políticas para schedule_exceptions
CREATE POLICY "Shop owners can manage their exceptions" ON schedule_exceptions FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Anyone can view schedule exceptions" ON schedule_exceptions FOR SELECT USING (true);

-- Políticas para bookings
CREATE POLICY "Shop owners can view their bookings" ON bookings FOR SELECT USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Customers can view their own bookings" ON bookings FOR SELECT USING (customer_id IN (
  SELECT id FROM customers WHERE email = (SELECT email FROM profiles WHERE id = auth.uid())
));
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Shop owners can update their bookings" ON bookings FOR UPDATE USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Políticas para customers
CREATE POLICY "Anyone can create customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view their own data" ON customers FOR SELECT USING (
  email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Políticas para message_templates
CREATE POLICY "Shop owners can manage their templates" ON message_templates FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Políticas para notifications
CREATE POLICY "Shop owners can view their notifications" ON notifications FOR SELECT USING (
  booking_id IN (SELECT id FROM bookings WHERE shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
);
CREATE POLICY "Anyone can create notifications" ON notifications FOR INSERT WITH CHECK (true);

