# ReservaFácil - Sistema de Gestión de Reservas

Sistema completo de gestión de reservas online para negocios de servicios como peluquerías, consultorios médicos, spas y centros de bienestar.

## 🚀 Características Principales

### ✅ Autenticación y Usuarios
- **Google OAuth2** integrado con Supabase Auth
- **Gestión de perfiles** automática
- **Protección de rutas** con middleware
- **Soporte multiidioma** (ES/EN)

### ✅ Gestión de Tiendas
- **CRUD completo** de tiendas
- **Configuración de horarios** semanales
- **Excepciones de horario** (días festivos, vacaciones)
- **Múltiples tiendas** por usuario

### ✅ Sistema de Servicios
- **Gestión de servicios** con precios y duración
- **Modificadores inteligentes** para ajustes automáticos:
  - Por tipo de cliente (niños, adultos mayores)
  - Por primera visita
  - Por etiquetas personalizadas
- **Activación/desactivación** de servicios

### ✅ Reservas Online
- **Enlaces públicos** de reserva por tienda
- **Calendario interactivo** con disponibilidad en tiempo real
- **Selección múltiple** de servicios
- **Aplicación automática** de modificadores
- **Formulario de contacto** del cliente
- **Confirmación por email**

### ✅ Dashboard Administrativo
- **Vista de calendario** con todas las reservas
- **Gestión manual** de reservas
- **Estados de reserva** (pendiente, confirmada, cancelada)
- **Filtros por servicio** y fecha
- **Resumen financiero**

### ✅ Calendario y Disponibilidad
- **Cálculo automático** de slots disponibles
- **Consideración de horarios** de la tienda
- **Bloqueo de horarios** ocupados
- **Duración variable** según servicios seleccionados

### ✅ Algoritmo Actual de Booking/Calendario
- **Fecha solicitada estable por calendario:** `YYYY-MM-DD` se interpreta como fecha de calendario (sin comparación lexicográfica por texto).
- **Día de semana consistente:** se calcula desde la fecha solicitada para evitar desfases por zona horaria del servidor.
- **Horarios semanales activos:** un bloque se considera laborable cuando `is_working_day !== false` (incluye `null` como abierto).
- **Horas de apertura/cierre sin drift:** los campos `TIME` (`open_time`, `close_time`) se normalizan a `HH:MM` usando extracción UTC para no desplazar horas.
- **Duración efectiva por reserva:** `blockedMinutes = ceil(totalDuration / baseSlotMinutes) * baseSlotMinutes`.
- **Conflictos con reservas + buffer:** un slot entra en conflicto si cae en `[start_time, end_time + buffer_minutes)`.
- **Filtrado de horas pasadas (solo hoy):** para el día actual en la zona horaria de la tienda, se bloquean slots anteriores a `now`.
- **Respuesta de disponibilidad:** API devuelve `slots` y, cuando aplica, `fillableGaps` para huecos rellenables.

Referencia detallada: `CALENDAR_AVAILABILITY_README.md`.

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** con App Router
- **React 19** con TypeScript
- **Tailwind CSS** para estilos
- **Radix UI** para componentes
- **Lucide React** para iconos
- **Sonner** para notificaciones

### Backend
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** como base de datos
- **Prisma ORM** para manejo de datos
- **Supabase Auth** para autenticación
- **Edge Functions** para lógica de negocio

### Deployment
- **Vercel** para hosting y CI/CD
- **Variables de entorno** configuradas
- **Build optimizado** para producción

## 📁 Estructura del Proyecto

```
saas/
├── app/                          # App Router de Next.js
│   ├── [locale]/                # Rutas internacionalizadas
│   │   ├── auth/               # Páginas de autenticación
│   │   ├── dashboard/          # Dashboard administrativo
│   │   │   ├── bookings/       # Gestión de reservas
│   │   │   ├── services/       # Gestión de servicios
│   │   │   ├── shops/          # Gestión de tiendas
│   │   │   └── schedule/       # Configuración de horarios
│   │   └── protected/          # Rutas protegidas
│   ├── book/                   # Reservas públicas
│   │   └── [token]/           # Página de reserva por token
│   └── api/                    # API Routes
│       ├── auth/              # Endpoints de autenticación
│       ├── booking/           # API de reservas públicas
│       └── shops/             # API de gestión de tiendas
├── components/                 # Componentes React
│   ├── booking/               # Componentes de reserva
│   ├── calendar/              # Componentes de calendario
│   ├── services/              # Componentes de servicios
│   ├── shops/                 # Componentes de tiendas
│   └── ui/                    # Componentes base (shadcn/ui)
├── lib/                       # Librerías y utilidades
│   ├── repositories/          # Capa de acceso a datos
│   ├── services/              # Lógica de negocio
│   ├── supabase/             # Configuración de Supabase
│   └── types/                # Definiciones de tipos
└── prisma/                   # Esquema de base de datos
```

## 🗄️ Modelo de Base de Datos

### Tablas Principales
- **profiles** - Perfiles de usuario
- **shops** - Tiendas/negocios
- **services** - Servicios ofrecidos
- **shop_schedules** - Horarios semanales
- **schedule_exceptions** - Excepciones de horario
- **service_modifiers** - Modificadores de servicios
- **bookings** - Reservas
- **booking_services** - Servicios por reserva
- **booking_links** - Enlaces de reserva
- **customers** - Clientes (generados automáticamente)

### Relaciones Clave
- Usuario → Múltiples Tiendas
- Tienda → Múltiples Servicios
- Tienda → Horarios Semanales
- Servicio → Modificadores
- Reserva → Múltiples Servicios
- Reserva → Cliente

## ⚙️ Configuración del Proyecto

### 1. Variables de Entorno
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Base de datos
DATABASE_URL=tu_database_url

# Sitio
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

### 2. Configuración de Google OAuth2

**Google Cloud Console:**
- Authorized JavaScript origins: `http://localhost:3000`, `https://tu-app.vercel.app`
- Authorized redirect URIs: `http://localhost:3000/auth/callback`, `https://tu-app.vercel.app/auth/callback`

**Supabase Dashboard:**
- Site URL: `https://tu-app.vercel.app`
- Redirect URLs: `http://localhost:3000/**`, `https://tu-app.vercel.app/**`

### 3. Scripts de Desarrollo
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Generar cliente Prisma
npm run prisma:generate

# Sincronizar esquema con DB
npm run prisma:push
```

## 🚀 Deployment en Vercel

### Configuración Automática
- **Build Command:** `prisma generate && next build`
- **Install Command:** `npm install`
- **Output Directory:** `.next`

### Variables de Entorno en Vercel
Configurar todas las variables de entorno en el dashboard de Vercel bajo Settings → Environment Variables.

## 🔧 Funcionalidades Implementadas Hoy

### ✅ Correcciones de Build
- Resueltos **todos los errores de TypeScript**
- Corregidos **componentes de Radix UI** (Select, Switch)
- Agregados **métodos faltantes** en servicios y repositorios
- Solucionados **problemas de tipos** en Supabase

### ✅ Configuración de Deployment
- **Script de build** con Prisma generate
- **Variables de entorno** para producción
- **Configuración OAuth2** para múltiples dominios
- **Layout correcto** para rutas públicas

### ✅ Estructura de Rutas
- **Rutas internacionalizadas** con [locale]
- **Rutas públicas** para reservas (/book/[token])
- **API endpoints** completos
- **Middleware** de autenticación

### ✅ Componentes y UI
- **Formularios de reserva** completos
- **Calendario interactivo** con disponibilidad
- **Dashboard administrativo** funcional
- **Modificadores inteligentes** implementados

## 📋 Casos de Uso

### Para Dueños de Negocio
1. **Registro** con Google OAuth2
2. **Crear tienda** con información básica
3. **Configurar servicios** con precios y duración
4. **Establecer horarios** semanales
5. **Generar enlaces** de reserva
6. **Gestionar reservas** desde el dashboard

### Para Clientes
1. **Acceder** al enlace de reserva
2. **Seleccionar servicios** deseados
3. **Elegir fecha y hora** disponible
4. **Completar información** de contacto
5. **Confirmar reserva** y recibir confirmación

## 🎯 Tipos de Negocio Soportados

- **💇‍♀️ Peluquerías y Salones**
- **🏥 Consultorios Médicos**
- **💆‍♀️ Spas y Centros de Bienestar**
- **🎉 Organización de Eventos**
- **🏋️‍♂️ Entrenadores Personales**
- **🎓 Tutorías y Clases**

## 🔮 Próximas Funcionalidades

- **📊 Reportes y Analytics** avanzados
- **📱 Notificaciones push** y SMS
- **💳 Integración de pagos** online
- **📧 Templates de email** personalizables
- **🔄 Sincronización** con calendarios externos
- **👥 Gestión de empleados** y roles

## 🤝 Contribución

El proyecto está listo para producción y puede ser extendido con nuevas funcionalidades según las necesidades del negocio.

---

**Desarrollado con ❤️ usando Next.js, Supabase y Vercel**