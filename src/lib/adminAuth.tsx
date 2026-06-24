import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ADMIN_USER, ADMIN_PASS } from './supabase';

type AdminSession = { username: string } | null;

type AdminContextValue = {
  session: AdminSession;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

const STORAGE_KEY = 'lovesaura.admin.session';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.username) setSession({ username: parsed.username });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const login = (username: string, password: string) => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const s = { username };
      setSession(s);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      } catch {
        // ignore storage errors
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return <AdminContext.Provider value={{ session, login, logout }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
