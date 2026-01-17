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

      // Si la función devuelve un resultado, el login es exitoso
      setIsLoggedIn(true);
      setUsuario(inputUsuario);
      localStorage.setItem('rectorSession', inputUsuario);
      return true;
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
      // Primero intentamos usar la función RPC si existe
      const { error: rpcError } = await supabase
        .rpc('actualizar_credenciales', {
          p_usuario_actual: usuario,
          p_nuevo_usuario: newUsuario,
          p_nueva_contrasena: newContrasena
        });

      if (!rpcError) {
        setUsuario(newUsuario);
        localStorage.setItem('rectorSession', newUsuario);
        return true;
      }

      // Si la función RPC no existe, usar update directo
      const { data, error } = await supabase
        .from('usuarios_rector')
        .update({ 
          usuario: newUsuario, 
          contrasena: newContrasena,
          updated_at: new Date().toISOString()
        })
        .eq('usuario', usuario)
        .select();

      if (error || !data || data.length === 0) {
        console.error('Error updating credentials:', error);
        return false;
      }

      setUsuario(newUsuario);
      localStorage.setItem('rectorSession', newUsuario);
      return true;
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