import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
  sizeVariant?: "sm" | "md" | "lg";
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, sizeVariant = "md", ...props }, ref) => {
    const sizeClass = sizeVariant === "sm" ? "h-8 text-xs" : sizeVariant === "lg" ? "h-10" : "h-9";
    return (
      <select
        ref={ref}
        className={cn("w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50", sizeClass, className)}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";