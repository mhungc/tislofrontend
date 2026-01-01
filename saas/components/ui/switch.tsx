
"use client";

import * as React from "react";
import {
  Switch as ChakraSwitch,
  type SwitchProps as ChakraSwitchProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends ChakraSwitchProps {
  className?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof ChakraSwitch>,
  SwitchProps
>(function Switch({ className, ...props }, ref) {
  return (
    <ChakraSwitch
      ref={ref}
      className={cn(className)}
      colorScheme="blue"
      {...props}
    />
  );
});
Switch.displayName = "Switch";

export { Switch };
