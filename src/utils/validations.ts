export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 7;
};

export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone;
};

export const calculatePlazo = (
  fechaInicio: string,
  fechaFin: string
): string => {
  if (!fechaInicio || !fechaFin) return '';

  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return '';

  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;

  if (months > 0 && days > 0) {
    return `${months} meses y ${days} días`;
  } else if (months > 0) {
    return `${months} mes${months > 1 ? 'es' : ''}`;
  } else {
    return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }
};

const numberToWords = (num: number): string => {
  if (num === 0) return 'cero pesos';

  const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const hundredsMap = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  const fixUno = (text: string) =>
    text
      .replace(/uno$/, 'un')
      .replace(/veintiuno$/, 'veintiún')
      .replace(/ y uno$/, ' y un');

  let words = '';
  let scaleIndex = 0;

  while (num > 0) {
    const group = num % 1000;

    if (group !== 0) {
      let groupWords = '';

      const hundreds = Math.floor(group / 100);
      const remainder = group % 100;

      if (hundreds > 0) {
        groupWords = hundreds === 1 && remainder === 0 ? 'cien' : hundredsMap[hundreds];
      }

      if (remainder >= 10 && remainder < 20) {
        groupWords += (groupWords ? ' ' : '') + teens[remainder - 10];
      } else {
        const ten = Math.floor(remainder / 10);
        const unit = remainder % 10;

        if (ten > 0) {
          groupWords += (groupWords ? ' ' : '') + tens[ten];
          if (unit > 0) groupWords += ' y ' + units[unit];
        } else if (unit > 0) {
          groupWords += (groupWords ? ' ' : '') + units[unit];
        }
      }

      // Escalas
      if (scaleIndex === 1) {
        if (group === 1) {
          groupWords = 'mil';
        } else {
          groupWords = fixUno(groupWords) + ' mil';
        }
      } 
      else if (scaleIndex === 2) {
        groupWords = group === 1
          ? 'un millón'
          : fixUno(groupWords) + ' millones';
      }

      words = groupWords + (words ? ' ' + words : '');
    }

    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return `${words.trim()} pesos`;
};





export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return '$ 0';

  const formatted = Math.floor(numValue).toLocaleString('es-CO');
  return `$ ${formatted}`;
};

export const cleanMoneyInput = (value: string): number | null => {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned === '') return null;

  return Number(cleaned);
};


export const valorContratoEnLetras = (valor: number): string => {
  if (valor <= 0) return '';

  const pesos = Math.floor(valor);
  const words = numberToWords(pesos);

  const formattedValue = formatCurrency(valor);

  return `${formattedValue} (${words})`;
};

/**
 * Convierte una fecha ISO (del input date) a formato legible español
 * Entrada: "2026-01-04" o "2026-01-04T00:00:00"
 * Salida: "4 de enero de 2026"
 */
export const formatDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return '';

  try {
    // Si ya está en formato de texto legible, devolver tal cual
    if (dateStr.includes(' de ')) {
      return dateStr;
    }

    const date = new Date(dateStr);
    
    // Validar que la fecha es válida
    if (isNaN(date.getTime())) {
      return '';
    }

    const day = date.getDate();
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} de ${year}`;
  } catch {
    return '';
  }
};

/**
 * Convierte una fecha legible español a formato ISO para input date
 * Entrada: "4 de enero de 2026"
 * Salida: "2026-01-04"
 */
export const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';

  // Si ya está en formato de texto legible "DD de MMMM de YYYY"
  if (/^\d{1,2}\s+de\s+/.test(dateStr)) {
    try {
      const months: { [key: string]: number } = {
        enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
        julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
      };

      const parts = dateStr.split(' de ');
      if (parts.length === 3) {
        const day = parseInt(parts[0].trim());
        const monthName = parts[1].trim().toLowerCase();
        const year = parseInt(parts[2].trim());

        const monthIndex = months[monthName];
        if (monthIndex !== undefined) {
          const date = new Date(year, monthIndex, day);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        }
      }
    } catch {
      return '';
    }
  }

  // Si es formato ISO, retornar directamente
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split('T')[0];
  }

  return '';
};