
"use client";

import * as React from "react";
import {
  Divider,
  type DividerProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<
  React.ElementRef<typeof Divider>,
  SeparatorProps
>(function Separator({ className, orientation = "horizontal", ...props }, ref) {
  return (
    <Divider
      ref={ref}
      className={cn(className)}
      orientation={orientation}
      {...props}
    />
  );
});
Separator.displayName = "Separator";

export { Separator };
