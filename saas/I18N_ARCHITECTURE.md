# I18N Architecture

## Overview

Tislo uses locale-based routing with Next.js App Router:

- `/es/...`
- `/en/...`

The translation system is dictionary-based and lightweight (no heavy i18n framework), aligned with current architecture and SSR constraints.

## Dictionary Structure

Dictionaries live in:

- `dictionaries/es.json`
- `dictionaries/en.json`

Keys are grouped by domain:

- `common`
- `landing`
- `dashboard`
- `shops`
- `booking`
- `services`
- `schedule`
- `email`

Example:

```json
{
  "common": { "save": "Guardar" },
  "booking": { "title": "Reservar Cita" }
}
```

## Server Dictionary Loader

Loader: `lib/dictionaries.ts`

Key exports:

- `getDictionary(locale)`
- `supportedLocales`
- `isValidLocale(locale)`

Behavior:

- Supports `es` and `en`
- Falls back to `es` for unsupported locales
- Uses `server-only` to keep dictionary loading SSR-safe

## Types and Safety

Dictionary type: `lib/types/dictionary.ts`

This provides:

- compile-time key validation
- safer dictionary access in pages/components
- consistent shape across all locales

## Consumption Pattern (Recommended)

Prefer server-driven injection:

1. Read locale from route params in server page/layout.
2. Load dictionary with `getDictionary(locale)`.
3. Pass only required dictionary slices to client components as props.

Example:

```tsx
const dict = await getDictionary(safeLocale)
return <PendingBookingsWidget dict={dict.dashboard} common={dict.common} locale={safeLocale} />
```

This avoids hydration mismatch and keeps translations deterministic on first render.

## Booking Flow i18n

Public booking page (`app/[locale]/book/[token]/page.tsx`) resolves locale from URL and uses locale dictionary values for key UI text and messages.

Booking API (`app/api/booking/[token]/create/route.ts`) accepts `locale` from payload and forwards it to email services.

## Email Localization

Email service: `lib/services/booking-email-service.ts`

Current localization behavior:

- locale-aware date and currency formatting
- localized subject lines (`es` / `en`)
- locale passed through booking creation and status flows

## Adding New Translation Keys

1. Add key to `dictionaries/es.json`.
2. Add equivalent key to `dictionaries/en.json`.
3. Update `lib/types/dictionary.ts` to include key.
4. Use key in page/component through injected dictionary.

## Adding a New Locale

1. Create `dictionaries/<locale>.json`.
2. Extend `Locale` union in `lib/types/dictionary.ts`.
3. Add loader entry in `lib/dictionaries.ts`.
4. Add locale to `supportedLocales`.
5. Update route static params where needed.

## Architecture Rules

- Keep i18n in presentation layer (pages/components).
- Do not couple repositories/prisma with UI translations.
- API business logic remains language-agnostic except for user-facing outputs (emails/messages).
- Preserve existing flow: `app/api -> services -> repositories -> prisma`.
