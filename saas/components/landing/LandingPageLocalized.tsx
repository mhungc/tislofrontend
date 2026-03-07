'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GoogleAuthButton } from '@/components/google-auth-button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { 
  Calendar, 
  Link2, 
  Shield, 
  Users 
} from 'lucide-react'

interface LandingPageLocalizedProps {
  dict: any
  locale: string
}

export function LandingPageLocalized({ dict, locale }: LandingPageLocalizedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50" suppressHydrationWarning>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-sky-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
              Tislo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = `/${locale}/auth/login`}
              className="hidden sm:inline-flex"
            >
              {dict.landing.header.login}
            </Button>
            <Button 
              onClick={() => window.location.href = `/${locale}/auth/login`}
              className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white hover:from-sky-700 hover:to-emerald-700"
            >
              {dict.landing.header.signup}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-sky-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {dict.landing.hero.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {dict.landing.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GoogleAuthButton 
              className="w-full sm:w-auto px-8 py-3 text-lg"
              redirectTo={`/${locale}/dashboard`}
              label={dict.landing.hero.cta}
              loadingLabel={dict.auth.loading}
            />
          </div>
        </div>
      </section>

      {/* Explanation */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900">
            {dict.landing.explainer.title}
          </h2>
          <p className="text-lg text-gray-600">
            {dict.landing.explainer.description}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {dict.landing.features.items.map((feature: { title: string; description: string }, index: number) => {
            const icons = [Users, Shield, Calendar, Link2];
            const Icon = icons[index] ?? Calendar;
            return (
              <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  )
}