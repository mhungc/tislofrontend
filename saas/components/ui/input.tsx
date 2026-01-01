
"use client";

import * as React from "react";
import {
  Input as ChakraInput,
  type InputProps as ChakraInputProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface InputProps extends ChakraInputProps {
  className?: string;
}

const Input = React.forwardRef<
  React.ElementRef<typeof ChakraInput>,
  InputProps
>(function Input({ className, type, ...props }, ref) {
  return (
    <ChakraInput
      ref={ref}
      type={type}
      className={cn(className)}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
