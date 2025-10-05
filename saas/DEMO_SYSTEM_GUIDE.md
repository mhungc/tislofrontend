# 🎯 Guía del Sistema de Datos Demo

## 📋 Descripción General

El sistema de datos demo permite a cualquier usuario cargar datos de demostración con un simple clic. Esto permite que cualquier cliente explore el sistema funcionando inmediatamente sin necesidad de configuración manual.

## 🔧 Configuración

### Variables de Entorno

Agregar las siguientes variables a tu archivo `.env.local`:

```env
# Habilitar/deshabilitar el sistema de datos demo
ENABLE_DEMO_SEEDING=true
```

### Base de Datos

El sistema utiliza un campo `is_demo` en la tabla `profiles` para marcar usuarios con datos de demostración:

```sql
ALTER TABLE profiles ADD COLUMN is_demo BOOLEAN DEFAULT FALSE;
```

## 🎭 Datos Demo Incluidos

### Tienda Demo
- **Nombre**: "Salón Bella Vista"
- **Descripción**: Salón de belleza integral con servicios premium
- **Dirección**: Av. Principal 123, Centro
- **Teléfono**: +1 (555) 123-4567
- **Email**: contacto@salonbellavista.com

### Servicios (9 servicios)
- Corte de Cabello ($25, 45 min)
- Tinte Completo ($80, 120 min)
- Mechas ($65, 90 min)
- Tratamiento Capilar ($35, 60 min)
- Manicure ($15, 30 min)
- Pedicure ($20, 45 min)
- Uñas Gel ($30, 60 min)
- Limpieza Facial ($40, 75 min)
- Masaje Relajante ($50, 60 min)

### Horarios
- **Lunes a Jueves**: 9:00 AM - 6:00 PM
- **Viernes**: 9:00 AM - 7:00 PM
- **Sábado**: 8:00 AM - 5:00 PM
- **Domingo**: Cerrado

### Reservas de Ejemplo
5 reservas distribuidas en la próxima semana con clientes ficticios:
- María González (Corte de Cabello)
- Ana Rodríguez (Tinte Completo)
- Carmen López (Manicure + Pedicure)
- Sofia Martín (Limpieza Facial)
- Laura Fernández (Corte + Tratamiento)

## 🔄 Flujo de Funcionamiento

### 1. Banner de Demostración
- Aparece un banner azul en el dashboard para usuarios sin datos demo
- Muestra información sobre los datos de demostración disponibles
- Incluye botón "Cargar Datos Demo" para activar

### 2. Activación de Datos Demo
- El usuario hace clic en "Cargar Datos Demo"
- Se ejecuta automáticamente el seeding de datos
- Se marca el perfil como `is_demo: true`
- El banner cambia a amarillo indicando "Datos de Demostración Activos"

### 3. Exploración del Sistema
- El usuario puede explorar todas las funcionalidades con datos realistas
- Ve tienda, servicios, horarios y reservas precargados
- Puede hacer pruebas sin afectar datos reales

### 4. Limpieza de Datos
- El usuario puede hacer clic en "Usar Datos Reales"
- Se eliminan todos los datos demo (tienda, servicios, horarios, reservas)
- Se desmarca el flag `is_demo`
- El banner vuelve a azul para futuras activaciones

## 🛠️ Archivos Implementados

### Servicios
- `lib/services/demo-seeding.service.ts` - Lógica de seeding y limpieza
- `lib/services/profile-service.ts` - Modificado para detectar email demo

### API Routes
- `app/api/demo/toggle/route.ts` - Endpoint para activar/desactivar datos demo

### Componentes UI
- `components/demo-banner.tsx` - Banner informativo para usuarios demo

### Layout
- `app/[locale]/dashboard/layout.tsx` - Integrado el banner demo

## 🧪 Testing

### Probar el Sistema Demo

1. **Configurar variables de entorno**:
   ```env
   ENABLE_DEMO_SEEDING=true
   ```

2. **Registrar cualquier usuario**:
   - Usar cualquier email
   - El sistema NO crea datos demo automáticamente

3. **Verificar banner de activación**:
   - Ir al dashboard
   - Debería aparecer un banner azul "Explora el Sistema con Datos Demo"
   - Hacer clic en "Cargar Datos Demo"

4. **Verificar datos creados**:
   - El banner cambia a amarillo "Datos de Demostración Activos"
   - Verificar que hay una tienda "Salón Bella Vista"
   - Verificar que hay 9 servicios configurados
   - Verificar que hay 5 reservas en la próxima semana

5. **Probar limpieza**:
   - Hacer clic en "Usar Datos Reales" en el banner
   - Confirmar la eliminación
   - Verificar que los datos demo fueron eliminados
   - El banner vuelve a azul para futuras activaciones

## ⚠️ Consideraciones Importantes

### Seguridad
- Solo el usuario con el email configurado puede recibir datos demo
- La limpieza solo funciona para usuarios marcados como demo
- No se pueden crear datos demo para usuarios existentes

### Performance
- El seeding se ejecuta en background para no bloquear el login
- Los errores de seeding no interrumpen el proceso de autenticación
- La limpieza se ejecuta en una transacción para mantener consistencia

### Limitaciones
- Solo un cliente demo por implementación
- Los datos son estáticos (no se regeneran automáticamente)
- Requiere configuración manual de variables de entorno

## 🔧 Mantenimiento

### Actualizar Datos Demo
Para modificar los datos demo, editar el archivo `lib/services/demo-seeding.service.ts`:

```typescript
// Modificar estos objetos:
private demoShopData = { ... }
private demoServices: DemoServiceData[] = [ ... ]
private demoSchedule: DemoScheduleData[] = [ ... ]
private demoBookings: DemoBookingData[] = [ ... ]
```

### Deshabilitar Sistema Demo
```env
ENABLE_DEMO_SEEDING=false
```

### Cambiar Cliente Demo
```env
DEMO_CLIENT_EMAIL=nuevo-cliente@ejemplo.com
```

## 📞 Soporte

Si encuentras problemas con el sistema demo:

1. Verificar que las variables de entorno estén configuradas
2. Revisar los logs del servidor para errores de seeding
3. Verificar que el usuario tenga permisos en la base de datos
4. Comprobar que Prisma esté actualizado (`npx prisma generate`)

---

**El sistema de datos demo está diseñado para facilitar las demostraciones del producto sin requerir configuración manual del cliente.**
