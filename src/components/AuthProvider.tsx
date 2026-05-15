"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthAdmin = {
  id: string;
  username: string;
  staffId: string | null;
  displayName: string;
  displayLastname: string;
  roleId: string;
  roleName: string;
  roleLabel: string;
  roleColor: string;
  permissions: string[];
};

type AuthContextValue = {
  admin: AuthAdmin | null;
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue>({
  admin: null,
  permissions: [],
  loading: true,
  hasPermission: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AuthAdmin | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!alive) return;
        setAdmin(data?.admin || null);
        setPermissions(Array.isArray(data?.permissions) ? data.permissions : []);
      })
      .catch(() => {
        if (!alive) return;
        setAdmin(null);
        setPermissions([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    admin,
    permissions,
    loading,
    hasPermission: (permission) => permissions.includes(permission),
  }), [admin, permissions, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
