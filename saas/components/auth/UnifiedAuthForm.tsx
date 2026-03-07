"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { Calendar, Link2, Shield, Users } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/types/dictionary";

interface UnifiedAuthFormProps extends React.ComponentPropsWithoutRef<"div"> {
  dict: any;
  locale: Locale;
}

export function UnifiedAuthForm({ dict, locale, className, ...props }: UnifiedAuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const featureIcons = [Users, Shield, Calendar, Link2];
  const featureItems = dict.landing.features.items as Array<{ title: string; description: string }>;
  const features: Array<{ title: string; description: string; icon: typeof Calendar }> = featureItems.map((item, index) => ({
    icon: featureIcons[index] ?? Calendar,
    title: item.title,
    description: item.description,
  }));

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
        {/* Left Side - Branding & Benefits */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Tislo
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900">
              {dict.auth.title}
            </h1>
            <p className="text-xl text-gray-600">
              {dict.auth.description}
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-100">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-2 shadow-xl">
            <CardContent className="p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-sky-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  Tislo
                </span>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{dict.auth.title}</h2>
                <p className="text-gray-600">{dict.auth.description}</p>
              </div>

              {/* Google Auth Button */}
              <div className="space-y-4">
                <GoogleAuthButton 
                  className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-all"
                  onError={setError}
                  redirectTo={`/${locale}/dashboard`}
                  label={dict.auth.button}
                  loadingLabel={dict.auth.loading}
                />
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                {/* Privacy Note */}
                <p className="text-xs text-center text-gray-500 px-4">
                  {dict.auth.securityNote}
                </p>
              </div>

              {/* Mobile Features */}
              <div className="lg:hidden mt-8 pt-8 border-t space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className="h-4 w-4 text-sky-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
