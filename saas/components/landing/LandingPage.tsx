'use client'

import React from 'react'
// import { useTranslations } from 'next-intl' // No usado
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GoogleAuthButton } from '@/components/google-auth-button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { 
  Calendar, 
  Clock, 
  Users, 
  Smartphone, 
  TrendingUp, 
  Shield, 
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Play
} from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ReservaFácil
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" onClick={() => window.location.href = '/auth/login'}>
              Iniciar Sesión
            </Button>
            <Button onClick={() => window.location.href = '/auth/sign-up'}>
              Comenzar Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            🚀 Nuevo: Modificadores Inteligentes
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gestiona tu Negocio de Servicios
            <span className="block">Sin Complicaciones</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La plataforma todo-en-uno para reservas online, gestión de clientes y crecimiento de tu negocio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <GoogleAuthButton 
              className="w-full sm:w-auto px-8 py-3 text-lg"
              redirectTo="/dashboard"
            />
            <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg group">
              <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Ver Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Gratis por 30 días
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Sin tarjeta de crédito
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Configuración en 5 minutos
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas para crecer
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desde reservas hasta reportes, tenemos las herramientas que tu negocio necesita
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Reservas Online 24/7</h3>
                <p className="text-gray-600">
                  Tus clientes pueden reservar cuando quieran. Enlaces personalizados y confirmación automática.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Modificadores Inteligentes</h3>
                <p className="text-gray-600">
                  Ajustes automáticos de tiempo y precio según el tipo de cliente. Perfecto para servicios especializados.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Reportes y Analytics</h3>
                <p className="text-gray-600">
                  Conoce tu negocio con reportes detallados de ingresos, clientes frecuentes y tendencias.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfecto para tu tipo de negocio
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '💇‍♀️', title: 'Peluquerías', desc: 'Cortes, tintes, tratamientos especiales' },
              { icon: '🏥', title: 'Consultorios', desc: 'Citas médicas, terapias, seguimientos' },
              { icon: '💆‍♀️', title: 'Spas & Wellness', desc: 'Masajes, faciales, relajación' },
              { icon: '🎉', title: 'Eventos', desc: 'Fiestas infantiles, celebraciones' }
            ].map((item, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Precios transparentes y justos
            </h2>
            <p className="text-xl text-gray-600">
              Comienza gratis y escala según creces
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Gratuito */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Starter</h3>
                  <div className="text-3xl font-bold mb-1">Gratis</div>
                  <p className="text-gray-600">Para empezar</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Hasta 50 reservas/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">1 tienda</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Reservas online básicas</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Comenzar Gratis
                </Button>
              </CardContent>
            </Card>

            {/* Plan Pro */}
            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Más Popular</Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Professional</h3>
                  <div className="text-3xl font-bold mb-1">$29<span className="text-lg text-gray-600">/mes</span></div>
                  <p className="text-gray-600">Para negocios en crecimiento</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Reservas ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Hasta 3 tiendas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Modificadores inteligentes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Reportes avanzados</span>
                  </li>
                </ul>
                <Button className="w-full">
                  Probar 30 días gratis
                </Button>
              </CardContent>
            </Card>

            {/* Plan Enterprise */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold mb-1">$99<span className="text-lg text-gray-600">/mes</span></div>
                  <p className="text-gray-600">Para cadenas y franquicias</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Todo en Professional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tiendas ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API personalizada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Soporte prioritario</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Contactar Ventas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de negocios que ya confían en ReservaFácil
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GoogleAuthButton 
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg"
              redirectTo="/dashboard"
            />
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
              Hablar con Ventas
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm opacity-75">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Datos seguros y encriptados
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              +500 negocios confían en nosotros
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              4.9/5 en satisfacción
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ReservaFácil</span>
              </div>
              <p className="text-gray-400">
                La plataforma de gestión de reservas más fácil de usar del mercado.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Características</li>
                <li>Precios</li>
                <li>Integraciones</li>
                <li>API</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Contacto</li>
                <li>Estado del Sistema</li>
                <li>Comunidad</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Acerca de</li>
                <li>Blog</li>
                <li>Carreras</li>
                <li>Privacidad</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ReservaFácil. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}