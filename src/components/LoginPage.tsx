import { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { loginSchema } from '../utils/authValidation';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Validar en tiempo real cuando cambian los campos
  useEffect(() => {
    const result = loginSchema.safeParse({ usuario, contrasena });
    
    if (!result.success) {
      const nuevosErrores: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0];
        if (typeof path === 'string') {
          // Solo mostrar error si el campo tiene contenido
          if (path === 'usuario' && usuario.length > 0) {
            nuevosErrores[path] = issue.message;
          }
          if (path === 'contrasena' && contrasena.length > 0) {
            nuevosErrores[path] = issue.message;
          }
        }
      }
      setErrores(nuevosErrores);
    } else {
      setErrores({});
    }
  }, [usuario, contrasena]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar antes de enviar
    const result = loginSchema.safeParse({ usuario, contrasena });
    
    if (!result.success) {
      const nuevosErrores: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0];
        if (typeof path === 'string') {
          nuevosErrores[path] = issue.message;
        }
      }
      setErrores(nuevosErrores);
      return;
    }

    setLoading(true);

    try {
      const success = await login(usuario, contrasena);
      if (!success) {
        setError('Usuario o contraseña incorrectos');
      }
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el formulario es válido
  const esFormularioValido = usuario.length >= 3 && contrasena.length >= 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-[#1b6b2f]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size={80} />
            </div>
            <h1 className="text-3xl font-bold text-[#1b6b2f] mb-1">Gestor de Contratos</h1>
            <p className="text-sm text-gray-600">Sistema de administración institucional</p>
            <p className="text-xs text-gray-500 mt-2">Colegio Juan Tamayo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3.5 text-[#1b6b2f]" />
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-[#1b6b2f] focus:border-transparent transition-all ${
                    errores.usuario ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Usuario"
                  autoComplete="username"
                />
              </div>
              {errores.usuario && (
                <p className="mt-1 text-sm text-red-600">{errores.usuario}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-[#1b6b2f]" />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-[#1b6b2f] focus:border-transparent transition-all ${
                    errores.contrasena ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errores.contrasena && (
                <p className="mt-1 text-sm text-red-600">{errores.contrasena}</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !esFormularioValido}
              className="w-full py-2.5 px-4 bg-[#1b6b2f] text-white rounded-lg hover:bg-[#0d4620] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
