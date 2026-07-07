/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [nome, setNome] = useState(() => localStorage.getItem("nome") || "");
  const navigate = useNavigate();

  const login = useCallback((novoToken, nomeUsuario) => {
    localStorage.setItem("token", novoToken);
    localStorage.setItem("nome", nomeUsuario);
    setToken(novoToken);
    setNome(nomeUsuario);
    navigate("/dashboard");
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    setToken(null);
    setNome("");
    navigate("/");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ token, nome, login, logout, autenticado: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
