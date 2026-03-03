# Tislo — Arquitectura Técnica Actual (Fuente de Verdad)

Este documento define la arquitectura vigente del proyecto para usarla como referencia en futuras modificaciones.

## Objetivo de este README

- Recordar el stack técnico real en producción/desarrollo.
- Establecer reglas de arquitectura para no romper patrones actuales.
- Evitar cambios que introduzcan regresiones (ej. hydration mismatch).

---

## 1) Stack técnico actual

### Frontend / App
- Next.js (App Router)
- React 19 + TypeScript
- Tailwind CSS (estilos utilitarios y layout principal)
- Chakra UI (uso puntual en módulos/dashboard)
- Lucide React (iconografía)
- Sonner (toasts)
- next-themes (tema)

### Backend / Datos
- Supabase (Auth + sesión SSR + servicios)
- PostgreSQL (base de datos principal)
- Prisma ORM (`@prisma/client` + `prisma`)
- API Routes de Next.js en `app/api/**`

### Infra / Build
- Node >= 18
- Build: `prisma generate && next build`
- Dev: `next dev --turbopack`

---

## 2) Estructura de alto nivel

- `app/`
  - `app/[locale]/` rutas internacionalizadas (ES/EN)
  - `app/book/[token]/` reserva pública por enlace/token
  - `app/api/` endpoints server-side
- `components/`
  - `components/ui/` componentes base compartidos
  - `components/booking/`, `components/services/`, `components/dashboard/` módulos de dominio
  - `components/providers/` providers globales/por módulo
- `lib/`
  - `lib/repositories/` acceso a datos con Prisma
  - `lib/services/` lógica de negocio
  - `lib/supabase/` clientes SSR/browser + middleware sesión
  - `lib/utils/`, `lib/types/`
- `prisma/`
  - `schema.prisma` (modelo de datos y relaciones)

---

## 3) Arquitectura por capas (patrón actual)

### Capa Web/UI
- Páginas y layouts en `app/**`.
- Componentes visuales en `components/**`.
- UI consume servicios del cliente (`lib/services/*`) o endpoints `app/api/*`.

### Capa API (server)
- Endpoints en `app/api/**/route.ts`.
- Validan entrada, resuelven token/identidad y orquestan casos de uso.
- Delegan persistencia a repositorios (`lib/repositories/*`).

### Capa de negocio
- Servicios en `lib/services/*` (p. ej. cálculo de disponibilidad, agregaciones, reglas de reserva).

### Capa de persistencia
- Repositorios Prisma en `lib/repositories/*`.
- Operaciones transaccionales con `prisma.$transaction` cuando corresponde.

### Capa de autenticación/sesión
- Supabase SSR + middleware en:
  - `middleware.ts`
  - `lib/supabase/middleware.ts`
  - `lib/supabase/server.ts`

---

## 4) i18n y routing

- Locales activos: `es`, `en`.
- Layout principal por locale: `app/[locale]/layout.tsx`.
- Diccionarios server-only en `lib/dictionaries.ts` + `dictionaries/*.json`.
- Rutas públicas y protegidas conviven bajo prefijo locale (`/es/...`, `/en/...`).

---

## 5) Decisiones clave de UI (importante)

## Regla A — Tailwind como base global
- El layout global por locale usa Tailwind + providers de tema/auth.
- No introducir providers de Chakra globalmente en todo el árbol si no es necesario.

## Regla B — Chakra aislado por módulo
- Chakra UI se usa de forma localizada (ej. dashboard) para evitar problemas de hidratación.
- Cuando un módulo use Chakra SSR, envolver ese módulo con:
  - `CacheProvider` (`@chakra-ui/next-js`)
  - `ChakraUIProvider`
- Evitar mezclar estrategias de inyección de estilos de Chakra a nivel global y local al mismo tiempo.

## Regla C — Evitar hydration mismatch
- No renderizar HTML diferente entre server/client.
- Evitar lógica de render condicional por `window` en primera pintura.
- Evitar valores no deterministas en render SSR (`Date.now()`, `Math.random()`, etc.).

---

## 6) Dominio funcional actual

### Reservas
- Flujo público por token (`/book/[token]`).
- Disponibilidad calculada por horarios + reservas existentes + duración total.
- Soporte de múltiples servicios por reserva.

### Servicios y modificadores
- Servicios con duración/precio.
- Modificadores condicionales (`service_modifiers`) que ajustan duración/precio.
- Modificadores aplicados por reserva (`booking_service_modifiers`).

### Tiendas y horarios
- Multi-tienda por owner.
- Horarios semanales (`shop_schedules`) y excepciones (`schedule_exceptions`).

---

## 7) Modelo de datos (resumen)

Entidades centrales en `prisma/schema.prisma`:
- `profiles`, `shops`
- `services`, `service_modifiers`
- `bookings`, `booking_services`, `booking_service_modifiers`
- `shop_schedules`, `schedule_exceptions`
- `customers`, `customer_tags`
- `booking_links`, `verification_codes`, `notifications`, `message_templates`

Notas:
- Base PostgreSQL con RLS en varias tablas.
- Índices definidos para consultas de agenda y relaciones principales.

---

## 8) Flujo técnico de disponibilidad (resumen)

1. Cliente llama `GET /api/booking/[token]/availability`.
2. API valida token y obtiene shop + servicios.
3. Calcula `totalDuration` (servicios + adicional).
4. Repositorio trae reservas del día (`pending`, `confirmed`).
5. `AvailabilityCalculator` genera slots por horarios y marca disponibilidad según conflictos y duración.

Referencia completa: `CALENDAR_AVAILABILITY_README.md`.

---

## 9) Reglas para futuras modificaciones (obligatorias)

1. Respetar App Router y segmentación por `[locale]`.
2. Mantener patrón `app/api -> services -> repositories -> prisma`.
3. No saltarse repositorios Prisma desde UI.
4. Si se agrega UI con Chakra fuera de dashboard, aislarla por módulo con `CacheProvider` + `ChakraUIProvider`.
5. No mover providers globales sin validar SSR/hidratación en landing y dashboard.
6. Cualquier feature nueva de reservas debe mantener consistencia con `AvailabilityCalculator` y validación de slot.
7. Mantener compatibilidad con multi-tienda y estados de reserva existentes.

---

## 10) Checklist rápido antes de merge

- [ ] ¿Respeta esta arquitectura por capas?
- [ ] ¿No introdujo cambios globales de provider UI sin necesidad?
- [ ] ¿No rompe rutas i18n (`/es`, `/en`)?
- [ ] ¿No rompe flujo de reservas por token?
- [ ] ¿Compila con `npm run build`?

---

## 11) Archivos de referencia principales

- `package.json`
- `app/[locale]/layout.tsx`
- `app/[locale]/dashboard/layout.tsx`
- `middleware.ts`
- `lib/dictionaries.ts`
- `lib/services/availability-calculator.ts`
- `lib/repositories/booking-repository.ts`
- `lib/supabase/server.ts`
- `prisma/schema.prisma`

---

Documento creado para preservar la arquitectura actual y usarlo como guía de implementación en cambios futuros.
