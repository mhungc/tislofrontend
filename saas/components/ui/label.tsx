
"use client";

import * as React from "react";
import {
  FormLabel,
  type FormLabelProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface LabelProps extends FormLabelProps {
  className?: string;
}

const Label = React.forwardRef<
  React.ElementRef<typeof FormLabel>,
  LabelProps
>(function Label({ className, ...props }, ref) {
  return (
    <FormLabel
      ref={ref}
      className={cn(className)}
      fontSize="sm"
      fontWeight="medium"
      {...props}
    />
  );
});
Label.displayName = "Label";

export { Label };
