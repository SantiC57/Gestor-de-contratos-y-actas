import * as XLSX from 'xlsx';
import { Contrato, Acta } from '../lib/supabase';

/**
 * Exporta contratos a Excel con formato correcto para la columna VALOR
 * La columna VALOR se exporta como texto con formato "$ X.XXX.XXX"
 */
/**
 * Formatea un número como moneda colombiana con signo de peso
 * Ejemplo: 4000000 -> "$ 4.000.000"
 */
const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  return '$ ' + numValue.toLocaleString('es-CO', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
};

export const exportContratosToExcel = (contratos: Contrato[], anoLabel: string = '') => {
  const data = contratos.map((contrato) => ({
    'N CONTRATO': contrato['N CONTRATO'],
    'TIPO CONTRATO': contrato['TIPO CONTRATO'],
    'CONTRATISTA': contrato['CONTRATISTA'],
    'CONTRATANTE': contrato['CONTRATANTE'],
    'NIT': contrato['NIT'],
    'OBJETIVO': contrato['OBJETIVO'],
    'DESCRIPCION DE LA NECESIDAD': contrato['DESCRIPCION DE LA NECESIDAD'],
    'VALOR': formatCurrency(contrato['VALOR']),
    'FECHA INICIO': contrato['FECHA INICIO'],
    'FECHA FIN': contrato['FECHA FIN'],
    'PLAZO': contrato['PLAZO'],
    'RUBRO PRESUPUESTAL': contrato['RUBRO PRESUPUESTAL'],
    'DISPONIBILIDAD PRESUPUESTAL': contrato['DISPONIBILIDAD PRESUPUESTAL'],
    'RPC': contrato['RPC'],
    'VIGENCIA': contrato['VIGENCIA'],
    'VALOR CONTRATO LETRAS': contrato['VALOR CONTRATO LETRAS'],
    'FECHA EXPEDICIÓN': contrato['FECHA EXPEDICIÓN'],
    'FUENTE DE FINANCIACION': contrato['FUENTE DE FINANCIACION'],
    'FORMA DE PAGO': contrato['FORMA DE PAGO'],
    'REGIMEN': contrato['REGIMEN'],
    'CEDULA': contrato['CEDULA'],
    'DIRECCION': contrato['DIRECCION'],
    'TELEFONO': contrato['TELEFONO'],
    'FECHA SELECCION CONTRATISTA': contrato['FECHA SELECCION CONTRATISTA'],
    'FECHA COMUNICACIÓN CONTRATISTA': contrato['FECHA COMUNICACIÓN CONTRATISTA'],
    'FECHA FACTURA': contrato['FECHA FACTURA'],
    'FECHA LIQUIDACION': contrato['FECHA LIQUIDACION'],
    'ACUERDO PRESUPUESTO': contrato['ACUERDO PRESUPUESTO'],
    'ACTA CIERRE': contrato['ACTA CIERRE'],
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Configurar anchos de columna
  const colWidths = [
    { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 15 },
    { wch: 40 }, { wch: 40 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
    { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
    { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
    { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 15 },
  ];
  worksheet['!cols'] = colWidths;

  const range = XLSX.utils.decode_range(worksheet['!ref']!);
  
  // Aplicar estilos a los encabezados
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: '4B5563' } },
        fontColor: { rgb: 'FFFFFF' },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      };
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos');

  const fileName = `contratos_${anoLabel || new Date().getFullYear()}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

function parseCurrencyToNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned === '') return null;

    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }

  return null;
}




export const importContratosFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false
        }) as any[][];

        const headers = rows[0].map((h: string) =>
          h?.toString().trim().toUpperCase()
        );

        const dataRows = rows.slice(1);

        const result = dataRows.map((row) => {
          const obj: any = {};

          headers.forEach((header, index) => {
            const cellValue = row[index];

            if (header === 'VALOR' || header === 'VALOR CONTRATO') {
              obj[header] = parseCurrencyToNumber(cellValue);
            } else {
              obj[header] = cellValue?.toString().trim() || '';
            }
          });

          return obj;
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Exporta actas a Excel
 */
export const exportActasToExcel = (actas: Acta[], anoLabel: string = '') => {
  const data = actas.map((acta) => ({
    'NO_DE_ACTA': acta['NO_DE_ACTA'],
    'ORGANO_QUE_SE_REUNE': acta['ORGANO_QUE_SE_REUNE'],
    'FECHA_DE_LA_REUNION': acta['FECHA_DE_LA_REUNION'],
    'NATURALEZA_DE_LA_REUNION': acta['NATURALEZA_DE_LA_REUNION'],
    'LUGAR': acta['LUGAR'],
    'SECRETARIO_DE_LA_REUNION': acta['SECRETARIO_DE_LA_REUNION'],
    'FORMATO_DE_CONVOCATORIA': acta['FORMATO_DE_CONVOCATORIA'],
    'HORA_DE_INICIO_DE_LA_REUNION': acta['HORA_DE_INICIO_DE_LA_REUNION'],
    'HORA_DE_TERMINACION': acta['HORA_DE_TERMINACION'],
    'CARGO': acta['CARGO'],
    'ORGANO1': acta['ORGANO1'],
    'ORGANO2': acta['ORGANO2'],
    'ORGANO3': acta['ORGANO3'],
    'ORGANO4': acta['ORGANO4'],
    'ORGANO5': acta['ORGANO5'],
    'ORGANO6': acta['ORGANO6'],
    'ORGANO7': acta['ORGANO7'],
    'ORGANO8': acta['ORGANO8'],
    'ORGANO9': acta['ORGANO9'],
    'ORGANO10': acta['ORGANO10'],
    'NOMBRE1': acta['NOMBRE1'],
    'NOMBRE2': acta['NOMBRE2'],
    'NOMBRE3': acta['NOMBRE3'],
    'NOMBRE4': acta['NOMBRE4'],
    'NOMBRE5': acta['NOMBRE5'],
    'NOMBRE6': acta['NOMBRE6'],
    'NOMBRE7': acta['NOMBRE7'],
    'NOMBRE8': acta['NOMBRE8'],
    'NOMBRE9': acta['NOMBRE9'],
    'NOMBRE10': acta['NOMBRE10'],
    'OBJETIVO': acta['OBJETIVO'],
    'TEMA1': acta['TEMA1'],
    'TEMA2': acta['TEMA2'],
    'TEMA3': acta['TEMA3'],
    'TEMA4': acta['TEMA4'],
    'TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA': acta['TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA'],
    'TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR': acta['TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR'],
    'TEXTO_DEL_TEMA1': acta['TEXTO_DEL_TEMA1'],
    'TEXTO_DEL_TEMA2': acta['TEXTO_DEL_TEMA2'],
    'TEXTO_DEL_TEMA3': acta['TEXTO_DEL_TEMA3'],
    'TEXTO_DEL_TEMA4': acta['TEXTO_DEL_TEMA4'],
    'TEXTO_DE_PROPOSICIONES_Y_VARIOS': acta['TEXTO_DE_PROPOSICIONES_Y_VARIOS'],
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Configurar anchos de columna
  const colWidths = [
    { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 25 },
    { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 },
    { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 },
    { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
    { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
    { wch: 40 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
    { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 50 },
    { wch: 50 }, { wch: 50 },
  ];
  worksheet['!cols'] = colWidths;

  const range = XLSX.utils.decode_range(worksheet['!ref']!);
  
  // Aplicar estilos a los encabezados
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: '4B5563' } },
        fontColor: { rgb: 'FFFFFF' },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      };
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Actas');

  const fileName = `actas_${anoLabel || new Date().getFullYear()}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Importa actas desde un archivo Excel
 */
export const importActasFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false
        }) as any[][];

        const headers = rows[0].map((h: string) =>
          h?.toString().trim().toUpperCase()
        );

        const dataRows = rows.slice(1);

        const result = dataRows.map((row) => {
          const obj: any = {};

          headers.forEach((header, index) => {
            const cellValue = row[index];
            obj[header] = cellValue?.toString().trim() || '';
          });

          return obj;
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
};
