# Configuración MCP para Supabase

## 1. Obtener Access Token de Supabase

1. Ve a [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Haz clic en "Generate new token"
3. Dale un nombre descriptivo (ej: "MCP Server Token")
4. Copia el token generado (empieza con `sbp_`)

## 2. Obtener Project Reference

1. Ve a tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. En la configuración del proyecto, encuentra el "Project Reference" (ID del proyecto)
3. Copia este ID

## 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=tu-anon-key
SUPABASE_ACCESS_TOKEN=tu-access-token
```

## 4. Actualizar MCP Configuration

Actualiza `cursor/mcp.json` con tu información real:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "TU_PROJECT_REFERENCE"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "TU_ACCESS_TOKEN"
      }
    }
  }
}
```

## 5. Verificar Configuración

1. Reinicia Cursor
2. El servidor MCP debería conectarse automáticamente
3. Puedes verificar la conexión en la consola de Cursor

## Notas Importantes

- **Access Token**: Nunca compartas tu access token públicamente
- **Project Reference**: Es el ID único de tu proyecto Supabase
- **Read-only**: La configuración actual es de solo lectura por seguridad
- **Variables de entorno**: Asegúrate de que las variables estén correctamente configuradas

