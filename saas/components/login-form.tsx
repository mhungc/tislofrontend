"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);



  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Accede a tu cuenta con Google para gestionar tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <GoogleAuthButton 
              className="w-full" 
              onError={setError}
              redirectTo="/dashboard"
            />
            
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            
            <p className="text-xs text-center text-muted-foreground">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
