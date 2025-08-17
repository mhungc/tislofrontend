# 🔧 Solución de Problemas: MCP no aparece en Cursor

## Posibles Causas y Soluciones

### 1. **Versión de Cursor**
- **Problema:** MCP puede no estar disponible en tu versión de Cursor
- **Solución:** 
  - Actualiza Cursor a la última versión
  - Verifica que tengas Cursor Pro (MCP puede ser una función premium)

### 2. **Configuración de MCP**
- **Problema:** MCP no está habilitado en la configuración
- **Solución:**
  - Ve a Settings (Ctrl+,)
  - Busca "MCP" o "Model Context Protocol"
  - Habilita la funcionalidad MCP

### 3. **Ubicación del Archivo de Configuración**
- **Problema:** El archivo `mcp.json` no está en la ubicación correcta
- **Solución:** 
  - El archivo debe estar en `.cursor/mcp.json` (no en `cursor/mcp.json`)
  - Mueve el archivo a la ubicación correcta

### 4. **Extensiones Requeridas**
- **Problema:** Faltan extensiones necesarias para MCP
- **Solución:**
  - Instala la extensión "Model Context Protocol" si está disponible
  - Verifica que tengas las extensiones de Supabase instaladas

## Pasos para Solucionar

### Paso 1: Verificar Versión de Cursor
1. Ve a Help → About
2. Verifica que tengas la última versión
3. Si no, actualiza Cursor

### Paso 2: Mover Archivo de Configuración
```bash
# Crear directorio .cursor si no existe
mkdir .cursor

# Mover el archivo mcp.json a la ubicación correcta
mv cursor/mcp.json .cursor/mcp.json
```

### Paso 3: Verificar Configuración
1. Abre Settings (Ctrl+,)
2. Busca "MCP" en la configuración
3. Habilita cualquier opción relacionada con MCP

### Paso 4: Reiniciar Cursor
1. Cierra Cursor completamente
2. Vuelve a abrir Cursor
3. Abre tu proyecto

### Paso 5: Verificar en Command Palette
1. Presiona Ctrl+Shift+P
2. Busca "MCP"
3. Si aparecen comandos MCP, la funcionalidad está disponible

## Configuración Alternativa

Si MCP no funciona, puedes usar:

### 1. **Supabase CLI**
```bash
npm install -g supabase
supabase login
supabase projects list
```

### 2. **Extensiones de Supabase**
- Instala la extensión oficial de Supabase para VS Code/Cursor
- Usa las herramientas integradas de la extensión

### 3. **Variables de Entorno**
- Configura las variables de entorno en `.env.local`
- Usa el cliente de Supabase directamente en tu código

## Verificar si MCP está Disponible

### En Windows:
1. Abre Command Palette (Ctrl+Shift+P)
2. Busca "MCP"
3. Si no aparece nada, MCP no está disponible en tu versión

### Alternativa:
1. Ve a View → Command Palette
2. Busca "Model Context Protocol"
3. Si no hay resultados, la funcionalidad no está habilitada

## Estado Actual de tu Configuración

✅ **Archivo mcp.json:** Existe en cursor/mcp.json
⚠️ **Ubicación:** Debería estar en .cursor/mcp.json
❓ **Versión de Cursor:** Por verificar
❓ **Funcionalidad MCP:** Por verificar


