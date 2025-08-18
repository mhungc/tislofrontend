// 🧪 Archivo de Prueba para Validar MCP de Supabase
// Abre este archivo y escribe código para probar las sugerencias

import { createClient } from '@supabase/supabase-js'

// Configuración del cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
)

// 🎯 PRUEBA 1: Autocompletado de Tablas
// Escribe esto y verifica si sugiere tus tablas reales:
async function testTableSuggestions() {
  const { data, error } = await supabase
    .from('users') // ← Escribe aquí y debería sugerir tus tablas
    .select('*')
}

// 🎯 PRUEBA 2: Autocompletado de Columnas
// Si-
// - tienes una tabla llamada 'users', prueba esto:
async function testColumnSuggestions() {
  co nst { data, error } = await supabase
    .from('users') // ← Cambia por una tabla que tengas
    .select('') // ← Escribe aquí y debería sugerir las columnas
}

// 🎯 PRUEBA 3: Consultas SQL
// Prueba escribir consultas SQL y verifica validación:
async function testSQLQueries() {
  // Intenta escribir consultas como:
  // SELECT * FROM users WHERE email = 'test@example.com'
  // INSERT INTO users (name, email) VALUES ('John', 'john@example.com')
}

// 🎯 PRUEBA 4: Funciones de Supabase
// Prueba las funciones disponibles:
async function testSupabaseFunctions() {
  // Auth
  const { user, error: authError } = await supabase.auth.getUser()
  
  // Storage
  const { data: files, error: storageError } = await supabase.storage
    .from('') // ← Debería sugerir tus buckets de storage
  
  // RPC (funciones personalizadas)
  const { data: rpcData, error: rpcError } = await supabase.rpc('') // ← Debería sugerir tus funciones
}

// 🎯 PRUEBA 5: Filtros y Consultas Avanzadas
async function testAdvancedQueries() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('', '') // ← Debería sugerir columnas para el filtro
    .order('', { ascending: true }) // ← Debería sugerir columnas para ordenar
    .limit(10)
}

// 📋 INSTRUCCIONES PARA PROBAR:
// 1. Abre este archivo en Cursor
// 2. Ve a las líneas marcadas con 🎯
// 3. Escribe código y verifica las sugerencias
// 4. Si aparecen sugerencias específicas de tu base de datos, ¡MCP funciona!

export {
  testTableSuggestions,
  testColumnSuggestions,
  testSQLQueries,
  testSupabaseFunctions,
  testAdvancedQueries
}
