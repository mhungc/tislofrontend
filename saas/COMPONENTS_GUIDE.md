# 🎯 Guía de Componentes CRUD - SaaS de Reservas

Esta guía explica cómo usar todos los componentes CRUD creados para el sistema de reservas.

## 📋 Índice

1. [Componentes de Tiendas](#componentes-de-tiendas)
2. [Componentes de Horarios](#componentes-de-horarios)
3. [Componentes de Calendario](#componentes-de-calendario)
4. [Componentes de Servicios](#componentes-de-servicios)
5. [Componentes de Reservas](#componentes-de-reservas)
6. [Componentes de Clientes](#componentes-de-clientes)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🏪 Componentes de Tiendas

### ShopForm
Formulario para crear y editar tiendas.

```tsx
import { ShopForm } from '@/components'

<ShopForm
  shopId="shop-id" // Solo para edición
  onSave={() => console.log('Tienda guardada')}
  onCancel={() => console.log('Cancelado')}
/>
```

### ShopsList
Lista de tiendas con funcionalidades de búsqueda y gestión.

```tsx
import { ShopsList } from '@/components'

<ShopsList
  onShopSelect={(shopId) => console.log('Tienda seleccionada:', shopId)}
  onShopEdit={(shopId) => console.log('Editar tienda:', shopId)}
/>
```

---

## 🕐 Componentes de Horarios

### WeeklyScheduleEditor
Editor para configurar horarios semanales de la tienda.

```tsx
import { WeeklyScheduleEditor } from '@/components'

<WeeklyScheduleEditor
  shopId="shop-id"
  onScheduleUpdated={() => console.log('Horarios actualizados')}
/>
```

**Características:**
- Configuración de días laborables
- Horarios de apertura y cierre
- Acciones rápidas (aplicar a todos, copiar horarios)
- Validación de horarios

### ScheduleExceptionsEditor
Gestión de excepciones de horario (feriados, horarios especiales).

```tsx
import { ScheduleExceptionsEditor } from '@/components'

<ScheduleExceptionsEditor
  shopId="shop-id"
  onExceptionUpdated={() => console.log('Excepciones actualizadas')}
/>
```

**Características:**
- Crear días cerrados
- Configurar horarios especiales
- Gestión de razones
- Vista de estadísticas

---

## 📅 Componentes de Calendario

### AvailabilityCalendar
Calendario interactivo para mostrar disponibilidad y seleccionar horarios.

```tsx
import { AvailabilityCalendar } from '@/components'

<AvailabilityCalendar
  shopId="shop-id"
  selectedServiceId="service-id"
  onTimeSlotSelect={(date, timeSlot) => {
    console.log('Slot seleccionado:', date, timeSlot)
  }}
/>
```

**Características:**
- Vista de calendario mensual
- Selección de servicios
- Visualización de disponibilidad
- Slots de tiempo interactivos
- Información de servicios

---

## 🛠️ Componentes de Servicios

### ServiceForm
Formulario para crear y editar servicios.

```tsx
import { ServiceForm } from '@/components'

<ServiceForm
  shopId="shop-id"
  serviceId="service-id" // Solo para edición
  onSave={() => console.log('Servicio guardado')}
  onCancel={() => console.log('Cancelado')}
/>
```

**Campos:**
- Nombre del servicio
- Descripción
- Duración (minutos)
- Precio
- Estado activo/inactivo

### ServicesList
Lista de servicios con gestión completa.

```tsx
import { ServicesList } from '@/components'

<ServicesList
  shopId="shop-id"
  onServiceSelect={(serviceId) => console.log('Servicio seleccionado:', serviceId)}
  onServiceEdit={(serviceId) => console.log('Editar servicio:', serviceId)}
/>
```

**Funcionalidades:**
- Búsqueda por nombre/descripción
- Filtros por estado
- Activar/desactivar servicios
- Duplicar servicios
- Eliminar servicios
- Estadísticas

---

## 📋 Componentes de Reservas

### BookingForm
Formulario completo para crear y editar reservas.

```tsx
import { BookingForm } from '@/components'

<BookingForm
  shopId="shop-id"
  bookingId="booking-id" // Solo para edición
  onSave={() => console.log('Reserva guardada')}
  onCancel={() => console.log('Cancelado')}
/>
```

**Secciones:**
1. **Información del Cliente**
   - Nombre completo
   - Email
   - Teléfono

2. **Detalles de la Reserva**
   - Fecha
   - Hora de inicio/fin
   - Estado
   - Notas

3. **Servicios**
   - Selección múltiple de servicios
   - Cálculo automático de total y duración

### BookingsList
Lista de reservas con filtros y gestión.

```tsx
import { BookingsList } from '@/components'

<BookingsList
  shopId="shop-id"
  onBookingSelect={(bookingId) => console.log('Reserva seleccionada:', bookingId)}
  onBookingEdit={(bookingId) => console.log('Editar reserva:', bookingId)}
/>
```

---

## 👥 Componentes de Clientes

### CustomerForm
Formulario para crear y editar clientes.

```tsx
import { CustomerForm } from '@/components'

<CustomerForm
  customerId="customer-id" // Solo para edición
  onSave={() => console.log('Cliente guardado')}
  onCancel={() => console.log('Cancelado')}
/>
```

### CustomersList
Lista de clientes con búsqueda y gestión.

```tsx
import { CustomersList } from '@/components'

<CustomersList
  shopId="shop-id"
  onCustomerSelect={(customerId) => console.log('Cliente seleccionado:', customerId)}
  onCustomerEdit={(customerId) => console.log('Editar cliente:', customerId)}
/>
```

---

## 🎯 Ejemplos de Uso

### Página de Gestión de Tienda

```tsx
'use client'

import { useState } from 'react'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  ShopsList,
  WeeklyScheduleEditor,
  ScheduleExceptionsEditor,
  ServicesList,
  ServiceForm,
  BookingsList,
  BookingForm
} from '@/components'

export default function ShopManagementPage({ shopId }: { shopId: string }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string>()
  const [selectedBookingId, setSelectedBookingId] = useState<string>()

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="schedule">Horarios</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="bookings">Reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Dashboard con estadísticas */}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="space-y-6">
            <WeeklyScheduleEditor 
              shopId={shopId}
              onScheduleUpdated={() => console.log('Horarios actualizados')}
            />
            <ScheduleExceptionsEditor 
              shopId={shopId}
              onExceptionUpdated={() => console.log('Excepciones actualizadas')}
            />
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-6">
            {showServiceForm ? (
              <ServiceForm
                shopId={shopId}
                serviceId={selectedServiceId}
                onSave={() => {
                  setShowServiceForm(false)
                  setSelectedServiceId(undefined)
                }}
                onCancel={() => {
                  setShowServiceForm(false)
                  setSelectedServiceId(undefined)
                }}
              />
            ) : (
              <ServicesList
                shopId={shopId}
                onServiceEdit={(serviceId) => {
                  setSelectedServiceId(serviceId)
                  setShowServiceForm(true)
                }}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="space-y-6">
            {showBookingForm ? (
              <BookingForm
                shopId={shopId}
                bookingId={selectedBookingId}
                onSave={() => {
                  setShowBookingForm(false)
                  setSelectedBookingId(undefined)
                }}
                onCancel={() => {
                  setShowBookingForm(false)
                  setSelectedBookingId(undefined)
                }}
              />
            ) : (
              <BookingsList
                shopId={shopId}
                onBookingEdit={(bookingId) => {
                  setSelectedBookingId(bookingId)
                  setShowBookingForm(true)
                }}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Página de Calendario Público

```tsx
'use client'

import { useState } from 'react'
import { AvailabilityCalendar } from '@/components'

export default function PublicCalendarPage({ shopId }: { shopId: string }) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reservar Cita</h1>
      
      <AvailabilityCalendar
        shopId={shopId}
        selectedServiceId={selectedServiceId}
        onTimeSlotSelect={(date, timeSlot) => {
          console.log('Slot seleccionado:', date, timeSlot)
          // Aquí iría la lógica para crear la reserva
        }}
      />
    </div>
  )
}
```

---

## 🔧 Configuración Requerida

### Dependencias

Asegúrate de tener instaladas las siguientes dependencias:

```bash
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-checkbox @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-dropdown-menu @radix-ui/react-sheet @radix-ui/react-separator @radix-ui/react-skeleton @radix-ui/react-progress @radix-ui/react-avatar @radix-ui/react-calendar @radix-ui/react-form @radix-ui/react-toast sonner lucide-react date-fns
```

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=tu-anon-key
```

### Configuración de Supabase

Asegúrate de que tu proyecto Supabase tenga:
- Las tablas creadas según el esquema
- Las políticas RLS configuradas
- Los triggers de `updated_at` funcionando

---

## 🎨 Personalización

Todos los componentes usan Tailwind CSS y pueden ser personalizados fácilmente:

```tsx
<ServiceForm 
  className="max-w-2xl mx-auto" // Personalizar layout
  shopId="shop-id"
  onSave={() => {}}
  onCancel={() => {}}
/>
```

Los componentes también soportan temas oscuros/claros automáticamente a través de las clases de Tailwind.

---

## 🚀 Próximos Pasos

1. **Implementar autenticación** con Supabase Auth
2. **Agregar notificaciones** por email/SMS
3. **Integrar pagos** con Stripe/PayPal
4. **Crear dashboard** con gráficos y estadísticas
5. **Implementar búsqueda avanzada** y filtros
6. **Agregar exportación** de datos (PDF, Excel)
7. **Crear API endpoints** para integraciones externas

---

## 📞 Soporte

Si tienes preguntas sobre el uso de estos componentes, consulta:
- La documentación de Supabase
- Los archivos de tipos TypeScript
- Los comentarios en el código
- Los ejemplos de uso en esta guía
