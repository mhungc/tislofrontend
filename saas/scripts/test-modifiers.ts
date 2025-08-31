// Script para probar modificadores
console.log('🧪 Sistema de modificadores listo para probar')

// Datos de ejemplo para testing
const testData = {
  peluqueria: {
    service: {
      name: 'Corte infantil',
      duration: 30,
      price: 15
    },
    modifiers: [
      {
        name: 'Niños con necesidades especiales',
        duration_modifier: 20,
        price_modifier: 5,
        condition: 'customer_tag: necesidades_especiales'
      },
      {
        name: 'Primera visita',
        duration_modifier: 10,
        price_modifier: 0,
        condition: 'first_visit'
      }
    ]
  }
}

console.log('📋 Datos de prueba:', JSON.stringify(testData, null, 2))