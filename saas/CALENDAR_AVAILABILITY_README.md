# Algoritmo de Disponibilidad de Calendario

Este documento explica el algoritmo real que usa Tislo para calcular disponibilidad de horarios de reserva.

## Objetivo

Dado un día y una duración total de servicio, devolver una lista de slots con este formato:

- time: hora en formato HH:MM
- available: true o false

El sistema marca como disponible solo los inicios que pueden acomodar la duración completa sin conflictos.

## Flujo completo

1. API de disponibilidad recibe:
   - date
   - services (opcional)
   - additionalDuration (opcional)
2. Se calcula duración total:
   - Si hay services: suma de duration_minutes de cada servicio + additionalDuration
   - Si no hay services: 60 minutos por defecto
3. Se obtienen reservas existentes del mismo día para la tienda.
4. Se calcula disponibilidad con AvailabilityCalculator.
5. Se devuelve arreglo de slots con disponibilidad.

## Archivos clave

- app/api/booking/[token]/availability/route.ts
- lib/repositories/booking-repository.ts
- lib/services/availability-calculator.ts
- lib/services/booking-service.ts

## Entradas del algoritmo

- date: YYYY-MM-DD
- schedules: bloques de horario configurados para la tienda
  - day_of_week
  - open_time
  - close_time
  - is_working_day
  - block_order
- existingBookings: reservas ya tomadas
  - start_time
  - end_time
- serviceDurationMinutes: duración total a bloquear
- baseSlotMinutes: granularidad base (default 15)

## Paso 1: filtrar bloques del día

Se seleccionan solo los bloques que cumplen:

- day_of_week == día solicitado
- is_working_day == true

Luego se ordenan por block_order.

Si no hay bloques, se devuelve lista vacía.

## Paso 2: generar todos los slots candidatos

Para cada bloque del día:

1. parse open_time y close_time
2. Si close_time <= open_time, se asume cierre al día siguiente (cruce de medianoche)
3. Se itera desde open_time hasta close_time en saltos de baseSlotMinutes
4. Cada hora se agrega como slot candidato disponible
5. Si hay bloques superpuestos, se evita duplicar la misma hora

Al final, los slots se ordenan por hora.

## Paso 3: validar cada inicio con duración completa

Para cada slot candidato startTime:

1. Redondeo de duración al múltiplo superior del slot base:

   blockedMinutes = ceil(serviceDurationMinutes / baseSlotMinutes) * baseSlotMinutes

2. Cantidad de slots requeridos:

   slotsNeeded = blockedMinutes / baseSlotMinutes

3. Validaciones secuenciales:

- El startTime debe existir en allSlots
- Deben existir slots suficientes hacia adelante
- No puede haber huecos entre slots requeridos
- Ningún slot requerido puede solaparse con reservas existentes
- El final real del servicio debe caber dentro del último slot requerido

Si alguna validación falla, available = false.

## Regla de conflicto con reservas

Un slot entra en conflicto si:

slotTime >= booking.start_time AND slotTime < booking.end_time

Con esta regla, los inicios dentro de una reserva quedan bloqueados.

## Manejo de medianoche

Para comparar correctamente horas de madrugada en ciertos chequeos:

- Horas entre 00:00 y 05:59 se interpretan como día siguiente (+1440 minutos)

Esto se usa para evitar errores al comparar finales de servicios en cruces nocturnos.

## Ejemplo rápido

Supuestos:

- baseSlotMinutes = 15
- Horario: 09:00 a 12:00
- Reserva existente: 10:00 a 10:45
- Duración solicitada: 40 min

Cálculo:

- blockedMinutes = ceil(40/15)*15 = 45
- slotsNeeded = 45/15 = 3

Resultado esperado:

- 09:00 disponible (09:00, 09:15, 09:30)
- 09:30 no disponible (cae en conflicto con 10:00)
- 10:00 no disponible
- 10:45 disponible si hay continuidad y cabe hasta 11:30

## Complejidad aproximada

- Generación de slots: O(S)
- Validación por slot: O(S * K + S * B)
  - S: cantidad de slots del día
  - K: slots requeridos por duración
  - B: reservas existentes

En práctica, es eficiente para agendas diarias típicas.

## Decisiones de diseño actuales

- Granularidad fija por baseSlotMinutes (15 por defecto)
- Duración siempre redondeada hacia arriba
- Validación estricta de continuidad (sin huecos)
- Soporte para bloques múltiples y superpuestos
- Soporte para horarios que cruzan medianoche

## Posibles mejoras futuras

- Índice temporal para acelerar conflictos en días con muchas reservas
- Reglas avanzadas de buffers entre citas
- Bloqueos por recursos (cabina/sillón/empleado)
- Cálculo por profesional además de por tienda

---

Última actualización: sincronizado con la implementación actual en AvailabilityCalculator y endpoint de disponibilidad.
