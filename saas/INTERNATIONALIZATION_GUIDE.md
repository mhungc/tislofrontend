# Guía de Internacionalización - ReservaFácil SaaS

## Resumen de Implementación

Esta guía documenta la implementación completa de internacionalización (i18n) en el proyecto ReservaFácil SaaS siguiendo las mejores prácticas oficiales de Next.js.

## Estructura de Archivos

```
saas/
├── app/
│   ├── [locale]/                    # Rutas localizadas
│   │   ├── auth/                    # Páginas de autenticación localizadas
│   │   ├── dashboard/               # Dashboard localizado
│   │   ├── layout.tsx               # Layout principal con locale
│   │   └── page.tsx                 # Página principal localizada
│   ├── auth/
│   │   └── confirm/
│   │       └── route.ts             # Manejo OAuth con detección de idioma
│   ├── api/                         # APIs (no localizadas)
│   └── page.tsx                     # Redirección a idioma por defecto
├── dictionaries/
│   ├── en.json                      # Traducciones en inglés
│   └── es.json                      # Traducciones en español
├── lib/
│   └── dictionaries.ts              # Función getDictionary
└── components/
    ├── landing/
    │   └── LandingPageLocalized.tsx # Componente localizado
    └── language-switcher.tsx       # Selector de idioma
```

## Configuración Principal

### 1. Función getDictionary (`lib/dictionaries.ts`)
```typescript
import 'server-only'

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  es: () => import('../dictionaries/es.json').then((module) => module.default),
}

export const getDictionary = async (locale: keyof typeof dictionaries) =>
  dictionaries[locale]()
```

### 2. Layout Localizado (`app/[locale]/layout.tsx`)
- Genera parámetros estáticos para 'en' y 'es'
- Incluye etiquetas `<html>` y `<body>` con locale
- Integra ThemeProvider y AuthProvider

### 3. Página Principal Localizada (`app/[locale]/page.tsx`)
```typescript
export default async function LocalePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const dict = await getDictionary(locale as 'en' | 'es')
  return <LandingPageLocalized dict={dict} locale={locale} />
}
```

## Componentes Clave

### 1. LandingPageLocalized
- Recibe `dict` (traducciones) y `locale` como props
- Usa traducciones dinámicas: `{dict.landing.header.login}`
- Enlaces localizados: `/${locale}/auth/login`

### 2. LanguageSwitcher
- Extrae locale actual del pathname
- Cambia idioma manteniendo la ruta actual
- Botones ES/EN con estado activo

## Manejo de OAuth

### Problema Resuelto
OAuth de Google redirigía a `/auth/confirm` sin locale, causando 404.

### Solución Implementada (`app/auth/confirm/route.ts`)
```typescript
// Detecta idioma del referrer o accept-language
let locale = 'es' // default

if (referrer && referrer.includes('/en/')) {
  locale = 'en'
} else if (acceptLanguage && acceptLanguage.includes('en')) {
  locale = 'en'
}

// Redirige manteniendo el idioma
return NextResponse.redirect(`${origin}/${locale}${next}`)
```

## Estructura de Traducciones

### Formato JSON
```json
{
  "landing": {
    "header": {
      "login": "Iniciar Sesión",
      "signup": "Comenzar Gratis"
    },
    "hero": {
      "badge": "🚀 Nuevo: Modificadores Inteligentes",
      "title": "Gestiona tu Negocio de Servicios",
      "subtitle": "Sin Complicaciones",
      "description": "La plataforma todo-en-uno...",
      "demo": "Ver Demo",
      "benefits": {
        "free": "Gratis por 30 días",
        "noCard": "Sin tarjeta de crédito",
        "setup": "Configuración en 5 minutos"
      }
    }
  }
}
```

## Rutas Implementadas

### Páginas Localizadas
- `/es/` - Landing page en español
- `/en/` - Landing page en inglés
- `/es/auth/login` - Login en español
- `/en/auth/login` - Login en inglés
- `/es/dashboard` - Dashboard en español
- `/en/dashboard` - Dashboard en inglés

### Rutas de Redirección
- `/` → `/es` (idioma por defecto)
- `/auth/confirm` → `/{locale}/dashboard` (mantiene idioma)

## Dependencias Instaladas

```json
{
  "server-only": "^0.0.1"
}
```

## Configuración de Middleware

El middleware original de Supabase se mantiene sin cambios para manejar autenticación.

## Mejores Prácticas Seguidas

1. **Estructura de rutas nativa de Next.js** con `[locale]`
2. **Server-side rendering** para traducciones
3. **Detección automática de idioma** en OAuth
4. **Mantenimiento de estado de idioma** en navegación
5. **Separación de concerns** (auth vs i18n)

## Funcionalidades Completadas

✅ Rutas localizadas funcionando
✅ Selector de idioma operativo
✅ Redirección OAuth con detección de idioma
✅ Traducciones dinámicas en componentes
✅ Navegación entre idiomas sin pérdida de contexto
✅ Estructura escalable para nuevos idiomas

## Próximos Pasos Sugeridos

1. Completar traducciones de todas las secciones del landing
2. Traducir páginas de dashboard
3. Implementar traducciones para mensajes de error
4. Agregar más idiomas (francés, portugués, etc.)
5. Implementar detección automática de idioma del navegador

## Notas Técnicas

- **Puerto de desarrollo**: 3000
- **Idioma por defecto**: Español (es)
- **Idiomas soportados**: Español, Inglés
- **Método de detección**: Referrer y Accept-Language headers
- **Fallback**: Español en caso de idioma no detectado

---

**Fecha de implementación**: Diciembre 2024
**Versión**: 1.0
**Estado**: Completado y funcional