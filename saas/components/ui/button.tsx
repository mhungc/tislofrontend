import * as React from "react";
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends Omit<ChakraButtonProps, 'size' | 'variant'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    // Map custom variants to Chakra variants
    const getChakraVariant = () => {
      switch (variant) {
        case 'destructive': return 'solid';
        case 'outline': return 'outline';
        case 'secondary': return 'solid';
        case 'ghost': return 'ghost';
        case 'link': return 'link';
        default: return 'solid';
      }
    };

    const getChakraColorScheme = () => {
      switch (variant) {
        case 'destructive': return 'red';
        case 'secondary': return 'gray';
        default: return 'blue';
      }
    };

    const getChakraSize = () => {
      switch (size) {
        case 'sm': return 'sm';
        case 'lg': return 'lg';
        case 'icon': return 'sm';
        default: return 'md';
      }
    };

    if (asChild) {
      return (
        <span className={cn(buttonVariants({ variant, size, className }))}>
          {children}
        </span>
      );
    }

    return (
      <ChakraButton
        ref={ref}
        variant={getChakraVariant()}
        colorScheme={getChakraColorScheme()}
        size={getChakraSize()}
        className={className}
        {...props}
      >
        {children}
      </ChakraButton>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
