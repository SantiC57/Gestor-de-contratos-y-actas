/*
  # Create actas table for meeting minutes management

  1. New Table
    - `actas` - Meeting minutes with all required columns

  2. Security
    - Enable RLS on actas table
    - Public read/write access for institutional use
*/

-- Create actas table
--- ============================================
-- TABLA DE ACTAS (Usando la misma tabla "anos")
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
-- ÍNDICES PARA OPTIMIZAR BÚSQUEDAS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_actas_ano_id ON actas(ano_id);
CREATE INDEX IF NOT EXISTS idx_actas_no_de_acta ON actas("NO_DE_ACTA");
CREATE INDEX IF NOT EXISTS idx_actas_fecha_reunion ON actas("FECHA_DE_LA_REUNION");
CREATE INDEX IF NOT EXISTS idx_actas_organo ON actas("ORGANO_QUE_SE_REUNE");

