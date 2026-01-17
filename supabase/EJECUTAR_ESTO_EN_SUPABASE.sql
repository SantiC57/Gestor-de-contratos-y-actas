-- ============================================
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- ============================================

-- 1. Habilitar extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. ELIMINAR TODOS los usuarios existentes (para empezar desde cero)
DELETE FROM usuarios_rector;

-- 3. Crear función de registro con hash bcrypt
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

-- 4. Verificar permisos
GRANT EXECUTE ON FUNCTION registrar_usuario(text, text) TO anon, authenticated;

-- 5. Verificar que la función verificar_login existe y está correcta
-- (Ya debería existir de la migración anterior)

-- 6. Verificar que se eliminaron todos los usuarios
SELECT * FROM usuarios_rector;
-- Debería devolver 0 filas

-- ============================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- 1. Recarga tu aplicación
-- 2. Haz clic en "¿Nuevo usuario? Regístrate aquí"
-- 3. Crea tu nuevo usuario
-- 4. Inicia sesión con ese usuario
-- ============================================
