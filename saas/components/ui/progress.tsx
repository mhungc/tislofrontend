
"use client";

import * as React from "react";
import {
  Progress as ChakraProgress,
  type ProgressProps as ChakraProgressProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends ChakraProgressProps {
  className?: string;
  value?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ChakraProgress>,
  ProgressProps
>(function Progress({ className, value, ...props }, ref) {
  return (
    <ChakraProgress
      ref={ref}
      className={cn(className)}
      value={value}
      colorScheme="blue"
      {...props}
    />
  );
});
Progress.displayName = "Progress";

export { Progress };
