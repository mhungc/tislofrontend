
"use client";

import * as React from "react";
import {
  Avatar as ChakraAvatar,
  type AvatarProps as ChakraAvatarProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends ChakraAvatarProps {
  className?: string;
}

const Avatar = React.forwardRef<React.ElementRef<typeof ChakraAvatar>, AvatarProps>(
  function Avatar({ className, ...props }, ref) {
    return (
      <ChakraAvatar
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  { src?: string; alt?: string; className?: string }
>(function AvatarImage({ className, ...props }, ref) {
  return (
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
``
