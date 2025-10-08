"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Este efeito roda apenas uma vez para verificar o token e definir o estado
    const token = Cookies.get('auth-token');
    
    // O '!!' transforma a string do token (ou undefined) em um booleano (true/false)
    setIsAuthenticated(!!token);
  }, []); // O array vazio garante que isso rode apenas uma vez no cliente

  useEffect(() => {
    // Este segundo efeito REAGE à mudança de estado de 'isAuthenticated'
    
    // Se a verificação já terminou (não é mais nulo) E o usuário NÃO está autenticado
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]); // Roda quando 'isAuthenticated' é definido

  // Enquanto o token está sendo verificado, mostra uma tela de carregamento
  if (isAuthenticated === null) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            Verificando autenticação...
        </div>
    );
  }

  // Se 'isAuthenticated' for true, mostra a página. 
  // Se for false, mostra 'null' por um instante enquanto o useEffect acima faz o redirect.
  return isAuthenticated ? <>{children}</> : null;
}

export const useAuth = () => useContext(AuthContext);