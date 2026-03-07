# Sugerencias de Mejora para Onboarding Guiado
**Fecha:** 7 de Marzo, 2026  
**Estado Actual:** ✅ MVP funcional implementado

---

## 📋 Estado Actual (v1 - Implementado)

El flujo de onboarding actual funciona correctamente con `onboarding=1` en URL:

### Flujo Implementado
1. **Crear Tienda** → Redirige a horarios con banner "Paso 2 de 3"
2. **Configurar Horarios** → Al guardar, avanza automáticamente a servicios
3. **Crear Servicios** → Muestra banner "Paso 3 de 3" + botón "Finalizar Configuración"
4. **Configuración Completa** → Página con tabs (General/Horarios/Servicios/Enlaces)

### ✅ Ventajas del Enfoque Actual
- Simple y sin estado persistente
- No invasivo (el banner desaparece al salir del flujo)
- Evita que usuarios se pierdan después de crear tienda
- URL transparente: `?onboarding=1`

### ⚠️ Limitaciones Actuales (No críticas)
- El banner "Paso 3 de 3" permanece visible después de crear servicios hasta que salgan de la página
- No hay indicador visual de qué pasos ya completaron si vuelven más tarde
- Si cierran el navegador a mitad del proceso, pierden contexto del onboarding

---

## 🚀 Mejoras Sugeridas para v2 (Futuro)

### 1. Auto-ocultar Banner al Finalizar
**Problema:** El banner sigue visible después de hacer click en "Finalizar Configuración"

**Solución:**
```typescript
// En services/page.tsx
const [onboardingDismissed, setOnboardingDismissed] = useState(false)

const goToFullConfig = () => {
  setOnboardingDismissed(true)
  localStorage.setItem(`onboarding-dismissed-${shopId}`, 'true')
  // ... resto del código
}

// Condición del banner
{isOnboarding && !onboardingDismissed && (
  <Card>...</Card>
)}
```

---

### 2. Checklist de Progreso Persistente
**Problema:** No hay indicador visual de lo que ya completaron

**Solución:** Agregar widget en `/dashboard/shops/[shopId]/config`:

```tsx
<Card className="border-sky-200 bg-sky-50">
  <CardHeader>
    <CardTitle>Configuración Inicial</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <ChecklistItem 
        completed={hasSchedules} 
        label="Horarios configurados" 
      />
      <ChecklistItem 
        completed={hasServices} 
        label="Servicios creados" 
      />
      <ChecklistItem 
        completed={hasBookingLink} 
        label="Enlace de reserva activo"
        action={() => scrollToTab('booking')}
      />
    </div>
  </CardContent>
</Card>
```

**Datos necesarios:**
- `hasSchedules`: Check si existen schedule records para el shop
- `hasServices`: Check si existen services activos
- `hasBookingLink`: Check si existe booking_link activo y no expirado

---

### 3. Progreso Persistente con localStorage/Database
**Problema:** Si cierran navegador, pierden contexto del onboarding

**Opción A - localStorage (Más simple):**
```typescript
interface OnboardingProgress {
  shopId: string
  currentStep: 'schedule' | 'services' | 'complete'
  completedSteps: string[]
  startedAt: string
  lastUpdated: string
}

// Guardar progreso
const saveProgress = (step: string) => {
  const progress: OnboardingProgress = {
    shopId,
    currentStep: step,
    completedSteps: [...completedSteps, step],
    startedAt: startedAt || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
  localStorage.setItem(`onboarding-${shopId}`, JSON.stringify(progress))
}
```

**Opción B - Database (Más robusto):**
```sql
-- Nueva tabla
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  current_step VARCHAR(50) NOT NULL,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id)
);
```

---

### 4. Modal de Bienvenida (Opcional)
**Cuándo:** Al crear la primera tienda del usuario

**Contenido:**
```
🎉 ¡Bienvenido a Tislo!

Vamos a configurar tu primera tienda en 3 pasos:
1️⃣ Define tu horario de atención
2️⃣ Agrega tus servicios
3️⃣ Comparte tu enlace de reserva

Esto tomará solo 5 minutos.

[Comenzar] [Saltar por ahora]
```

---

### 5. Gamificación Ligera (Post-MVP)
**Celebrar hitos:**
- ✨ Primera tienda creada
- 📅 Horarios configurados
- 🛍️ Primer servicio agregado
- 🔗 Enlace compartido por primera vez
- 🎊 Primera reserva recibida

**Implementación con confetti:**
```tsx
import confetti from 'canvas-confetti'

const celebrateCompletion = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })
  toast.success('¡Configuración completada! 🎉')
}
```

---

## 📊 Priorización Recomendada

### Fase 1 (MVP actual) ✅
- [x] Flujo guiado básico con URL params
- [x] Auto-avance entre pasos
- [x] Banners de progreso

### Fase 2 (Post-lanzamiento inicial)
- [ ] Auto-ocultar banner al finalizar (1-2 hrs)
- [ ] Checklist visual en config completa (3-4 hrs)

### Fase 3 (Cuando tengan traction)
- [ ] Persistencia con localStorage (4-6 hrs)
- [ ] Modal de bienvenida (2-3 hrs)

### Fase 4 (Features premium)
- [ ] Migrar a database tracking (8-10 hrs)
- [ ] Gamificación y celebraciones (6-8 hrs)
- [ ] Analytics de abandono por paso

---

## 🎯 Métricas de Éxito a Trackear

Cuando implementen mejoras, medir:

1. **Completion Rate:** % de usuarios que completan onboarding vs los que lo abandonan
2. **Abandono por Paso:** ¿En qué paso desertan más usuarios?
3. **Tiempo Promedio:** ¿Cuánto tarda completar el setup?
4. **Return Rate:** ¿Cuántos vuelven después de abandonar?

---

## 💡 Notas Finales

- El onboarding actual (v1) es **suficientemente bueno para lanzar**
- Las mejoras sugeridas son **incrementales y no urgentes**
- Priorizar según feedback real de usuarios
- No optimizar prematuramente sin datos

**Regla de oro:** Lanzar rápido → Medir → Iterar basado en datos reales 🚀
