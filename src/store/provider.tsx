"use client";

import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./store";
import { hydrateAuth } from "./slices/auth-slice";
import { fetchProfile } from "./slices/profile-slice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // Restore auth state from localStorage on mount, then fetch profile
  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;
    store.dispatch(hydrateAuth());
    // Fetch profile if user is authenticated after hydration
    const { isAuthenticated } = store.getState().auth;
    if (isAuthenticated) {
      store.dispatch(fetchProfile());
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
