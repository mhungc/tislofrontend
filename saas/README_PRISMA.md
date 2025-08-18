## Prisma con Supabase

Pasos para configurar Prisma apuntando a tu base de datos de Supabase:

1. Copia `.env.example` a `.env.local` y define `DATABASE_URL` usando la cadena de conexión de tu proyecto Supabase (Role: `service_role` o una base privada segura para migraciones locales). Ejemplo:

```
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

2. Instala dependencias y genera el cliente:

```
npm install
npx prisma generate
```

3. Sincroniza el esquema local con la BD (opcional para tablas adicionales como `timezone`/`business_hours` en `shops`):

```
npx prisma db push
```

Notas:
- Este proyecto mantiene acceso en runtime mediante Supabase Auth (RLS) en endpoints, pero utiliza Prisma en el servidor para una capa de repositorio que facilita reemplazar el backend por .NET en el futuro sin tocar el frontend.
- No expongas `DATABASE_URL` en el navegador; mantén `.env.local` sólo en el servidor.
