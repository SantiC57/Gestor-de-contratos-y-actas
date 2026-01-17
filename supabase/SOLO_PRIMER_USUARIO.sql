-- ============================================
-- SOLO EJECUTAR ESTA FUNCIÓN
-- Permite login solo al primer usuario registrado
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función: Verificar Login (Solo primer usuario, con bcrypt)
CREATE OR REPLACE FUNCTION verificar_login(p_usuario text, p_contrasena text)
RETURNS TABLE(id uuid, usuario text, exito boolean) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_usuario text;
  v_hash text;
  v_primer_usuario text;
BEGIN
  -- Obtener el primer usuario registrado (por created_at)
  SELECT ur.usuario INTO v_primer_usuario
  FROM usuarios_rector ur
  ORDER BY ur.created_at ASC
  LIMIT 1;
  
  -- Si no hay usuarios
  IF v_primer_usuario IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
    RETURN;
  END IF;
  
  -- Si el usuario que intenta ingresar NO es el primero
  IF p_usuario != v_primer_usuario THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
    RETURN;
  END IF;
  
  -- Obtener datos del primer usuario
  SELECT ur.id, ur.usuario, ur.contrasena
  INTO v_id, v_usuario, v_hash
  FROM usuarios_rector ur
  WHERE ur.usuario = p_usuario;
  
  -- Verificar contraseña con bcrypt
  IF v_hash = crypt(p_contrasena, v_hash) THEN
    RETURN QUERY SELECT v_id, v_usuario, true;
  ELSE
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_login(text, text) TO anon, authenticated;

-- ============================================
-- PRUEBA RÁPIDA
-- ============================================
DO $$
DECLARE
  primer_user text;
BEGIN
  SELECT usuario INTO primer_user FROM usuarios_rector ORDER BY created_at ASC LIMIT 1;
  
  IF primer_user IS NOT NULL THEN
    RAISE NOTICE '✅ Función actualizada. Solo puede ingresar el usuario: %', primer_user;
  ELSE
    RAISE NOTICE '⚠️ No hay usuarios en la tabla. Debes crear uno primero.';
  END IF;
END $$;
