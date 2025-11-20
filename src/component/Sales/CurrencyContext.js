import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CurrencyContext = createContext();
const LS_KEY = "sellytics_currency_pref_v1";

export const CurrencyProvider = ({ children, defaultCurrency = "NGN" }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem(LS_KEY) || defaultCurrency;
    } catch {
      return defaultCurrency;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, currency); } catch {}
  }, [currency]);

  const formatCurrency = useMemo(() => {
    return (value) => {
      if (value == null || isNaN(Number(value))) return "-";
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(value));
      } catch {
        // fallback
        return `${currency} ${Number(value).toFixed(2)}`;
      }
    };
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
