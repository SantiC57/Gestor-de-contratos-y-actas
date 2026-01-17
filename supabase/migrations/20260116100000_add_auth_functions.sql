-- ============================================
-- FUNCIONES DE AUTENTICACIÓN SEGURAS
-- ============================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS verificar_login(text, text);
DROP FUNCTION IF EXISTS actualizar_credenciales(text, text, text);

-- ============================================
-- Función 1: Verificar Login (con hash bcrypt)
-- ============================================
CREATE OR REPLACE FUNCTION verificar_login(p_usuario text, p_contrasena text)
RETURNS TABLE(id uuid, usuario text, exito boolean) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_usuario text;
  v_hash text;
BEGIN
  -- Buscar usuario y obtener hash
  SELECT ur.id, ur.usuario, ur.contrasena
  INTO v_id, v_usuario, v_hash
  FROM usuarios_rector ur
  WHERE ur.usuario = p_usuario;
  
  -- Si no existe el usuario
  IF v_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
    RETURN;
  END IF;
  
  -- Verificar contraseña con crypt
  IF v_hash = crypt(p_contrasena, v_hash) THEN
    RETURN QUERY SELECT v_id, v_usuario, true;
  ELSE
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
  END IF;
END;
$$;

-- ============================================
-- Función 2: Actualizar Credenciales (con hash)
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_credenciales(
  p_usuario_actual text,
  p_contrasena_actual text,
  p_nuevo_usuario text,
  p_nueva_contrasena text
)
RETURNS TABLE(exito boolean, mensaje text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash_actual text;
  rows_updated integer;
BEGIN
  -- Verificar que la contraseña actual sea correcta
  SELECT contrasena INTO v_hash_actual
  FROM usuarios_rector
  WHERE usuario = p_usuario_actual;
  
  -- Si el usuario no existe
  IF v_hash_actual IS NULL THEN
    RETURN QUERY SELECT false, 'Usuario no encontrado'::text;
    RETURN;
  END IF;
  
  -- Verificar contraseña actual
  IF v_hash_actual != crypt(p_contrasena_actual, v_hash_actual) THEN
    RETURN QUERY SELECT false, 'Contraseña actual incorrecta'::text;
    RETURN;
  END IF;
  
  -- Actualizar credenciales con nueva contraseña hasheada
  UPDATE usuarios_rector
  SET 
    usuario = p_nuevo_usuario,
    contrasena = crypt(p_nueva_contrasena, gen_salt('bf')),
    updated_at = now()
  WHERE usuario = p_usuario_actual;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  IF rows_updated > 0 THEN
    RETURN QUERY SELECT true, 'Credenciales actualizadas correctamente'::text;
  ELSE
    RETURN QUERY SELECT false, 'Error al actualizar credenciales'::text;
  END IF;
END;
$$;

-- ============================================
-- Función 3: Solo cambiar contraseña
-- ============================================
CREATE OR REPLACE FUNCTION cambiar_contrasena(
  p_usuario text,
  p_contrasena_actual text,
  p_nueva_contrasena text
)
RETURNS TABLE(exito boolean, mensaje text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash_actual text;
  rows_updated integer;
BEGIN
  -- Obtener hash actual
  SELECT contrasena INTO v_hash_actual
  FROM usuarios_rector
  WHERE usuario = p_usuario;
  
  -- Validaciones
  IF v_hash_actual IS NULL THEN
    RETURN QUERY SELECT false, 'Usuario no encontrado'::text;
    RETURN;
  END IF;
  
  IF v_hash_actual != crypt(p_contrasena_actual, v_hash_actual) THEN
    RETURN QUERY SELECT false, 'Contraseña actual incorrecta'::text;
    RETURN;
  END IF;
  
  IF length(p_nueva_contrasena) < 4 THEN
    RETURN QUERY SELECT false, 'La nueva contraseña debe tener al menos 4 caracteres'::text;
    RETURN;
  END IF;
  
  -- Actualizar solo la contraseña
  UPDATE usuarios_rector
  SET 
    contrasena = crypt(p_nueva_contrasena, gen_salt('bf')),
    updated_at = now()
  WHERE usuario = p_usuario;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  IF rows_updated > 0 THEN
    RETURN QUERY SELECT true, 'Contraseña actualizada correctamente'::text;
  ELSE
    RETURN QUERY SELECT false, 'Error al actualizar contraseña'::text;
  END IF;
END;
$$;

-- ============================================
-- Grant execute permissions
-- ============================================
GRANT EXECUTE ON FUNCTION verificar_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION actualizar_credenciales(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cambiar_contrasena(text, text, text) TO anon, authenticated;