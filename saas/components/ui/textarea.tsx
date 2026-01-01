
"use client";

import * as React from "react";
import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends ChakraTextareaProps {
  className?: string;
}

const Textarea = React.forwardRef<
  React.ElementRef<typeof ChakraTextarea>,
  TextareaProps
>(function Textarea({ className, ...props }, ref) {
  return (
    <ChakraTextarea
      ref={ref}
      className={cn(className)}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
