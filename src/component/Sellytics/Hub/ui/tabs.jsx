import * as React from "react"

const TabsContext = React.createContext(null);

/* Root */
const Root = ({ defaultValue, value, onValueChange, children }) => {
  const [current, setCurrent] = React.useState(value ?? defaultValue);

  const setValue = (val) => {
    setCurrent(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

Root.displayName = "TabsRoot";

/* List */
const List = ({ children, ...props }) => (
  <div role="tablist" {...props}>
    {children}
  </div>
);

List.displayName = "TabsList";

/* Trigger */
const Trigger = ({ value, children, ...props }) => {
  const ctx = React.useContext(TabsContext);

  return (
    <button
      role="tab"
      data-state={ctx?.value === value ? "active" : "inactive"}
      onClick={() => ctx?.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
};

Trigger.displayName = "TabsTrigger";

/* Content */
const Content = ({ value, children, ...props }) => {
  const ctx = React.useContext(TabsContext);

  if (ctx?.value !== value) return null;

  return (
    <div role="tabpanel" {...props}>
      {children}
    </div>
  );
};

Content.displayName = "TabsContent";
/* Current exports */
export { Root, List, Trigger, Content };

/* ✅ Correct exports for shadcn UI */
export {
  Root as Tabs,          // alias Root -> Tabs
  List as TabsList,       // alias List -> TabsList
  Trigger as TabsTrigger, // alias Trigger -> TabsTrigger
  Content as TabsContent  // alias Content -> TabsContent
};
