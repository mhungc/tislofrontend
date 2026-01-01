'use client'

import React from 'react'
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

interface LandingPageLocalizedProps {
  dict: any
  locale: string
}

export function LandingPageLocalized({ dict, locale }: LandingPageLocalizedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" suppressHydrationWarning>
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
            <Button variant="ghost" onClick={() => window.location.href = `/${locale}/auth/login`}>
              {dict.landing.header.login}
            </Button>
            <Button onClick={() => window.location.href = `/${locale}/auth/sign-up`}>
              {dict.landing.header.signup}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            {dict.landing.hero.badge}
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {dict.landing.hero.title}
            <span className="block">{dict.landing.hero.subtitle}</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {dict.landing.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <GoogleAuthButton 
              className="w-full sm:w-auto px-8 py-3 text-lg"
              redirectTo="/dashboard"
            />
            <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg group">
              <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              {dict.landing.hero.demo}
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {dict.landing.hero.benefits.free}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {dict.landing.hero.benefits.noCard}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {dict.landing.hero.benefits.setup}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}