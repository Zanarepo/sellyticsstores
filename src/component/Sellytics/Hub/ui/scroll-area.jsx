import * as React from "react";
import { cn } from "../lib/utils";

/* Primitive + Wrapper Combined */
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <Viewport className="h-full w-full rounded-[inherit]">{children}</Viewport>
    <ScrollBar />
    <Corner />
  </div>
));

ScrollArea.displayName = "ScrollArea";

/* Viewport */
const Viewport = React.forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} style={{ overflow: "auto", width: "100%", height: "100%" }} {...props}>
    {children}
  </div>
));
Viewport.displayName = "ScrollAreaViewport";

/* ScrollBar */
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    data-orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <Thumb className="relative flex-1 rounded-full bg-border" />
  </div>
));
ScrollBar.displayName = "ScrollBar";

/* Thumb */
const Thumb = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));
Thumb.displayName = "ScrollAreaThumb";

/* Corner */
const Corner = React.forwardRef((props, ref) => (
  <div ref={ref} {...props} />
));
Corner.displayName = "ScrollAreaCorner";

export { ScrollArea, ScrollBar, Viewport, Thumb, Corner };
