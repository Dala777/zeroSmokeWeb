"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>; // Agregar la función register
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  register: async () => false, // Proporcionar una implementación vacía por defecto
  logout: () => {},
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      authAPI
        .getProfile()
        .then((response) => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
  
      localStorage.setItem("token", token);
      setUser(user);
      setIsAuthenticated(true);
  
      // Redirigir según el rol del usuario
      if (user.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/";
      }
  
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };
  

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register({ name, email, password });
      const { token, user } = response.data;
  
      localStorage.setItem("token", token);
      setUser(user);
      setIsAuthenticated(true);
  
      return true;
    } catch (error) {
      console.error("Error during registration:", error);
      return false;
    }
  };
  

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, register, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
