import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const BreadcrumbContext = createContext(null);

export function BreadcrumbProvider({ children }) {
  const [labels, setLabels] = useState({});

  const setLabel = useCallback((path, label) => {
    setLabels(prev => {
      if (label) return { ...prev, [path]: label };
      if (!(path in prev)) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ labels, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

function useBreadcrumbContext() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error('useBreadcrumbContext must be used inside BreadcrumbProvider');
  return ctx;
}

export function useBreadcrumbLabels() {
  return useBreadcrumbContext().labels;
}

// Lets a detail page (e.g. IntentDetail) override its own route segment's
// breadcrumb — normally a raw UUID via TopBar's shortId() fallback — with
// the entity's actual display name once it's loaded. Cleared on unmount so
// a stale name never survives navigating to a different intent.
export function useBreadcrumbLabel(path, label) {
  const { setLabel } = useBreadcrumbContext();
  useEffect(() => {
    if (!path || !label) return;
    setLabel(path, label);
    return () => setLabel(path, null);
  }, [path, label, setLabel]);
}
