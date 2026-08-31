"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "./api";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  bio?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identity: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiRequest("/api/auth/me");
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        localStorage.removeItem("kureva_token");
      }
    } catch (e) {
      setUser(null);
      localStorage.removeItem("kureva_token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("kureva_token");
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identity: string, password: string) => {
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      data: { identity, password },
    });
    if (res.success && res.data?.token) {
      localStorage.setItem("kureva_token", res.data.token);
      setUser(res.data.user);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await apiRequest("/api/auth/register", {
      method: "POST",
      data: { username, email, password },
    });
    if (res.success && res.data?.token) {
      localStorage.setItem("kureva_token", res.data.token);
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore error
    } finally {
      localStorage.removeItem("kureva_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
