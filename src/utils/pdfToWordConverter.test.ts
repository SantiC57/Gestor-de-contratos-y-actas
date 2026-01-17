/**
 * Pruebas de extracción de tablas PDF
 * Ejecutar con: npx tsx src/utils/pdfToWordConverter.test.ts
 */

// @ts-ignore - usar versión legacy para Node.js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// No necesita worker en Node.js con legacy build

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
  centerX: number;
  headerText: string;
}

interface ExtractedTable {
  columns: Column[];
  headers: string[];
  rows: string[][];
}

interface TestResult {
  pdfName: string;
  success: boolean;
  columnsDetected: number;
  rowsExtracted: number;
  expectedColumns?: number;
  expectedRows?: number;
  headers: string[];
  issues: string[];
  sampleRows: string[][];
}

// ============ CONSTANTES ============

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

const END_KEYWORDS = [
  'subtotal', 'sub-total', 'sub total',
  'total factura', 'total a pagar', 'total neto', 'total bruto',
  'base gravable', 'base iva',
  'observaciones', 'notas:',
  'forma de pago', 'condiciones de pago',
  'banco:', 'cuenta:',
  'firma', 'elaborado por', 'recibido por',
  'son:', 'valor en letras', 'moneda:'
];

// Expectativas basadas en las imágenes proporcionadas
const EXPECTED_RESULTS: Record<string, { columns: number; minRows: number; maxRows: number }> = {
  'PDF-901104869-HCON42 INSTITUCION EDUCATIVA RURAL JUAN TAMAYO.pdf': { columns: 13, minRows: 1, maxRows: 3 }, // Tabla con sub-columnas en IMPUESTOS
  'Factura de venta electrónica ML814 (1).pdf': { columns: 7, minRows: 21, maxRows: 21 }, // Exactamente 21 filas
  'FSGP 153 INSTITUCION EDUCATIVA RURAL JUAN TAMAYO.pdf': { columns: 8, minRows: 18, maxRows: 22 },
  '13. FACTURA AB-17745 IE JUAN TAMAYO.pdf': { columns: 7, minRows: 55, maxRows: 70 },
};

// ============ FUNCIONES DE EXTRACCIÓN ============

async function extractPDFLines(pdfPath: string): Promise<PDFLine[]> {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const allLines: PDFLine[] = [];
  const LINE_TOLERANCE = 5;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

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

function isHeaderLine(line: PDFLine): boolean {
  const lowerText = line.text.toLowerCase();
  const keywordCount = HEADER_KEYWORDS.filter(kw => lowerText.includes(kw)).length;
  return keywordCount >= 2 && line.items.length >= 2;
}

function isHeaderContinuation(line: PDFLine): boolean {
  const lowerText = line.text.toLowerCase();
  const continuationWords = ['medida', 'unitario', 'cargo', 'total', 'impto'];
  return continuationWords.some(word => lowerText.includes(word));
}

function isEndLine(line: PDFLine): boolean {
  const lowerText = line.text.toLowerCase();
  return END_KEYWORDS.some(kw => lowerText.includes(kw));
}

function findColumnIndex(x: number, columns: Column[]): number {
  for (let i = 0; i < columns.length; i++) {
    if (x >= columns[i].startX && x < columns[i].endX) {
      return i;
    }
  }
  return columns.length - 1;
}

function detectColumns(headerLines: PDFLine[], _dataLines: PDFLine[]): Column[] {
  const allHeaderItems: TextItem[] = [];
  for (const line of headerLines) {
    allHeaderItems.push(...line.items);
  }
  allHeaderItems.sort((a, b) => a.x - b.x);
  
  if (allHeaderItems.length === 0) return [];
  
  const gaps: number[] = [];
  for (let i = 1; i < allHeaderItems.length; i++) {
    const gap = allHeaderItems[i].x - (allHeaderItems[i-1].x + allHeaderItems[i-1].width);
    if (gap > 0) gaps.push(gap);
  }
  
  let gapThreshold = 5;
  if (gaps.length > 0) {
    gaps.sort((a, b) => a - b);
    const baseGap = gaps[Math.floor(gaps.length * 0.3)] || gaps[0];
    gapThreshold = Math.max(5, baseGap * 0.5);
  }
  
  const columnGroups: TextItem[][] = [[allHeaderItems[0]]];
  
  for (let i = 1; i < allHeaderItems.length; i++) {
    const item = allHeaderItems[i];
    const lastGroup = columnGroups[columnGroups.length - 1];
    const lastItem = lastGroup[lastGroup.length - 1];
    
    const gap = item.x - (lastItem.x + lastItem.width);
    
    if (gap <= gapThreshold) {
      lastGroup.push(item);
    } else {
      columnGroups.push([item]);
    }
  }
  
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

function assignToColumns(line: PDFLine, columns: Column[]): string[] {
  const row: string[] = new Array(columns.length).fill('');
  
  for (const item of [...line.items].sort((a, b) => a.x - b.x)) {
    const itemCenter = item.x + item.width / 2;
    const colIdx = findColumnIndex(itemCenter, columns);
    row[colIdx] = row[colIdx] ? row[colIdx] + ' ' + item.text : item.text;
  }
  
  return row;
}

function isDataRow(line: PDFLine, columns: Column[]): boolean {
  if (line.items.length < 1 || line.text.trim().length < 3) return false;
  if (isHeaderLine(line) || isEndLine(line)) return false;
  if (!/\d/.test(line.text)) return false;
  
  const usedColumns = new Set<number>();
  for (const item of line.items) {
    usedColumns.add(findColumnIndex(item.x + item.width / 2, columns));
  }
  
  return usedColumns.size >= 2;
}

function extractTable(lines: PDFLine[]): ExtractedTable | null {
  const headerIndex = lines.findIndex(line => isHeaderLine(line));
  if (headerIndex === -1) return null;
  
  const headerLines: PDFLine[] = [lines[headerIndex]];
  let dataStartIndex = headerIndex + 1;
  
  if (headerIndex + 1 < lines.length && isHeaderContinuation(lines[headerIndex + 1])) {
    headerLines.push(lines[headerIndex + 1]);
    dataStartIndex = headerIndex + 2;
  }
  
  const potentialDataLines: PDFLine[] = [];
  for (let i = dataStartIndex; i < Math.min(dataStartIndex + 10, lines.length); i++) {
    const line = lines[i];
    if (isEndLine(line)) break;
    if (line.items.length >= 2 && /\d/.test(line.text)) {
      potentialDataLines.push(line);
    }
  }
  
  const columns = detectColumns(headerLines, potentialDataLines);
  const headers = columns.map(c => c.headerText.trim());
  
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

// ============ PRUEBAS ============

async function testPDF(pdfPath: string): Promise<TestResult> {
  const pdfName = path.basename(pdfPath);
  const issues: string[] = [];
  
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Probando: ${pdfName}`);
    console.log('='.repeat(60));
    
    const lines = await extractPDFLines(pdfPath);
    console.log(`   Líneas extraídas del PDF: ${lines.length}`);
    
    const table = extractTable(lines);
    
    if (!table) {
      return {
        pdfName,
        success: false,
        columnsDetected: 0,
        rowsExtracted: 0,
        headers: [],
        issues: ['No se encontró tabla en el PDF'],
        sampleRows: []
      };
    }
    
    const expected = EXPECTED_RESULTS[pdfName];
    
    // Verificar columnas
    console.log(`\n📊 COLUMNAS DETECTADAS (${table.headers.length}):`);
    table.headers.forEach((h, i) => console.log(`   ${i + 1}. "${h}"`));
    
    if (expected) {
      if (table.headers.length !== expected.columns) {
        issues.push(`❌ Columnas: esperadas ${expected.columns}, detectadas ${table.headers.length}`);
      } else {
        console.log(`   ✅ Columnas correctas (${expected.columns})`);
      }
    }
    
    // Verificar filas
    console.log(`\n📋 FILAS EXTRAÍDAS: ${table.rows.length}`);
    
    if (expected) {
      if (table.rows.length < expected.minRows) {
        issues.push(`❌ Filas: mínimo esperado ${expected.minRows}, extraídas ${table.rows.length}`);
      } else if (table.rows.length > expected.maxRows) {
        issues.push(`⚠️ Filas: máximo esperado ${expected.maxRows}, extraídas ${table.rows.length}`);
      } else {
        console.log(`   ✅ Filas dentro del rango esperado (${expected.minRows}-${expected.maxRows})`);
      }
    }
    
    // Mostrar primeras 3 filas
    console.log(`\n📝 MUESTRA DE DATOS (primeras 5 filas):`);
    const sampleRows = table.rows.slice(0, 5);
    sampleRows.forEach((row, i) => {
      console.log(`   Fila ${i + 1}: ${row.map((c, j) => `${table.headers[j] || 'Col' + j}: "${c}"`).join(' | ')}`);
    });
    
    // Mostrar TODAS las filas para ML814
    if (pdfName.includes('ML814')) {
      console.log(`\n📋 TODAS LAS FILAS DE ML814:`);
      table.rows.forEach((row, i) => {
        const id = row[0] || '?';
        const item = row[1] || '?';
        console.log(`   ${i + 1}. ID=${id}, Item="${item}"`);
      });
      
      // Buscar líneas que contengan "JABON" o "REY" para debug
      console.log(`\n🔍 DEBUG - Líneas con JABON o REY en el PDF:`);
      lines.forEach((line, i) => {
        if (line.text.toLowerCase().includes('jabon') || line.text.toLowerCase().includes('rey')) {
          console.log(`   Línea ${i}: "${line.text}" (items: ${line.items.length})`);
          
          // Verificar si pasa isDataRow
          const hasNumber = /\d/.test(line.text);
          const usedCols = new Set<number>();
          for (const item of line.items) {
            usedCols.add(findColumnIndex(item.x + item.width / 2, table.columns));
          }
          const isHeader = isHeaderLine(line);
          const isEnd = isEndLine(line);
          
          console.log(`      hasNumber=${hasNumber}, usedCols=${usedCols.size}, isHeader=${isHeader}, isEnd=${isEnd}`);
        }
      });
    }
    
    // Verificar filas vacías o incompletas
    const emptyRowCount = table.rows.filter(row => 
      row.filter(cell => cell.trim()).length < 2
    ).length;
    
    if (emptyRowCount > 0) {
      issues.push(`⚠️ ${emptyRowCount} filas con menos de 2 celdas con datos`);
    }
    
    // Verificar celdas desbordadas (texto muy largo que podría ser de múltiples columnas)
    const overflowCells = table.rows.filter(row =>
      row.some((cell, i) => {
        // Si no es la columna de descripción y tiene más de 50 caracteres, podría ser overflow
        const header = table.headers[i]?.toLowerCase() || '';
        const isDescCol = header.includes('desc') || header.includes('item') || header.includes('concepto');
        return !isDescCol && cell.length > 50;
      })
    ).length;
    
    if (overflowCells > 0) {
      issues.push(`⚠️ ${overflowCells} filas con posible desbordamiento de columnas`);
    }
    
    // Resumen
    console.log(`\n📈 RESUMEN:`);
    if (issues.length === 0) {
      console.log(`   ✅ TODO CORRECTO`);
    } else {
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    return {
      pdfName,
      success: issues.filter(i => i.startsWith('❌')).length === 0,
      columnsDetected: table.headers.length,
      rowsExtracted: table.rows.length,
      expectedColumns: expected?.columns,
      expectedRows: expected ? (expected.minRows + expected.maxRows) / 2 : undefined,
      headers: table.headers,
      issues,
      sampleRows
    };
    
  } catch (error) {
    return {
      pdfName,
      success: false,
      columnsDetected: 0,
      rowsExtracted: 0,
      headers: [],
      issues: [`Error: ${error instanceof Error ? error.message : 'Desconocido'}`],
      sampleRows: []
    };
  }
}

async function runAllTests(): Promise<void> {
  const projectDir = path.resolve(__dirname, '../..');
  const pdfFiles = Object.keys(EXPECTED_RESULTS);
  
  console.log('\n' + '█'.repeat(60));
  console.log('█  PRUEBAS DE EXTRACCIÓN PDF → WORD');
  console.log('█'.repeat(60));
  
  const results: TestResult[] = [];
  
  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(projectDir, pdfFile);
    if (fs.existsSync(pdfPath)) {
      const result = await testPDF(pdfPath);
      results.push(result);
    } else {
      console.log(`\n⚠️ Archivo no encontrado: ${pdfFile}`);
    }
  }
  
  // Resumen final
  console.log('\n' + '█'.repeat(60));
  console.log('█  RESUMEN FINAL');
  console.log('█'.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n📊 Resultados: ${passed}/${total} PDFs procesados correctamente\n`);
  
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.pdfName}`);
    console.log(`   Columnas: ${r.columnsDetected}${r.expectedColumns ? ` (esperadas: ${r.expectedColumns})` : ''}`);
    console.log(`   Filas: ${r.rowsExtracted}`);
    if (r.issues.length > 0) {
      r.issues.forEach(issue => console.log(`   ${issue}`));
    }
    console.log('');
  });
  
  if (passed < total) {
    console.log('❌ ALGUNAS PRUEBAS FALLARON');
    process.exit(1);
  } else {
    console.log('✅ TODAS LAS PRUEBAS PASARON');
  }
}

// Ejecutar
runAllTests().catch(console.error);
