import * as React from "react";
import { Box, BoxProps } from '@chakra-ui/react';

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  BoxProps
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className,
    )}
    bg="white"
    borderWidth="1px"
    borderColor="gray.200"
    borderRadius="xl"
    shadow="sm"
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  BoxProps
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    p={6}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  BoxProps
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    fontWeight="semibold"
    lineHeight="none"
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  BoxProps
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    fontSize="sm"
    color="gray.600"
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  BoxProps
>(({ className, ...props }, ref) => (
  <Box ref={ref} className={cn("p-6 pt-0", className)} p={6} pt={0} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  BoxProps
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    display="flex"
    alignItems="center"
    p={6}
    pt={0}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
