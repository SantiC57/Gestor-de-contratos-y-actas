-- ============================================
-- SCRIPT COMPLETO DE INSTALACIÓN
-- Ejecutar TODO de una vez en Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. HABILITAR EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 2. CREAR TABLA DE USUARIOS (sin usuario por defecto)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios_rector (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario text UNIQUE NOT NULL,
  contrasena text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE usuarios_rector ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to rector user"
  ON usuarios_rector
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public update to rector user"
  ON usuarios_rector
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. CREAR TABLA DE AÑOS
-- ============================================
CREATE TABLE IF NOT EXISTS anos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano integer NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE anos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to anos"
  ON anos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to anos"
  ON anos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public delete to anos"
  ON anos
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================
-- 4. CREAR TABLA DE CONTRATOS
-- ============================================
CREATE TABLE IF NOT EXISTS contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano_id uuid NOT NULL REFERENCES anos(id) ON DELETE CASCADE,
  "N CONTRATO" text NOT NULL,
  "TIPO CONTRATO" text DEFAULT '',
  "CONTRATISTA" text DEFAULT '',
  "CONTRATANTE" text DEFAULT '',
  "NIT" text DEFAULT '',
  "OBJETIVO" text DEFAULT '',
  "DESCRIPCION DE LA NECESIDAD" text DEFAULT '',
  "VALOR" numeric DEFAULT 0,
  "FECHA INICIO" text DEFAULT '',
  "FECHA FIN" text DEFAULT '',
  "PLAZO" text DEFAULT '',
  "RUBRO PRESUPUESTAL" text DEFAULT '',
  "DISPONIBILIDAD PRESUPUESTAL" text DEFAULT '',
  "RPC" text DEFAULT '',
  "VIGENCIA" text DEFAULT '',
  "VALOR CONTRATO LETRAS" text DEFAULT '',
  "FECHA EXPEDICIÓN" text DEFAULT '',
  "FUENTE DE FINANCIACION" text DEFAULT '',
  "FORMA DE PAGO" text DEFAULT '',
  "REGIMEN" text DEFAULT '',
  "CEDULA" text DEFAULT '',
  "DIRECCION" text DEFAULT '',
  "TELEFONO" text DEFAULT '',
  "FECHA SELECCION CONTRATISTA" text DEFAULT '',
  "FECHA COMUNICACIÓN CONTRATISTA" text DEFAULT '',
  "FECHA FACTURA" text DEFAULT '',
  "FECHA LIQUIDACION" text DEFAULT '',
  "ACUERDO PRESUPUESTO" text DEFAULT '',
  "ACTA CIERRE" text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to contratos"
  ON contratos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to contratos"
  ON contratos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to contratos"
  ON contratos
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to contratos"
  ON contratos
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================
-- 5. CREAR TABLA DE ACTAS
-- ============================================
CREATE TABLE IF NOT EXISTS actas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano_id uuid NOT NULL REFERENCES anos(id) ON DELETE CASCADE,
  
  -- Información básica del acta
  "NO_DE_ACTA" text NOT NULL,
  "ORGANO_QUE_SE_REUNE" text DEFAULT '',
  "FECHA_DE_LA_REUNION" text DEFAULT '',
  "NATURALEZA_DE_LA_REUNION" text DEFAULT '',
  "LUGAR" text DEFAULT '',
  "SECRETARIO_DE_LA_REUNION" text DEFAULT '',
  "FORMATO_DE_CONVOCATORIA" text DEFAULT '',
  "HORA_DE_INICIO_DE_LA_REUNION" text DEFAULT '',
  "HORA_DE_TERMINACION" text DEFAULT '',
  
  -- Cargo
  "CARGO" text DEFAULT '',
  
  -- Órganos (hasta 10)
  "ORGANO1" text DEFAULT '',
  "ORGANO2" text DEFAULT '',
  "ORGANO3" text DEFAULT '',
  "ORGANO4" text DEFAULT '',
  "ORGANO5" text DEFAULT '',
  "ORGANO6" text DEFAULT '',
  "ORGANO7" text DEFAULT '',
  "ORGANO8" text DEFAULT '',
  "ORGANO9" text DEFAULT '',
  "ORGANO10" text DEFAULT '',
  
  -- Nombres de asistentes (hasta 10)
  "NOMBRE1" text DEFAULT '',
  "NOMBRE2" text DEFAULT '',
  "NOMBRE3" text DEFAULT '',
  "NOMBRE4" text DEFAULT '',
  "NOMBRE5" text DEFAULT '',
  "NOMBRE6" text DEFAULT '',
  "NOMBRE7" text DEFAULT '',
  "NOMBRE8" text DEFAULT '',
  "NOMBRE9" text DEFAULT '',
  "NOMBRE10" text DEFAULT '',
  
  -- Objetivo y temas
  "OBJETIVO" text DEFAULT '',
  "TEMA1" text DEFAULT '',
  "TEMA2" text DEFAULT '',
  "TEMA3" text DEFAULT '',
  "TEMA4" text DEFAULT '',
  
  -- Textos del acta
  "TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA" text DEFAULT '',
  "TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR" text DEFAULT '',
  "TEXTO_DEL_TEMA1" text DEFAULT '',
  "TEXTO_DEL_TEMA2" text DEFAULT '',
  "TEXTO_DEL_TEMA3" text DEFAULT '',
  "TEXTO_DEL_TEMA4" text DEFAULT '',
  "TEXTO_DE_PROPOSICIONES_Y_VARIOS" text DEFAULT '',
  
  -- Metadatos
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE actas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to actas"
  ON actas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to actas"
  ON actas FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to actas"
  ON actas FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to actas"
  ON actas FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================
-- 6. CREAR ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contratos_ano_id ON contratos(ano_id);
CREATE INDEX IF NOT EXISTS idx_contratos_n_contrato ON contratos("N CONTRATO");
CREATE INDEX IF NOT EXISTS idx_anos_ano ON anos(ano);
CREATE INDEX IF NOT EXISTS idx_actas_ano_id ON actas(ano_id);

-- ============================================
-- 7. FUNCIONES DE AUTENTICACIÓN CON BCRYPT
-- ============================================

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
  
  -- Si no hay usuarios o el usuario no es el primero
  IF v_primer_usuario IS NULL OR p_usuario != v_primer_usuario THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, false;
    RETURN;
  END IF;
  
  -- Obtener datos del usuario
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

-- Función: Actualizar Credenciales (Solo para el primer usuario)
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

-- Función: Actualizar Credenciales
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
  SELECT contrasena INTO v_hash_actual
  FROM usuarios_rector
  WHERE usuario = p_usuario_actual;
  
  IF v_hash_actual IS NULL THEN
    RETURN QUERY SELECT false, 'Usuario no encontrado'::text;
    RETURN;
  END IF;
  
  IF v_hash_actual != crypt(p_contrasena_actual, v_hash_actual) THEN
    RETURN QUERY SELECT false, 'Contraseña actual incorrecta'::text;
    RETURN;
  END IF;
  
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

-- Función: Cambiar Contraseña
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
  SELECT contrasena INTO v_hash_actual
  FROM usuarios_rector
  WHERE usuario = p_usuario;
  
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
-- 8. PERMISOS DE FUNCIONES
-- ============================================
GRANT EXECUTE ON FUNCTION verificar_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION registrar_usuario(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION actualizar_credenciales(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cambiar_contrasena(text, text, text) TO anon, authenticated;

-- ============================================
-- INSTALACIÓN COMPLETA
-- ============================================
-- ✅ Extensiones habilitadas
-- ✅ Tablas creadas: usuarios_rector, anos, contratos, actas
-- ✅ Políticas RLS configuradas
-- ✅ Funciones de autenticación con bcrypt
-- ✅ NO hay usuario por defecto (debes registrarte)
-- ============================================
