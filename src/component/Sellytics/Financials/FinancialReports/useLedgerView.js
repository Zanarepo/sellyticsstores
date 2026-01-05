import { useEffect, useState } from 'react';

export const STORAGE_KEY = 'ledger:view';

export function useLedgerView() {
  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'card';
    return localStorage.getItem(STORAGE_KEY) || 'card';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, view);
  }, [view]);

  return [view, setView];
}
