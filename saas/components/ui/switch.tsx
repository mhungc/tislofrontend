import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onClick}
        className={cn(
          "inline-flex h-6 w-10 items-center rounded-full border border-input transition-colors",
          checked ? "bg-primary" : "bg-muted",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "ml-1 inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
    );
  },
);
Switch.displayName = "Switch";