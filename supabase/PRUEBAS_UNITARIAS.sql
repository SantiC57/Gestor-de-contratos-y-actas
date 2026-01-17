-- ============================================
-- PRUEBAS UNITARIAS DE AUTENTICACIÓN
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Limpiar usuarios de prueba anteriores
DELETE FROM usuarios_rector WHERE usuario LIKE 'test_%';

-- ============================================
-- TEST 1: Registrar un usuario nuevo
-- ============================================
DO $$
DECLARE
  resultado RECORD;
BEGIN
  SELECT * INTO resultado FROM registrar_usuario('test_usuario', 'mipassword123');
  
  IF resultado.exito = true THEN
    RAISE NOTICE '✅ TEST 1 PASÓ: Usuario registrado correctamente - %', resultado.mensaje;
  ELSE
    RAISE EXCEPTION '❌ TEST 1 FALLÓ: %', resultado.mensaje;
  END IF;
END $$;

-- ============================================
-- TEST 2: Verificar que la contraseña está hasheada (NO en texto plano)
-- ============================================
DO $$
DECLARE
  v_contrasena text;
BEGIN
  SELECT contrasena INTO v_contrasena FROM usuarios_rector WHERE usuario = 'test_usuario';
  
  -- Verificar que empiece con $2a$ o $2b$ (formato bcrypt)
  IF v_contrasena LIKE '$2%' THEN
    RAISE NOTICE '✅ TEST 2 PASÓ: Contraseña hasheada con bcrypt';
  ELSIF v_contrasena = 'mipassword123' THEN
    RAISE EXCEPTION '❌ TEST 2 FALLÓ: Contraseña guardada en TEXTO PLANO (inseguro!)';
  ELSE
    RAISE EXCEPTION '❌ TEST 2 FALLÓ: Formato de hash desconocido: %', substring(v_contrasena, 1, 10);
  END IF;
END $$;

-- ============================================
-- TEST 3: Login con contraseña CORRECTA
-- ============================================
DO $$
DECLARE
  resultado RECORD;
BEGIN
  SELECT * INTO resultado FROM verificar_login('test_usuario', 'mipassword123');
  
  IF resultado.exito = true THEN
    RAISE NOTICE '✅ TEST 3 PASÓ: Login exitoso con contraseña correcta';
  ELSE
    RAISE EXCEPTION '❌ TEST 3 FALLÓ: No se pudo iniciar sesión con contraseña correcta';
  END IF;
END $$;

-- ============================================
-- TEST 4: Login con contraseña INCORRECTA (debe fallar)
-- ============================================
DO $$
DECLARE
  resultado RECORD;
BEGIN
  SELECT * INTO resultado FROM verificar_login('test_usuario', 'password_incorrecto');
  
  IF resultado.exito = false THEN
    RAISE NOTICE '✅ TEST 4 PASÓ: Login rechazado correctamente con contraseña incorrecta';
  ELSE
    RAISE EXCEPTION '❌ TEST 4 FALLÓ: ¡ALERTA! Se permitió login con contraseña incorrecta';
  END IF;
END $$;

-- ============================================
-- TEST 5: Login con usuario que NO existe
-- ============================================
DO $$
DECLARE
  resultado RECORD;
BEGIN
  SELECT * INTO resultado FROM verificar_login('usuario_inexistente', 'cualquier_pass');
  
  IF resultado.exito = false THEN
    RAISE NOTICE '✅ TEST 5 PASÓ: Login rechazado para usuario inexistente';
  ELSE
    RAISE EXCEPTION '❌ TEST 5 FALLÓ: Se permitió login con usuario inexistente';
  END IF;
END $$;

-- ============================================
-- TEST 6: No permitir registrar usuario duplicado
-- ============================================
DO $$
DECLARE
  resultado RECORD;
BEGIN
  SELECT * INTO resultado FROM registrar_usuario('test_usuario', 'otra_password');
  
  IF resultado.exito = false THEN
    RAISE NOTICE '✅ TEST 6 PASÓ: No se permite usuario duplicado - %', resultado.mensaje;
  ELSE
    RAISE EXCEPTION '❌ TEST 6 FALLÓ: Se permitió registrar usuario duplicado';
  END IF;
END $$;

-- ============================================
-- TEST 7: No permitir contraseña corta (menos de 4 caracteres)
-- ============================================
DO $$
DECLARE
  resultado RECORD;
BEGIN
  SELECT * INTO resultado FROM registrar_usuario('test_usuario2', '123');
  
  IF resultado.exito = false THEN
    RAISE NOTICE '✅ TEST 7 PASÓ: No se permite contraseña corta - %', resultado.mensaje;
  ELSE
    RAISE EXCEPTION '❌ TEST 7 FALLÓ: Se permitió contraseña de menos de 4 caracteres';
  END IF;
END $$;

-- ============================================
-- TEST 8: No permitir usuario vacío
-- ============================================
DO $$
DECLARE
  resultado RECORD;
BEGIN
  SELECT * INTO resultado FROM registrar_usuario('', 'password123');
  
  IF resultado.exito = false THEN
    RAISE NOTICE '✅ TEST 8 PASÓ: No se permite usuario vacío - %', resultado.mensaje;
  ELSE
    RAISE EXCEPTION '❌ TEST 8 FALLÓ: Se permitió usuario vacío';
  END IF;
END $$;

-- ============================================
-- LIMPIEZA: Eliminar usuarios de prueba
-- ============================================
DELETE FROM usuarios_rector WHERE usuario LIKE 'test_%';

-- ============================================
-- RESUMEN
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ TODAS LAS PRUEBAS PASARON CORRECTAMENTE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'El sistema de autenticación con bcrypt funciona correctamente:';
  RAISE NOTICE '- Registro de usuarios con hash bcrypt ✅';
  RAISE NOTICE '- Login con contraseña correcta ✅';
  RAISE NOTICE '- Rechazo de contraseña incorrecta ✅';
  RAISE NOTICE '- Rechazo de usuario inexistente ✅';
  RAISE NOTICE '- Prevención de usuarios duplicados ✅';
  RAISE NOTICE '- Validación de contraseña mínima ✅';
  RAISE NOTICE '- Validación de usuario no vacío ✅';
  RAISE NOTICE '';
END $$;
