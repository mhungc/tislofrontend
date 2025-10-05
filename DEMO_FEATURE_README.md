# 🎯 Demo Feature - Sistema de Datos de Demostración

## 📋 Descripción

Sistema completo para cargar datos de demostración que permite a los usuarios explorar todas las funcionalidades de ReservaFácil con datos realistas precargados.

## ✅ Funcionalidad Implementada

### 🔧 **Componentes Desarrollados:**

1. **`DemoSeedingService`** - Servicio principal para gestión de datos demo
2. **API Endpoint** - `/api/demo/toggle` para activar/desactivar demo
3. **Botón "Cargar Datos Demo"** - En el módulo de Tiendas
4. **Sistema de Limpieza** - Eliminación completa de datos demo

### 🏪 **Datos Demo Creados:**

#### **Tienda:**
- **Nombre:** "Salón Bella Vista"
- **Dirección:** Av. Principal 123, Centro
- **Teléfono:** +1 (555) 123-4567
- **Email:** contacto@salonbellavista.com

#### **Servicios (9 total):**
- **Cabello:** Corte ($25), Tinte ($80), Mechas ($65), Tratamiento ($35)
- **Uñas:** Manicure ($15), Pedicure ($20), Uñas Gel ($30)
- **Facial:** Limpieza Facial ($40)
- **Bienestar:** Masaje Relajante ($50)

#### **Horarios:**
- **Lun-Jue:** 9:00 - 18:00
- **Viernes:** 9:00 - 19:00
- **Sábado:** 8:00 - 17:00
- **Domingo:** Cerrado

#### **Reservas (7 total - Octubre 2025):**
- **6 Oct (Lun):** María González (10:00), Ana Rodríguez (14:30)
- **7 Oct (Mar):** Carmen López (11:00)
- **8 Oct (Mié):** Sofia Martín (09:30)
- **9 Oct (Jue):** Laura Fernández (15:00)
- **10 Oct (Vie):** Patricia Morales (16:00)
- **11 Oct (Sáb):** Isabella Castro (10:30)

## 🚀 Cómo Usar

### **Activar Demo:**
1. Ve a **Dashboard → Tiendas**
2. Haz clic en **"Cargar Datos Demo"**
3. El sistema creará automáticamente todos los datos

### **Explorar Demo:**
1. **Tiendas:** Verás "Salón Bella Vista" creada
2. **Servicios:** 9 servicios de belleza configurados
3. **Reservas:** Ve a Dashboard → Reservas → Octubre 2025
4. **Calendario:** Navega a octubre 2025 para ver las citas

### **Desactivar Demo:**
1. Haz clic nuevamente en **"Cargar Datos Demo"**
2. El sistema limpiará todos los datos demo
3. Podrás crear tus datos reales

## 🔧 Arquitectura Técnica

### **Capas Implementadas:**

```
┌─────────────────────────────────────┐
│           Frontend (UI)             │
│  - Botón "Cargar Datos Demo"       │
│  - Notificaciones de estado        │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│         API Layer                   │
│  - POST /api/demo/toggle            │
│  - Autenticación con Supabase       │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│       Service Layer                 │
│  - DemoSeedingService               │
│  - Lógica de negocio                │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│      Repository Layer               │
│  - ShopRepository                   │
│  - ServiceRepository                │
│  - BookingRepository                │
│  - ScheduleRepository               │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│       Database (Prisma)             │
│  - PostgreSQL con Supabase          │
│  - Transacciones ACID               │
└─────────────────────────────────────┘
```

### **Flujo de Datos:**

1. **Usuario hace clic** → Botón Demo
2. **Frontend llama** → `/api/demo/toggle`
3. **API verifica** → Autenticación Supabase
4. **Service ejecuta** → Seeding o Limpieza
5. **Repository maneja** → Operaciones DB
6. **Database almacena** → Datos con integridad

## 🛡️ Características de Seguridad

### **Validaciones:**
- ✅ **Autenticación requerida** - Solo usuarios logueados
- ✅ **Verificación de propiedad** - Solo datos del usuario actual
- ✅ **Transacciones atómicas** - Todo o nada
- ✅ **Prevención de duplicados** - Verifica datos existentes

### **Limpieza Segura:**
- ✅ **Eliminación en cascada** - Todos los datos relacionados
- ✅ **Preservación de perfil** - Mantiene cuenta del usuario
- ✅ **No afecta otros usuarios** - Aislamiento completo

## 📊 Datos Técnicos

### **Entidades Creadas:**
- **1 Tienda** con información completa
- **9 Servicios** con precios y duraciones
- **7 Horarios** semanales configurados
- **1 Enlace de reserva** con token único
- **7 Clientes** ficticios con datos RGPD
- **7 Reservas** distribuidas en octubre 2025

### **Campos Poblados:**
- **Cumplimiento RGPD** - Consentimientos y retención
- **Estadísticas de cliente** - Visitas y puntos de lealtad
- **Precios realistas** - Basados en mercado real
- **Horarios operativos** - Configuración típica de salón

## 🔄 Estados del Sistema

### **Estado Normal:**
- `profiles.is_demo = false`
- Sin datos precargados
- Usuario puede crear datos reales

### **Estado Demo:**
- `profiles.is_demo = true`
- Datos completos precargados
- Sistema funcional para exploración

### **Transición:**
- **Normal → Demo:** Crea todos los datos
- **Demo → Normal:** Limpia todos los datos
- **Idempotente:** Múltiples clics no duplican

## 🎯 Casos de Uso

### **Para Desarrolladores:**
- Datos consistentes para testing
- Ambiente de desarrollo poblado
- Validación de funcionalidades

### **Para Demos de Ventas:**
- Presentación inmediata del sistema
- Datos realistas y profesionales
- Exploración completa sin configuración

### **Para Nuevos Usuarios:**
- Comprensión rápida del sistema
- Exploración sin compromiso
- Transición fácil a datos reales

## 🚨 Consideraciones

### **Limitaciones:**
- Solo un conjunto de datos demo por usuario
- Fechas fijas en octubre 2025
- Datos en español para mercado latino

### **Recomendaciones:**
- Usar solo para demostración
- Limpiar antes de usar datos reales
- No modificar datos demo manualmente

---

## ✅ **Estado: COMPLETAMENTE FUNCIONAL**

El sistema de demo está listo para producción y proporciona una experiencia completa de ReservaFácil sin requerir configuración manual del usuario.

**Desarrollado con ❤️ siguiendo arquitectura limpia y mejores prácticas**