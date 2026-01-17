/*
  # Create contratos (contracts) table

  1. New Tables
    - `contratos`
      - `id` (uuid, primary key) - Auto-generated unique identifier
      - `n_contrato` (text) - Contract number
      - `tipo_contrato` (text) - Contract type
      - `contratista` (text) - Contractor name
      - `contratante` (text) - Contracting party
      - `nit` (text) - Tax ID number
      - `objetivo` (text) - Objective (long text)
      - `descripcion` (text) - Description (long text)
      - `valor_contrato` (numeric) - Contract value
      - `fecha_inicio` (date) - Start date
      - `fecha_fin` (date) - End date
      - `plazo` (text) - Term
      - `rubro_presupuestal` (text) - Budget item
      - `cdp` (text) - CDP number
      - `rpc` (text) - RPC number
      - `vigencia` (text) - Validity period
      - `valor_contrato_letras` (text) - Contract value in words
      - `fecha_expedicion` (date) - Issue date
      - `fuente_financiacion` (text) - Funding source
      - `forma_pago` (text) - Payment method
      - `regimen` (text) - Regime
      - `cedula` (text) - ID card number
      - `direccion` (text) - Address
      - `telefono` (text) - Phone number
      - `fecha_seleccion_contratista` (date) - Contractor selection date
      - `fecha_comunicacion_contratista` (date) - Contractor communication date
      - `fecha_factura` (date) - Invoice date
      - `fecha_liquidacion` (date) - Settlement date
      - `acuerdo_presupuesto` (boolean) - Budget agreement checkbox
      - `acta_cierre` (boolean) - Closing act checkbox
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `contratos` table
    - Add policies for public access (for demo/academic purposes)
    
  3. Notes
    - All date fields use the date type for proper date handling
    - Numeric fields use numeric type for financial calculations
    - Text fields accommodate long descriptions
    - Boolean fields for checkboxes
    - Timestamps track record changes
*/

CREATE TABLE IF NOT EXISTS contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  n_contrato text NOT NULL,
  tipo_contrato text DEFAULT '',
  contratista text DEFAULT '',
  contratante text DEFAULT '',
  nit text DEFAULT '',
  objetivo text DEFAULT '',
  descripcion text DEFAULT '',
  valor_contrato numeric DEFAULT 0,
  fecha_inicio date,
  fecha_fin date,
  plazo text DEFAULT '',
  rubro_presupuestal text DEFAULT '',
  cdp text DEFAULT '',
  rpc text DEFAULT '',
  vigencia text DEFAULT '',
  valor_contrato_letras text DEFAULT '',
  fecha_expedicion date,
  fuente_financiacion text DEFAULT '',
  forma_pago text DEFAULT '',
  regimen text DEFAULT '',
  cedula text DEFAULT '',
  direccion text DEFAULT '',
  telefono text DEFAULT '',
  fecha_seleccion_contratista date,
  fecha_comunicacion_contratista date,
  fecha_factura date,
  fecha_liquidacion date,
  acuerdo_presupuesto boolean DEFAULT false,
  acta_cierre boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON contratos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access"
  ON contratos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON contratos
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON contratos
  FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_contratos_n_contrato ON contratos(n_contrato);
CREATE INDEX IF NOT EXISTS idx_contratos_contratista ON contratos(contratista);
CREATE INDEX IF NOT EXISTS idx_contratos_fecha_inicio ON contratos(fecha_inicio);