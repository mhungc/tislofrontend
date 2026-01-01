
"use client";

import * as React from "react";
import {
  Checkbox as ChakraCheckbox,
  type CheckboxProps as ChakraCheckboxProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends ChakraCheckboxProps {
  className?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof ChakraCheckbox>,
  CheckboxProps
>(function Checkbox({ className, ...props }, ref) {
  return (
    <ChakraCheckbox
      ref={ref}
      className={cn(className)}
      colorScheme="blue"
      {...props}
    />
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
