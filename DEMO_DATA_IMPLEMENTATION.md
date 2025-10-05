# 🎯 Implementación de Datos de Prueba para Cliente Demo

## 📋 Objetivo
Crear un sistema que precargue datos de demostración automáticamente para el primer cliente cuando use su cuenta de Google, permitiéndole ver el sistema funcionando con datos realistas de su tipo de negocio.

## 🔧 Estrategia de Implementación

### 1. **Detección por Email**
- Detectar email específico del cliente en el proceso de autenticación
- Ejecutar seeding automático solo para esa cuenta
- Marcar la cuenta como "demo" para control posterior

### 2. **Estructura de Datos Demo**

#### 🏪 **Tienda Demo:**
```typescript
{
  name: "Salón Bella Vista",
  description: "Salón de belleza integral con servicios premium",
  address: "Av. Principal 123, Centro",
  phone: "+1 (555) 123-4567",
  email: "contacto@salonbellavista.com",
  timezone: "America/Mexico_City"
}
```

#### ⏰ **Horarios:**
```typescript
{
  monday: { open: "09:00", close: "18:00", isOpen: true },
  tuesday: { open: "09:00", close: "18:00", isOpen: true },
  wednesday: { open: "09:00", close: "18:00", isOpen: true },
  thursday: { open: "09:00", close: "18:00", isOpen: true },
  friday: { open: "09:00", close: "19:00", isOpen: true },
  saturday: { open: "08:00", close: "17:00", isOpen: true },
  sunday: { open: "10:00", close: "15:00", isOpen: false }
}
```

#### 💇♀️ **Servicios:**
```typescript
[
  { name: "Corte de Cabello", price: 25, duration: 45, category: "Cabello" },
  { name: "Tinte Completo", price: 80, duration: 120, category: "Cabello" },
  { name: "Mechas", price: 65, duration: 90, category: "Cabello" },
  { name: "Tratamiento Capilar", price: 35, duration: 60, category: "Cabello" },
  { name: "Manicure", price: 15, duration: 30, category: "Uñas" },
  { name: "Pedicure", price: 20, duration: 45, category: "Uñas" },
  { name: "Uñas Gel", price: 30, duration: 60, category: "Uñas" },
  { name: "Limpieza Facial", price: 40, duration: 75, category: "Facial" },
  { name: "Masaje Relajante", price: 50, duration: 60, category: "Bienestar" }
]
```

#### ⚙️ **Modificadores:**
```typescript
[
  { name: "Primera Visita", type: "discount", value: 10, condition: "first_visit" },
  { name: "Adultos Mayores", type: "discount", value: 15, condition: "senior" },
  { name: "Estudiantes", type: "discount", value: 10, condition: "student" },
  { name: "Servicios Premium", type: "surcharge", value: 20, condition: "premium" }
]
```

#### 📅 **Reservas de Ejemplo (Próxima Semana):**
```typescript
[
  {
    date: "2024-01-15",
    time: "10:00",
    services: ["Corte de Cabello"],
    customer: { name: "María González", phone: "+1-555-0101", email: "maria@email.com" },
    status: "confirmed"
  },
  {
    date: "2024-01-15",
    time: "14:30",
    services: ["Tinte Completo"],
    customer: { name: "Ana Rodríguez", phone: "+1-555-0102", email: "ana@email.com" },
    status: "confirmed"
  },
  {
    date: "2024-01-16",
    time: "11:00",
    services: ["Manicure", "Pedicure"],
    customer: { name: "Carmen López", phone: "+1-555-0103", email: "carmen@email.com" },
    status: "pending"
  },
  {
    date: "2024-01-17",
    time: "09:30",
    services: ["Limpieza Facial"],
    customer: { name: "Sofia Martín", phone: "+1-555-0104", email: "sofia@email.com" },
    status: "confirmed"
  },
  {
    date: "2024-01-18",
    time: "15:00",
    services: ["Corte de Cabello", "Tratamiento Capilar"],
    customer: { name: "Laura Fernández", phone: "+1-555-0105", email: "laura@email.com" },
    status: "confirmed"
  }
]
```

## 🛠️ Archivos a Crear/Modificar

### 1. **Servicio de Seeding**
- `lib/services/demo-seeding.service.ts`
- Función principal: `seedDemoDataForUser(userId: string)`

### 2. **Modificación en Auth**
- `app/api/auth/callback/route.ts`
- Detectar email y ejecutar seeding

### 3. **Configuración**
- Variable de entorno: `DEMO_CLIENT_EMAIL=cliente@ejemplo.com`
- Flag en base de datos: `profiles.is_demo`

### 4. **Componente de Notificación**
- Banner que indique "Datos de Demostración"
- Botón "Limpiar Demo y Usar Datos Reales"

## 📝 Implementación Paso a Paso

### Paso 1: Modificar Schema de Base de Datos
```sql
ALTER TABLE profiles ADD COLUMN is_demo BOOLEAN DEFAULT FALSE;
```

### Paso 2: Crear Servicio de Seeding
- Función que cree todos los datos demo
- Validación para evitar duplicados
- Marcado de datos como demo

### Paso 3: Integrar en Proceso de Auth
- Detectar email específico
- Ejecutar seeding automáticamente
- Marcar perfil como demo

### Paso 4: UI para Gestión Demo
- Banner informativo
- Botón de limpieza
- Confirmación antes de limpiar

### Paso 5: Función de Limpieza
- Eliminar todos los datos demo
- Desmarcar flag de demo
- Redirigir a configuración inicial

## 🎯 Configuración del Cliente

### Email del Cliente Demo:
```env
DEMO_CLIENT_EMAIL=cliente@ejemplo.com
```

### Activación/Desactivación:
```env
ENABLE_DEMO_SEEDING=true
```

## 🔄 Flujo de Usuario

1. **Cliente accede** con su cuenta de Google
2. **Sistema detecta** email configurado
3. **Ejecuta seeding** automáticamente
4. **Muestra banner** "Datos de Demostración"
5. **Cliente explora** sistema con datos precargados
6. **Cuando esté listo**, hace clic en "Usar Datos Reales"
7. **Sistema limpia** datos demo y permite configuración real

## 🧹 Limpieza Post-Demo

### Datos a Eliminar:
- Tienda demo y sus horarios
- Servicios y modificadores demo
- Reservas y clientes demo
- Enlaces de reserva demo

### Datos a Conservar:
- Perfil del usuario
- Configuración de cuenta
- Preferencias de idioma

## ⚠️ Consideraciones

- **Solo un cliente demo** por implementación
- **Datos realistas** pero ficticios
- **Fácil limpieza** sin afectar funcionalidad
- **No interferir** con usuarios reales
- **Backup automático** antes de limpiar

## 🚀 Resultado Esperado

El cliente podrá:
- Ver su "negocio" ya configurado
- Explorar todas las funcionalidades
- Hacer reservas de prueba
- Entender el valor del sistema
- Decidir implementarlo con datos reales

---

**Implementar esta funcionalidad permitirá una demostración efectiva del sistema sin requerir configuración manual del cliente.**