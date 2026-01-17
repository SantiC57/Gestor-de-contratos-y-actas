-- ============================================
-- MIGRACIÓN: Seguridad de autenticación con bcrypt
-- Fecha: 2026-01-17
-- Descripción: Elimina usuario por defecto y agrega función de registro con hash
-- ============================================

-- Habilitar extensión pgcrypto si no está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Eliminar usuario por defecto sin hash
-- ============================================
DELETE FROM usuarios_rector WHERE usuario = 'rector' AND contrasena = '1234';

-- ============================================
-- Función: Registrar nuevo usuario con contraseña hasheada
-- ============================================
CREATE OR REPLACE FUNCTION registrar_usuario(
  p_usuario text,
  p_contrasena text
)
RETURNS TABLE(exito boolean, mensaje text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usuario_existente text;
BEGIN
  -- Validar que el usuario y contraseña no estén vacíos
  IF p_usuario IS NULL OR trim(p_usuario) = '' THEN
    RETURN QUERY SELECT false, 'El usuario no puede estar vacío'::text;
    RETURN;
  END IF;
  
  IF p_contrasena IS NULL OR length(p_contrasena) < 4 THEN
    RETURN QUERY SELECT false, 'La contraseña debe tener al menos 4 caracteres'::text;
    RETURN;
  END IF;
  
  -- Verificar si el usuario ya existe
  SELECT usuario INTO usuario_existente
  FROM usuarios_rector
  WHERE usuario = p_usuario;
  
  IF usuario_existente IS NOT NULL THEN
    RETURN QUERY SELECT false, 'El usuario ya existe'::text;
    RETURN;
  END IF;
  
  -- Insertar nuevo usuario con contraseña hasheada usando bcrypt
  INSERT INTO usuarios_rector (usuario, contrasena)
  VALUES (p_usuario, crypt(p_contrasena, gen_salt('bf')));
  
  RETURN QUERY SELECT true, 'Usuario registrado correctamente'::text;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, 'Error al registrar usuario: ' || SQLERRM;
END;
$$;

-- ============================================
-- Función: Verificar si hay usuarios en el sistema
-- ============================================
CREATE OR REPLACE FUNCTION hay_usuarios()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cantidad integer;
BEGIN
  SELECT count(*) INTO cantidad
  FROM usuarios_rector;
  
  RETURN cantidad > 0;
END;
$$;

-- ============================================
-- Grant execute permissions
-- ============================================
GRANT EXECUTE ON FUNCTION registrar_usuario(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hay_usuarios() TO anon, authenticated;

-- ============================================
-- Comentarios
-- ============================================
COMMENT ON FUNCTION registrar_usuario IS 'Registra un nuevo usuario con contraseña hasheada usando bcrypt';
COMMENT ON FUNCTION hay_usuarios IS 'Verifica si existen usuarios en el sistema';
