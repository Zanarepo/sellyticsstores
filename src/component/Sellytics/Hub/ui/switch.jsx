import * as React from "react";
import { cn } from "../lib/utils";

/* Switch wrapper */
const Switch = React.forwardRef(({ className, checked, onChange, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-primary" : "bg-input",
      className
    )}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only"
      {...props}
    />
    <span
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )}
    />
  </label>
));
Switch.displayName = "Switch";

export { Switch };
