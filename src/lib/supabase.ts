import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UsuarioRector {
  id?: string;
  usuario: string;
  contrasena: string;
  created_at?: string;
  updated_at?: string;
}

export interface Ano {
  id?: string;
  ano: number;
  created_at?: string;
  updated_at?: string;
}

export interface Contrato {
  id?: string;
  ano_id: string;
  'N CONTRATO': string;
  'TIPO CONTRATO': string;
  'CONTRATISTA': string;
  'CONTRATANTE': string;
  'NIT': string;
  'OBJETIVO': string;
  'DESCRIPCION DE LA NECESIDAD': string;
  'VALOR': number;
  'FECHA INICIO': string;
  'FECHA FIN': string;
  'PLAZO': string;
  'RUBRO PRESUPUESTAL': string;
  'DISPONIBILIDAD PRESUPUESTAL': string;
  'RPC': string;
  'VIGENCIA': string;
  'VALOR CONTRATO LETRAS': string;
  'FECHA EXPEDICIÓN': string;
  'FUENTE DE FINANCIACION': string;
  'FORMA DE PAGO': string;
  'REGIMEN': string;
  'CEDULA': string;
  'DIRECCION': string;
  'TELEFONO': string;
  'FECHA SELECCION CONTRATISTA': string;
  'FECHA COMUNICACIÓN CONTRATISTA': string;
  'FECHA FACTURA': string;
  'FECHA LIQUIDACION': string;
  'ACUERDO PRESUPUESTO': string;
  'ACTA CIERRE': string;
  created_at?: string;
  updated_at?: string;
}

export interface Acta {
  id?: string;
  ano_id: string;
  'NO_DE_ACTA': string;
  'ORGANO_QUE_SE_REUNE': string;
  'FECHA_DE_LA_REUNION': string;
  'NATURALEZA_DE_LA_REUNION': string;
  'LUGAR': string;
  'SECRETARIO_DE_LA_REUNION': string;
  'FORMATO_DE_CONVOCATORIA': string;
  'HORA_DE_INICIO_DE_LA_REUNION': string;
  'HORA_DE_TERMINACION': string;
  'CARGO': string;
  'ORGANO1': string;
  'ORGANO2': string;
  'ORGANO3': string;
  'ORGANO4': string;
  'ORGANO5': string;
  'ORGANO6': string;
  'ORGANO7': string;
  'ORGANO8': string;
  'ORGANO9': string;
  'ORGANO10': string;
  'NOMBRE1': string;
  'NOMBRE2': string;
  'NOMBRE3': string;
  'NOMBRE4': string;
  'NOMBRE5': string;
  'NOMBRE6': string;
  'NOMBRE7': string;
  'NOMBRE8': string;
  'NOMBRE9': string;
  'NOMBRE10': string;
  'OBJETIVO': string;
  'TEMA1': string;
  'TEMA2': string;
  'TEMA3': string;
  'TEMA4': string;
  'TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA': string;
  'TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR': string;
  'TEXTO_DEL_TEMA1': string;
  'TEXTO_DEL_TEMA2': string;
  'TEXTO_DEL_TEMA3': string;
  'TEXTO_DEL_TEMA4': string;
  'TEXTO_DE_PROPOSICIONES_Y_VARIOS': string;
  created_at?: string;
  updated_at?: string;
}
