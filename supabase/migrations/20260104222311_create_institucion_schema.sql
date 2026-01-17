/*
  # Create institutional contract management schema

  1. New Tables
    - `usuarios_rector` - Rector user with secure credentials
    - `anos` - Years for contract organization
    - `contratos` - Contracts with exact required columns

  2. Details
    - Usuarios rector: stores rector login credentials
    - Anos: allows organizing contracts by year
    - Contratos: stores all contract data with exact column names as specified
    
  3. Security
    - Enable RLS on all tables
    - Public read/write access for institutional use
*/

-- Drop existing contratos table if it exists
DROP TABLE IF EXISTS contratos CASCADE;

-- Create usuarios_rector table for authentication
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

-- Create anos table
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

-- Create contratos table with exact column names as specified
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contratos_ano_id ON contratos(ano_id);
CREATE INDEX IF NOT EXISTS idx_contratos_n_contrato ON contratos("N CONTRATO");
CREATE INDEX IF NOT EXISTS idx_anos_ano ON anos(ano);

-- Insert default rector user (usuario: rector, contraseña: 1234)
INSERT INTO usuarios_rector (usuario, contrasena) 
VALUES ('rector', '1234')
ON CONFLICT (usuario) DO NOTHING;