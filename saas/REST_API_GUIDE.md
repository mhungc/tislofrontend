# 🚀 Guía de API RESTful - SaaS de Reservas

Esta guía documenta todas las URLs RESTful implementadas siguiendo las mejores prácticas.

## 📋 **Estructura General**

```
/api/shops/:shopId/...     # Recursos anidados bajo tienda
/api/shops/:shopId/services/:serviceId  # Recursos específicos
/api/shops/:shopId/bookings/:bookingId  # Recursos específicos
```

## 🏪 **Gestión de Tiendas**

### **Listar y Crear Tiendas**
```
GET    /api/shops                    # Listar todas las tiendas del usuario
POST   /api/shops                    # Crear nueva tienda
```

**Ejemplo POST /api/shops:**
```json
{
  "name": "Peluquería María",
  "description": "Salón de belleza especializado",
  "address": "Calle Principal 123",
  "phone": "+1234567890",
  "email": "maria@peluqueria.com",
  "website": "https://peluqueriamaria.com",
  "timezone": "America/New_York",
  "business_hours": {
    "monday": { "open": "09:00", "close": "18:00", "is_open": true },
    "tuesday": { "open": "09:00", "close": "18:00", "is_open": true }
  }
}
```

### **Operaciones CRUD de Tienda Específica**
```
GET    /api/shops/:id                # Obtener tienda específica
PUT    /api/shops/:id                # Actualizar tienda completa
PATCH  /api/shops/:id                # Actualizar tienda parcialmente
DELETE /api/shops/:id                # Eliminar tienda
```

**Ejemplo PUT /api/shops/:id:**
```json
{
  "name": "Peluquería María Actualizada",
  "description": "Nueva descripción",
  "address": "Nueva dirección 456",
  "phone": "+1234567890",
  "email": "nuevo@email.com",
  "website": "https://nuevo-sitio.com",
  "timezone": "America/Chicago",
  "is_active": true
}
```

## 🛠️ **Gestión de Servicios**

### **Listar y Crear Servicios**
```
GET    /api/shops/:shopId/services   # Listar servicios de la tienda
POST   /api/shops/:shopId/services   # Crear nuevo servicio
```

**Ejemplo POST /api/shops/:shopId/services:**
```json
{
  "name": "Corte de Cabello",
  "description": "Corte profesional con lavado incluido",
  "duration_minutes": 60,
  "price": 25.00,
  "is_active": true
}
```

### **Operaciones CRUD de Servicio Específico**
```
GET    /api/shops/:shopId/services/:serviceId    # Obtener servicio específico
PUT    /api/shops/:shopId/services/:serviceId    # Actualizar servicio completo
PATCH  /api/shops/:shopId/services/:serviceId    # Actualizar servicio parcialmente
DELETE /api/shops/:shopId/services/:serviceId    # Eliminar servicio
```

**Ejemplo PATCH /api/shops/:shopId/services/:serviceId:**
```json
{
  "price": 30.00,
  "is_active": false
}
```

## 📋 **Gestión de Reservas** (Pendiente de implementar)

### **Listar y Crear Reservas**
```
GET    /api/shops/:shopId/bookings   # Listar reservas de la tienda
POST   /api/shops/:shopId/bookings   # Crear nueva reserva
```

**Ejemplo POST /api/shops/:shopId/bookings:**
```json
{
  "customer_data": {
    "full_name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "+1234567890"
  },
  "booking_data": {
    "booking_date": "2024-01-15",
    "start_time": "14:00",
    "end_time": "15:00",
    "notes": "Cliente preferencia horario tarde",
    "status": "pending"
  },
  "service_ids": ["service-id-1", "service-id-2"]
}
```

### **Operaciones CRUD de Reserva Específica**
```
GET    /api/shops/:shopId/bookings/:bookingId    # Obtener reserva específica
PUT    /api/shops/:shopId/bookings/:bookingId    # Actualizar reserva completa
PATCH  /api/shops/:shopId/bookings/:bookingId    # Actualizar reserva parcialmente
DELETE /api/shops/:shopId/bookings/:bookingId    # Eliminar reserva
```

## 👥 **Gestión de Clientes** (Pendiente de implementar)

### **Listar y Crear Clientes**
```
GET    /api/shops/:shopId/customers  # Listar clientes de la tienda
POST   /api/shops/:shopId/customers  # Crear nuevo cliente
```

**Ejemplo POST /api/shops/:shopId/customers:**
```json
{
  "full_name": "María García",
  "email": "maria@email.com",
  "phone": "+1234567890",
  "notes": "Cliente frecuente, prefiere horarios matutinos"
}
```

### **Operaciones CRUD de Cliente Específico**
```
GET    /api/shops/:shopId/customers/:customerId  # Obtener cliente específico
PUT    /api/shops/:shopId/customers/:customerId  # Actualizar cliente completo
PATCH  /api/shops/:shopId/customers/:customerId  # Actualizar cliente parcialmente
DELETE /api/shops/:shopId/customers/:customerId  # Eliminar cliente
```

## 🕐 **Gestión de Horarios** (Pendiente de implementar)

### **Horarios de Tienda**
```
GET    /api/shops/:shopId/schedule   # Obtener horarios de la tienda
PUT    /api/shops/:shopId/schedule   # Actualizar horarios completos
```

**Ejemplo PUT /api/shops/:shopId/schedule:**
```json
{
  "business_hours": {
    "monday": { "open": "09:00", "close": "18:00", "is_open": true },
    "tuesday": { "open": "09:00", "close": "18:00", "is_open": true },
    "wednesday": { "open": "09:00", "close": "18:00", "is_open": true },
    "thursday": { "open": "09:00", "close": "18:00", "is_open": true },
    "friday": { "open": "09:00", "close": "18:00", "is_open": true },
    "saturday": { "open": "10:00", "close": "16:00", "is_open": true },
    "sunday": { "open": "10:00", "close": "16:00", "is_open": false }
  }
}
```

### **Excepciones de Horario**
```
GET    /api/shops/:shopId/schedule/exceptions        # Obtener excepciones
POST   /api/shops/:shopId/schedule/exceptions        # Crear excepción
DELETE /api/shops/:shopId/schedule/exceptions/:id    # Eliminar excepción
```

**Ejemplo POST /api/shops/:shopId/schedule/exceptions:**
```json
{
  "date": "2024-12-25",
  "is_closed": true,
  "reason": "Día de Navidad"
}
```

## 📅 **Calendario Público** (Pendiente de implementar)

### **Disponibilidad Pública**
```
GET    /api/shops/:shopId/availability               # Obtener disponibilidad general
GET    /api/shops/:shopId/availability/:date         # Disponibilidad para fecha específica
POST   /api/shops/:shopId/bookings/public            # Crear reserva pública (sin auth)
```

**Ejemplo GET /api/shops/:shopId/availability/2024-01-15:**
```json
{
  "date": "2024-01-15",
  "is_open": true,
  "business_hours": {
    "open": "09:00",
    "close": "18:00"
  },
  "available_slots": [
    "09:00", "09:30", "10:00", "10:30", "11:00"
  ],
  "booked_slots": [
    "14:00", "14:30", "15:00"
  ]
}
```

## 🔐 **Autenticación y Autorización**

### **Headers Requeridos**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### **Códigos de Estado HTTP**
- `200` - OK (Operación exitosa)
- `201` - Created (Recurso creado)
- `400` - Bad Request (Datos inválidos)
- `401` - Unauthorized (No autenticado)
- `403` - Forbidden (No autorizado)
- `404` - Not Found (Recurso no encontrado)
- `500` - Internal Server Error (Error del servidor)

## 📝 **Ejemplos de Uso**

### **Crear una Tienda Completa**
```bash
curl -X POST /api/shops \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Tienda",
    "description": "Descripción de la tienda",
    "address": "Dirección completa",
    "phone": "+1234567890",
    "email": "contacto@mitienda.com"
  }'
```

### **Obtener Servicios de una Tienda**
```bash
curl -X GET /api/shops/shop-id/services \
  -H "Authorization: Bearer <token>"
```

### **Actualizar Precio de un Servicio**
```bash
curl -X PATCH /api/shops/shop-id/services/service-id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"price": 35.00}'
```

## 🚀 **Próximos Pasos**

### **Endpoints Pendientes de Implementar:**
1. **Reservas** (`/api/shops/:shopId/bookings`)
2. **Clientes** (`/api/shops/:shopId/customers`)
3. **Horarios** (`/api/shops/:shopId/schedule`)
4. **Calendario Público** (`/api/shops/:shopId/availability`)

### **Mejoras Futuras:**
1. **Filtros y Paginación** en endpoints de listado
2. **Búsqueda** en servicios y clientes
3. **Exportación** de datos (PDF, Excel)
4. **Notificaciones** por email/SMS
5. **Integración de Pagos** (Stripe, PayPal)

## 📚 **Recursos Adicionales**

- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

