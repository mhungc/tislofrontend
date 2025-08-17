# 🗄️ Relaciones de Base de Datos - SaaS de Reservas

## 📊 Diagrama de Relaciones

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   auth.users    │    │    profiles     │    │     shops       │
│                 │    │                 │    │                 │
│ id (UUID)       │◄───┤ id (UUID)       │◄───┤ owner_id (UUID) │
│ email           │    │ email           │    │ name            │
│ created_at      │    │ full_name       │    │ description     │
└─────────────────┘    │ phone           │    │ address         │
                       │ avatar_url      │    │ is_active       │
                       └─────────────────┘    └─────────────────┘
                                                       │
                                                       │ 1:N
                                                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │    services     │    │ shop_schedules  │
                       │                 │    │                 │
                       │ shop_id (UUID)  │    │ shop_id (UUID)  │
                       │ name            │    │ day_of_week     │
                       │ duration_minutes│    │ open_time       │
                       │ price           │    │ close_time      │
                       │ is_active       │    │ is_working_day  │
                       └─────────────────┘    └─────────────────┘
                                                       │
                                                       │ 1:N
                                                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │schedule_exceptions│  │   customers     │
                       │                 │    │                 │
                       │ shop_id (UUID)  │    │ id (UUID)       │
                       │ exception_date  │    │ email           │
                       │ open_time       │    │ phone           │
                       │ close_time      │    │ full_name       │
                       │ is_closed       │    └─────────────────┘
                       └─────────────────┘              │
                                                       │ 1:N
                                                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │    bookings     │    │booking_services │
                       │                 │    │                 │
                       │ shop_id (UUID)  │    │ booking_id (UUID)│
                       │ customer_id (UUID)   │ service_id (UUID)│
                       │ booking_date    │    │ price           │
                       │ start_time      │    └─────────────────┘
                       │ end_time        │
                       │ status          │
                       │ total_amount    │
                       └─────────────────┘
                                 │
                                 │ 1:N
                                 ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  notifications  │    │message_templates│
                       │                 │    │                 │
                       │ booking_id (UUID)│   │ shop_id (UUID)  │
                       │ type            │    │ name            │
                       │ recipient       │    │ type            │
                       │ content         │    │ content         │
                       │ status          │    │ is_active       │
                       └─────────────────┘    └─────────────────┘
```

## 🔗 Relaciones Detalladas

### 1. **Autenticación y Usuarios**
- `auth.users` → `profiles` (1:1)
  - Extensión de la tabla de usuarios de Supabase Auth
  - Almacena información adicional del perfil

### 2. **Tiendas y Propietarios**
- `profiles` → `shops` (1:N)
  - Un usuario puede tener múltiples tiendas
  - Cada tienda tiene un propietario único

### 3. **Servicios por Tienda**
- `shops` → `services` (1:N)
  - Cada tienda puede ofrecer múltiples servicios
  - Servicios incluyen duración y precio

### 4. **Configuración de Horarios**
- `shops` → `shop_schedules` (1:N)
  - Horarios semanales recurrentes (Lunes a Domingo)
  - Configuración de días laborables y horarios

- `shops` → `schedule_exceptions` (1:N)
  - Excepciones para días específicos (vacaciones, días festivos)
  - Permite horarios diferentes o días cerrados

### 5. **Clientes y Reservas**
- `customers` → `bookings` (1:N)
  - Un cliente puede hacer múltiples reservas
  - Los clientes pueden ser anónimos (solo email/teléfono)

- `shops` → `bookings` (1:N)
  - Cada reserva pertenece a una tienda específica

### 6. **Detalles de Reservas**
- `bookings` → `booking_services` (1:N)
  - Cada reserva puede incluir múltiples servicios
  - Almacena el precio al momento de la reserva

- `services` → `booking_services` (1:N)
  - Referencia a los servicios incluidos en la reserva

### 7. **Comunicación y Notificaciones**
- `shops` → `message_templates` (1:N)
  - Plantillas personalizables para WhatsApp/Email
  - Cada tienda puede tener sus propias plantillas

- `bookings` → `notifications` (1:N)
  - Historial de notificaciones enviadas
  - Tracking del estado de entrega

## 🎯 Flujo de Datos del MVP

### 1. **Configuración Inicial**
```
Usuario → Crea Perfil → Crea Tienda → Configura Horarios → Agrega Servicios
```

### 2. **Proceso de Reserva**
```
Cliente → Selecciona Tienda → Ve Disponibilidad → Selecciona Servicios → Confirma Reserva
```

### 3. **Notificaciones**
```
Reserva Creada → Envío WhatsApp/Email → Cliente Recibe URL → Accede a Calendario
```

## 🔒 Seguridad (RLS)

### Políticas Implementadas:
- **Usuarios**: Solo pueden ver/editar su propio perfil
- **Tiendas**: Propietarios pueden gestionar sus tiendas
- **Servicios**: Propietarios gestionan servicios de sus tiendas
- **Reservas**: 
  - Cualquiera puede crear reservas
  - Propietarios ven reservas de sus tiendas
  - Clientes ven sus propias reservas
- **Horarios**: Públicos para consulta, privados para edición

## 📈 Escalabilidad

### Diseño Optimizado para:
- **Múltiples tiendas por usuario**
- **Horarios dinámicos** (no almacena calendario completo)
- **Reservas concurrentes**
- **Notificaciones automáticas**
- **Futuras integraciones de pago**

### Índices Clave:
- `bookings(shop_id, booking_date)` - Búsquedas por tienda y fecha
- `shop_schedules(shop_id, day_of_week)` - Horarios semanales
- `schedule_exceptions(shop_id, exception_date)` - Excepciones de horario
