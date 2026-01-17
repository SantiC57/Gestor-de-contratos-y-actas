-- ============================================
-- ACTUALIZAR SOLO LAS FUNCIONES DE AUTENTICACIÓN
-- Ejecutar DESPUÉS de tener las tablas creadas
-- ============================================

-- Habilitar extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Eliminar usuarios anteriores (OPCIONAL - descomenta si quieres empezar limpio)
-- DELETE FROM usuarios_rector;

-- ============================================
-- Función: Verificar Login (Solo bcrypt)
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
  SELECT ur.id, ur.usuario, ur.contrasena
  INTO v_id, v_usuario, v_hash
  FROM usuarios_rector ur
  WHERE ur.usuario = p_usuario;
  
  -- Si no existe el usuario
  IF v_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
    RETURN;
  END IF;
  
  -- Verificar contraseña con bcrypt
  IF v_hash = crypt(p_contrasena, v_hash) THEN
    RETURN QUERY SELECT v_id, v_usuario, true;
  ELSE
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
  END IF;
END;
$$;

-- ============================================
-- Función: Registrar Usuario
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
  IF p_usuario IS NULL OR trim(p_usuario) = '' THEN
    RETURN QUERY SELECT false, 'El usuario no puede estar vacío'::text;
    RETURN;
  END IF;
  
  IF p_contrasena IS NULL OR length(p_contrasena) < 4 THEN
    RETURN QUERY SELECT false, 'La contraseña debe tener al menos 4 caracteres'::text;
    RETURN;
  END IF;
  
  SELECT usuario INTO usuario_existente
  FROM usuarios_rector
  WHERE usuario = p_usuario;
  
  IF usuario_existente IS NOT NULL THEN
    RETURN QUERY SELECT false, 'El usuario ya existe'::text;
    RETURN;
  END IF;
  
  INSERT INTO usuarios_rector (usuario, contrasena)
  VALUES (p_usuario, crypt(p_contrasena, gen_salt('bf')));
  
  RETURN QUERY SELECT true, 'Usuario registrado correctamente'::text;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, 'Error al registrar usuario: ' || SQLERRM;
END;
$$;

-- ============================================
-- Permisos
-- ============================================
GRANT EXECUTE ON FUNCTION verificar_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION registrar_usuario(text, text) TO anon, authenticated;

-- ============================================
-- VERIFICACIÓN RÁPIDA
-- ============================================
DO $$
DECLARE
  reg_result RECORD;
  login_ok RECORD;
  login_fail RECORD;
BEGIN
  -- Limpiar test previo
  DELETE FROM usuarios_rector WHERE usuario = '_test_temp_';
  
  -- Test registro
  SELECT * INTO reg_result FROM registrar_usuario('_test_temp_', 'test1234');
  IF NOT reg_result.exito THEN
    RAISE EXCEPTION 'FALLO: No se pudo registrar usuario de prueba';
  END IF;
  
  -- Test login correcto
  SELECT * INTO login_ok FROM verificar_login('_test_temp_', 'test1234');
  IF NOT login_ok.exito THEN
    RAISE EXCEPTION 'FALLO: Login con contraseña correcta no funciona';
  END IF;
  
  -- Test login incorrecto
  SELECT * INTO login_fail FROM verificar_login('_test_temp_', 'password_malo');
  IF login_fail.exito THEN
    RAISE EXCEPTION 'FALLO CRÍTICO: Login con contraseña incorrecta fue aceptado!';
  END IF;
  
  -- Limpiar
  DELETE FROM usuarios_rector WHERE usuario = '_test_temp_';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ FUNCIONES ACTUALIZADAS Y VERIFICADAS CORRECTAMENTE';
  RAISE NOTICE '';
  RAISE NOTICE 'Ahora puedes:';
  RAISE NOTICE '1. Ir a tu aplicación web';
  RAISE NOTICE '2. Registrar un nuevo usuario';
  RAISE NOTICE '3. Iniciar sesión con ese usuario';
  RAISE NOTICE '';
END $$;
