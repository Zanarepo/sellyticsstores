import * as React from "react";
import { Circle } from "lucide-react";
import { cn } from "../lib/utils";

/* RadioGroup wrapper */
const RadioGroup = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("grid gap-2", className)} {...props}>
    {children}
  </div>
));
RadioGroup.displayName = "RadioGroup";

/* RadioGroupItem wrapper */
const RadioGroupItem = React.forwardRef(({ className, checked, onChange, ...props }, ref) => (
  <label
    className={cn(
      "inline-flex items-center cursor-pointer",
      className
    )}
  >
    <input
      type="radio"
      ref={ref}
      checked={checked}
      onChange={onChange}
      className="sr-only"
      {...props}
    />
    <span
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow flex items-center justify-center",
        checked ? "bg-primary" : "bg-background"
      )}
    >
      {checked && <Circle className="h-3.5 w-3.5 fill-primary" />}
    </span>
  </label>
));
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
