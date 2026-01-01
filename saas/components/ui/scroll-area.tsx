
"use client";

import * as React from "react";
import { Box, type BoxProps } from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends BoxProps {
  className?: string;
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof Box>,
  ScrollAreaProps
>(function ScrollArea({ className, children, ...props }, ref) {
  return (
    <Box
      ref={ref}
      className={cn(className)}
      overflowY="auto"
      {...props}
    >
      {children}
    </Box>
  );
});
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
