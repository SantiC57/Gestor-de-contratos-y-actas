import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  isLoggedIn: boolean;
  usuario: string | null;
  login: (usuario: string, contrasena: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newUsuario: string, newContrasena: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('rectorSession');
    if (stored) {
      setIsLoggedIn(true);
      setUsuario(stored);
    }
    setLoading(false);
  }, []);

  const login = async (inputUsuario: string, inputContrasena: string): Promise<boolean> => {
    try {
      // Usar la función RPC verificar_login que maneja el hash con crypt
      const { data, error } = await supabase
        .rpc('verificar_login', {
          p_usuario: inputUsuario,
          p_contrasena: inputContrasena
        });

      if (error || !data || data.length === 0) {
        return false;
      }

      // Verificar el campo 'exito' que devuelve la función
      const resultado = data[0];
      if (resultado && resultado.exito === true) {
        setIsLoggedIn(true);
        setUsuario(inputUsuario);
        localStorage.setItem('rectorSession', inputUsuario);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsuario(null);
    localStorage.removeItem('rectorSession');
  };

  const changePassword = async (newUsuario: string, newContrasena: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('actualizar_credenciales', {
          p_usuario_actual: usuario,
          p_nuevo_usuario: newUsuario,
          p_nueva_contrasena: newContrasena
        });

      if (error) {
        console.error('Error updating credentials:', error);
        return false;
      }

      if (data && data.length > 0 && data[0].exito) {
        setUsuario(newUsuario);
        localStorage.setItem('rectorSession', newUsuario);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error in changePassword:', err);
      return false;
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, usuario, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}