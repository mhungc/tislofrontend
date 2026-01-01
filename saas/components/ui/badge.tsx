
"use client";

import * as React from "react";
import { forwardRef } from "react";
import {
  Badge as ChakraBadge,
  type BadgeProps as ChakraBadgeProps,
} from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Variantes de clase (si usas Tailwind/clsx junto a Chakra)
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends Omit<ChakraBadgeProps, "variant">,
    VariantProps<typeof badgeVariants> {
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, ...props },
  ref
) {
  const getChakraVariant = () => {
    switch (variant) {
      case "secondary":
        return "subtle";
      case "destructive":
        return "solid";
      case "outline":
        return "outline";
      default:
        return "solid";
    }
  };

  const getChakraColorScheme = () => {
    switch (variant) {
      case "destructive":
        return "red";
      case "secondary":
        return "gray";
      default:
        return "blue";
    }
  };

  return (
    <ChakraBadge
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      variant={getChakraVariant()}
      colorScheme={getChakraColorScheme()}
      {...props}
    />
  );
});

export { badgeVariants };
