import * as React from "react";

const CollapsibleContext = React.createContext(null);

/* Root */
const Root = ({ open: controlledOpen, defaultOpen = false, onOpenChange, children }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (value) => {
    if (!isControlled) setUncontrolledOpen(value);
    onOpenChange?.(value);
  };

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      {children}
    </CollapsibleContext.Provider>
  );
};

/* Trigger */
const CollapsibleTrigger = React.forwardRef(
  ({ children, ...props }, ref) => {
    const ctx = React.useContext(CollapsibleContext);

    if (!ctx) {
      throw new Error("CollapsibleTrigger must be used within Collapsible");
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={ctx.open}
        data-state={ctx.open ? "open" : "closed"}
        onClick={() => ctx.setOpen(!ctx.open)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CollapsibleTrigger.displayName = "CollapsibleTrigger";

/* Content */
const CollapsibleContent = React.forwardRef(
  ({ children, ...props }, ref) => {
    const ctx = React.useContext(CollapsibleContext);
    if (!ctx || !ctx.open) return null;

    return (
      <div
        ref={ref}
        data-state="open"
        {...props}
      >
        {children}
      </div>
    );
  }
);

CollapsibleContent.displayName = "CollapsibleContent";

/* ✅ EXPORTS (THIS IS THE KEY FIX) */
export {
  Root as Collapsible,        // 👈 alias added
  Root,
  CollapsibleTrigger,
  CollapsibleContent,
};
