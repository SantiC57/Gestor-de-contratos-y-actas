import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, TextRun } from 'docx';

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ============ INTERFACES ============

interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PDFLine {
  y: number;
  items: TextItem[];
  text: string;
}

interface Column {
  startX: number;
  endX: number;
  centerX: number; // Nuevo: centro de la columna para mejor asignación
  headerText: string;
}

interface ExtractedTable {
  columns: Column[];
  headers: string[];
  rows: string[][];
}

// ============ CONSTANTES ============

// Palabras clave que indican encabezado de tabla (más específicas para evitar falsos positivos)
const HEADER_KEYWORDS = [
  'descripcion', 'descripción', 
  'cantidad', 
  'precio', 
  'valor unitario', 'vr unitario', 'vr. unitario',
  'valor total', 'vr total', 'vr. total',
  'codigo', 'código',
  'item', 'ítem', 
  'impuesto', 'impto',
  'subtotal',
  'detalle'
];

// Palabras que indican fin de tabla
const END_KEYWORDS = [
  'subtotal', 'sub-total', 'sub total',
  'total factura', 'total a pagar', 'total neto', 'total bruto',
  'base gravable', 'base iva',
  'observaciones', 'notas:',
  'forma de pago', 'condiciones de pago',
  'banco:', 'cuenta:',
  'firma', 'elaborado por', 'recibido por',
  'son:', 'valor en letras'
];

// ============ EXTRACCIÓN DE PDF ============

/**
 * Extrae líneas del PDF con posiciones exactas
 */
async function extractPDFLines(file: File): Promise<PDFLine[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allLines: PDFLine[] = [];
  const LINE_TOLERANCE = 5; // Tolerancia para agrupar items en la misma línea

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    // Extraer items de texto con posiciones
    const items: TextItem[] = [];
    for (const item of textContent.items) {
      if ('str' in item && item.str.trim() && 'transform' in item) {
        items.push({
          text: item.str,
          x: item.transform[4],
          y: viewport.height - item.transform[5],
          width: item.width || 0,
          height: item.height || 10,
        });
      }
    }

    // Agrupar por líneas (coordenada Y similar)
    const lineMap = new Map<number, TextItem[]>();

    for (const item of items) {
      let foundLine = false;
      for (const [lineY, lineItems] of lineMap) {
        if (Math.abs(item.y - lineY) <= LINE_TOLERANCE) {
          lineItems.push(item);
          foundLine = true;
          break;
        }
      }
      if (!foundLine) {
        lineMap.set(item.y, [item]);
      }
    }

    // Convertir a array ordenado por Y
    Array.from(lineMap.keys())
      .sort((a, b) => a - b)
      .forEach(y => {
        const lineItems = lineMap.get(y)!.sort((a, b) => a.x - b.x);
        allLines.push({
          y,
          items: lineItems,
          text: lineItems.map(i => i.text).join(' ')
        });
      });
  }

  return allLines;
}

// ============ DETECCIÓN DE LÍNEAS ESPECIALES ============

/**
 * Detecta si una línea es encabezado de tabla
 */
function isHeaderLine(line: PDFLine): boolean {
  const lowerText = line.text.toLowerCase();
  const keywordCount = HEADER_KEYWORDS.filter(kw => lowerText.includes(kw)).length;
  return keywordCount >= 2 && line.items.length >= 2;
}

/**
 * Detecta si una línea es continuación del encabezado (segunda línea)
 */
function isHeaderContinuation(line: PDFLine): boolean {
  const lowerText = line.text.toLowerCase();
  const continuationWords = ['medida', 'unitario', 'cargo', 'total'];
  return continuationWords.some(word => lowerText.includes(word));
}

/**
 * Detecta si una línea indica fin de tabla
 */
function isEndLine(line: PDFLine): boolean {
  const lowerText = line.text.toLowerCase();
  return END_KEYWORDS.some(kw => lowerText.includes(kw));
}

// ============ DETECCIÓN DE COLUMNAS ============

/**
 * Encuentra el índice de la columna para una posición X dada
 */
function findColumnIndex(x: number, columns: Column[]): number {
  for (let i = 0; i < columns.length; i++) {
    if (x >= columns[i].startX && x < columns[i].endX) {
      return i;
    }
  }
  return columns.length - 1;
}

/**
 * Detecta columnas basándose ÚNICAMENTE en el encabezado.
 * Cada item separado del encabezado es una columna.
 * El gap se determina por el ancho promedio del texto.
 */
function detectColumns(headerLines: PDFLine[], _dataLines: PDFLine[]): Column[] {
  // Combinar items del encabezado
  const allHeaderItems: TextItem[] = [];
  for (const line of headerLines) {
    allHeaderItems.push(...line.items);
  }
  allHeaderItems.sort((a, b) => a.x - b.x);
  
  if (allHeaderItems.length === 0) return [];
  
  // Calcular el gap promedio entre items del header
  const gaps: number[] = [];
  for (let i = 1; i < allHeaderItems.length; i++) {
    const gap = allHeaderItems[i].x - (allHeaderItems[i-1].x + allHeaderItems[i-1].width);
    if (gap > 0) gaps.push(gap);
  }
  
  // El threshold es: si el gap es mayor al gap promedio * 0.3, es nueva columna
  // Esto permite separar items que están claramente en columnas diferentes
  let gapThreshold = 5; // Mínimo
  if (gaps.length > 0) {
    gaps.sort((a, b) => a - b);
    // Usar el percentil 30 de los gaps como threshold base
    const baseGap = gaps[Math.floor(gaps.length * 0.3)] || gaps[0];
    gapThreshold = Math.max(5, baseGap * 0.5);
  }
  
  // Agrupar items en columnas
  const columnGroups: TextItem[][] = [[allHeaderItems[0]]];
  
  for (let i = 1; i < allHeaderItems.length; i++) {
    const item = allHeaderItems[i];
    const lastGroup = columnGroups[columnGroups.length - 1];
    const lastItem = lastGroup[lastGroup.length - 1];
    
    const gap = item.x - (lastItem.x + lastItem.width);
    
    if (gap <= gapThreshold) {
      // Mismo grupo (parte de la misma columna de encabezado)
      lastGroup.push(item);
    } else {
      // Nueva columna
      columnGroups.push([item]);
    }
  }
  
  // Crear columnas con rangos apropiados
  const columns: Column[] = [];
  
  for (let i = 0; i < columnGroups.length; i++) {
    const group = columnGroups[i];
    const minX = Math.min(...group.map(it => it.x));
    const maxX = Math.max(...group.map(it => it.x + it.width));
    const headerText = group.map(it => it.text).join(' ');
    
    let startX: number;
    let endX: number;
    
    if (i === 0) {
      startX = 0;
    } else {
      const prevGroup = columnGroups[i - 1];
      const prevMaxX = Math.max(...prevGroup.map(it => it.x + it.width));
      startX = (prevMaxX + minX) / 2;
    }
    
    if (i === columnGroups.length - 1) {
      endX = 9999;
    } else {
      const nextGroup = columnGroups[i + 1];
      const nextMinX = Math.min(...nextGroup.map(it => it.x));
      endX = (maxX + nextMinX) / 2;
    }
    
    columns.push({
      startX,
      endX,
      centerX: (minX + maxX) / 2,
      headerText
    });
  }
  
  return columns;
}

// ============ ASIGNACIÓN DE DATOS A COLUMNAS ============

/**
 * Asigna items de una línea a las columnas detectadas.
 * PURAMENTE VISUAL: cada item va a la columna donde cae su posición X.
 */
function assignToColumns(line: PDFLine, columns: Column[]): string[] {
  const row: string[] = new Array(columns.length).fill('');
  
  for (const item of [...line.items].sort((a, b) => a.x - b.x)) {
    const itemCenter = item.x + item.width / 2;
    const colIdx = findColumnIndex(itemCenter, columns);
    row[colIdx] = row[colIdx] ? row[colIdx] + ' ' + item.text : item.text;
  }
  
  return row;
}

/**
 * Detecta si una línea parece ser fila de datos de tabla.
 */
function isDataRow(line: PDFLine, columns: Column[]): boolean {
  // Validaciones básicas
  if (line.items.length < 1 || line.text.trim().length < 3) return false;
  if (isHeaderLine(line) || isEndLine(line)) return false;
  
  // Debe tener al menos un número (típico de filas de datos)
  if (!/\d/.test(line.text)) return false;
  
  // Debe ocupar al menos 2 columnas diferentes
  const usedColumns = new Set<number>();
  for (const item of line.items) {
    usedColumns.add(findColumnIndex(item.x + item.width / 2, columns));
  }
  
  return usedColumns.size >= 2;
}

// ============ EXTRACCIÓN DE TABLA ============

/**
 * Extrae la tabla de productos del PDF.
 * COPIA VISUAL: respeta el orden exacto del PDF.
 */
function extractTable(lines: PDFLine[]): ExtractedTable | null {
  // 1. Buscar línea de encabezado
  const headerIndex = lines.findIndex(line => isHeaderLine(line));
  if (headerIndex === -1) return null;
  
  // 2. Recolectar líneas de encabezado (puede haber 2 líneas)
  const headerLines: PDFLine[] = [lines[headerIndex]];
  let dataStartIndex = headerIndex + 1;
  
  if (headerIndex + 1 < lines.length && isHeaderContinuation(lines[headerIndex + 1])) {
    headerLines.push(lines[headerIndex + 1]);
    dataStartIndex = headerIndex + 2;
  }
  
  // 3. Recolectar filas de datos potenciales para análisis
  const potentialDataLines: PDFLine[] = [];
  for (let i = dataStartIndex; i < Math.min(dataStartIndex + 10, lines.length); i++) {
    const line = lines[i];
    if (isEndLine(line)) break;
    if (line.items.length >= 2 && /\d/.test(line.text)) {
      potentialDataLines.push(line);
    }
  }
  
  // 4. Detectar columnas
  const columns = detectColumns(headerLines, potentialDataLines);
  const headers = columns.map(c => c.headerText.trim());
  
  // 5. Extraer filas hasta fin de tabla
  const rows: string[][] = [];
  let consecutiveInvalid = 0;
  const MAX_INVALID = 5;
  
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i];
    
    if (isEndLine(line)) break;
    
    if (isDataRow(line, columns)) {
      rows.push(assignToColumns(line, columns));
      consecutiveInvalid = 0;
    } else {
      consecutiveInvalid++;
      if (consecutiveInvalid > MAX_INVALID) break;
    }
  }
  
  return { columns, headers, rows };
}

// ============ GENERACIÓN DE WORD ============

/**
 * Crea una celda de tabla Word
 */
function createTableCell(text: string, isHeader: boolean): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '',
            bold: isHeader,
            size: isHeader ? 20 : 18,
          }),
        ],
      }),
    ],
    ...(isHeader && { shading: { fill: 'D9E2F3' } }),
  });
}

/**
 * Crea documento Word con tabla real
 */
function createWordDocument(table: ExtractedTable): Document {
  const borderStyle = { style: BorderStyle.SINGLE, size: 1 };
  
  const wordTable = new Table({
    rows: [
      // Fila de encabezados
      new TableRow({
        children: table.headers.map(h => createTableCell(h, true)),
      }),
      // Filas de datos
      ...table.rows.map(row => 
        new TableRow({
          children: row.map(cell => createTableCell(cell, false)),
        })
      ),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
      insideHorizontal: borderStyle,
      insideVertical: borderStyle,
    },
  });
  
  return new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
      },
      children: [wordTable],
    }],
  });
}

// ============ API PÚBLICA ============

/**
 * Convierte PDF a Word extrayendo la tabla de productos
 */
export async function convertPDFToWord(file: File): Promise<{
  success: boolean;
  blob?: Blob;
  text: string;
  headers?: string[];
  rowCount?: number;
  error?: string;
}> {
  try {
    const lines = await extractPDFLines(file);
    const fullText = lines.map(l => l.text).join('\n');
    const table = extractTable(lines);
    
    if (!table || table.rows.length === 0) {
      return {
        success: false,
        text: fullText,
        error: 'No se encontró tabla de productos en el PDF',
      };
    }
    
    const doc = createWordDocument(table);
    const blob = await Packer.toBlob(doc);
    
    // Preview con información de debug
    const tablePreview = [
      `COLUMNAS DETECTADAS (${table.headers.length}): ${table.headers.join(' | ')}`,
      '',
      `FILAS EXTRAÍDAS: ${table.rows.length}`,
      '',
      '--- TABLA ---',
      table.headers.join('\t'),
      ...table.rows.map(r => r.join('\t'))
    ].join('\n');
    
    return {
      success: true,
      blob,
      text: tablePreview,
      headers: table.headers,
      rowCount: table.rows.length,
    };
  } catch (error) {
    console.error('Error en conversión:', error);
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Extrae texto del PDF para preview
 */
export async function extractPDFText(file: File): Promise<string> {
  try {
    const lines = await extractPDFLines(file);
    return lines.map(l => l.text).join('\n');
  } catch {
    return 'Error al extraer texto';
  }
}
