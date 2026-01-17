import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Contrato, Ano } from '../lib/supabase';
import {
  validatePhone,
  calculatePlazo,
  valorContratoEnLetras,
  cleanMoneyInput,
  formatDateForDisplay,
  formatDateForInput,
} from '../utils/validations';

interface ContractFormProps {
  contrato?: Contrato;
  year: Ano;
  onSave: (contrato: Omit<Contrato, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isEditing: boolean;
  nextContractNumber: number;
}

export default function ContractForm({
  contrato,
  year,
  onSave,
  onCancel,
  isEditing,
  nextContractNumber,
}: ContractFormProps) {
  const [formData, setFormData] = useState<Omit<Contrato, 'id' | 'created_at' | 'updated_at'>>({
    ano_id: year.id!,
    'N CONTRATO': '',
    'TIPO CONTRATO': '',
    'CONTRATISTA': '',
    'CONTRATANTE': '',
    'NIT': '',
    'OBJETIVO': '',
    'DESCRIPCION DE LA NECESIDAD': '',
    'VALOR': 0,
    'FECHA INICIO': '',
    'FECHA FIN': '',
    'PLAZO': '',
    'RUBRO PRESUPUESTAL': '',
    'DISPONIBILIDAD PRESUPUESTAL': '',
    'RPC': '',
    'VIGENCIA': '',
    'VALOR CONTRATO LETRAS': '',
    'FECHA EXPEDICIÓN': '',
    'FUENTE DE FINANCIACION': '',
    'FORMA DE PAGO': '',
    'REGIMEN': '',
    'CEDULA': '',
    'DIRECCION': '',
    'TELEFONO': '',
    'FECHA SELECCION CONTRATISTA': '',
    'FECHA COMUNICACIÓN CONTRATISTA': '',
    'FECHA FACTURA': '',
    'FECHA LIQUIDACION': '',
    'ACUERDO PRESUPUESTO': '',
    'ACTA CIERRE': '',
  });

  useEffect(() => {
    if (contrato) {
      setFormData(contrato);
    } else {
      setFormData((prev) => ({
        ...prev,
        'N CONTRATO': `CON-${String(nextContractNumber).padStart(2, '0')}-${year.ano}`,
      }));
    }
  }, [contrato, nextContractNumber, year]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData['N CONTRATO'] || !formData['TIPO CONTRATO'] || !formData['CONTRATISTA']) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    if (formData['TELEFONO'] && !validatePhone(formData['TELEFONO'])) {
      alert('El teléfono debe tener 7 o 10 dígitos');
      return;
    }

    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      const numValue = cleanMoneyInput(value);
      setFormData((prev) => {
        const updated = { ...prev, [name]: numValue };

        if (name === 'VALOR' && numValue !== null && numValue > 0) {
          updated['VALOR CONTRATO LETRAS'] = valorContratoEnLetras(numValue);
        }

        return updated;
      });
    } else {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };

        if (
          (name === 'FECHA INICIO' || name === 'FECHA FIN') &&
          prev['FECHA INICIO'] &&
          prev['FECHA FIN']
        ) {
          const inicio = name === 'FECHA INICIO' ? value : prev['FECHA INICIO'];
          const fin = name === 'FECHA FIN' ? value : prev['FECHA FIN'];
          updated['PLAZO'] = calculatePlazo(inicio, fin);
        }

        return updated;
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const displayDate = formatDateForDisplay(`${dateValue}T00:00:00`);
      setFormData((prev) => {
        const updated = { ...prev, [fieldName]: displayDate };

        if (
          (fieldName === 'FECHA INICIO' || fieldName === 'FECHA FIN') &&
          prev['FECHA INICIO'] &&
          prev['FECHA FIN']
        ) {
          const inicio = fieldName === 'FECHA INICIO' ? dateValue : formatDateForInput(prev['FECHA INICIO']);
          const fin = fieldName === 'FECHA FIN' ? dateValue : formatDateForInput(prev['FECHA FIN']);
          if (inicio && fin) {
            updated['PLAZO'] = calculatePlazo(inicio, fin);
          }
        }

        return updated;
      });
    }
  };

  const getDateInputValue = (displayDate: string): string => {
    return formatDateForInput(displayDate);
  };

  const inputClass = 'w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b6b2f] focus:border-[#1b6b2f] transition-all bg-white shadow-sm';
  const labelClass = 'block text-sm font-bold text-gray-800 mb-2';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}
          </h1>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Información General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Contrato <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="N CONTRATO"
                  value={formData['N CONTRATO']}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Contrato <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="TIPO CONTRATO"
                  value={formData['TIPO CONTRATO']}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contratista <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="CONTRATISTA"
                  value={formData['CONTRATISTA']}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contratante
                </label>
                <input
                  type="text"
                  name="CONTRATANTE"
                  value={formData['CONTRATANTE']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                <input
                  type="text"
                  name="NIT"
                  value={formData['NIT']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                <input
                  type="text"
                  name="CEDULA"
                  value={formData['CEDULA']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  name="DIRECCION"
                  value={formData['DIRECCION']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  name="TELEFONO"
                  value={formData['TELEFONO']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objetivo <span className="text-red-500">*</span>
              </label>
              <textarea
                name="OBJETIVO"
                value={formData['OBJETIVO']}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                name="DESCRIPCION DE LA NECESIDAD"
                value={formData['DESCRIPCION DE LA NECESIDAD']}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Datos Financieros
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Contrato <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="VALOR"
                  value={formData['VALOR']}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rubro Presupuestal
                </label>
                <input
                  type="text"
                  name="RUBRO PRESUPUESTAL"
                  value={formData['RUBRO PRESUPUESTAL']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CDP</label>
                <input
                  type="text"
                  name="DISPONIBILIDAD PRESUPUESTAL"
                  value={formData['DISPONIBILIDAD PRESUPUESTAL']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RPC</label>
                <input
                  type="text"
                  name="RPC"
                  value={formData['RPC']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuente de Financiación
                </label>
                <input
                  type="text"
                  name="FUENTE DE FINANCIACION"
                  value={formData['FUENTE DE FINANCIACION']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pago
                </label>
                <input
                  type="text"
                  name="FORMA DE PAGO"
                  value={formData['FORMA DE PAGO']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Régimen</label>
                <input
                  type="text"
                  name="REGIMEN"
                  value={formData['REGIMEN']}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor en Letras
              </label>
              <textarea
                name="VALOR CONTRATO LETRAS"
                value={formData['VALOR CONTRATO LETRAS']}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Fechas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={getDateInputValue(formData['FECHA INICIO'])}
                  onChange={(e) => handleDateChange(e, 'FECHA INICIO')}
                  required
                  className={inputClass}
                />
                {formData['FECHA INICIO'] && (
                  <p className="text-sm text-[#1b6b2f] font-medium mt-1">{formData['FECHA INICIO']}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Fecha de Fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={getDateInputValue(formData['FECHA FIN'])}
                  onChange={(e) => handleDateChange(e, 'FECHA FIN')}
                  required
                  className={inputClass}
                />
                {formData['FECHA FIN'] && (
                  <p className="text-sm text-[#1b6b2f] font-medium mt-1">{formData['FECHA FIN']}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Plazo</label>
                <input
                  type="text"
                  name="PLAZO"
                  value={formData['PLAZO']}
                  onChange={handleChange}
                  readOnly
                  className={`${inputClass} bg-gray-50`}
                />
                <p className="text-xs text-gray-500 mt-1">Se calcula automáticamente</p>
              </div>

              <div>
                <label className={labelClass}>Vigencia</label>
                <input
                  type="text"
                  name="VIGENCIA"
                  value={formData['VIGENCIA']}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Fecha de Expedición</label>
                <input
                  type="date"
                  value={getDateInputValue(formData['FECHA EXPEDICIÓN'])}
                  onChange={(e) => handleDateChange(e, 'FECHA EXPEDICIÓN')}
                  className={inputClass}
                />
                {formData['FECHA EXPEDICIÓN'] && (
                  <p className="text-sm text-[#1b6b2f] font-medium mt-1">{formData['FECHA EXPEDICIÓN']}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Fecha Selección Contratista</label>
                <input
                  type="date"
                  value={getDateInputValue(formData['FECHA SELECCION CONTRATISTA'])}
                  onChange={(e) => handleDateChange(e, 'FECHA SELECCION CONTRATISTA')}
                  className={inputClass}
                />
                {formData['FECHA SELECCION CONTRATISTA'] && (
                  <p className="text-sm text-[#1b6b2f] font-medium mt-1">{formData['FECHA SELECCION CONTRATISTA']}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Fecha Comunicación Contratista</label>
                <input
                  type="date"
                  value={getDateInputValue(formData['FECHA COMUNICACIÓN CONTRATISTA'])}
                  onChange={(e) => handleDateChange(e, 'FECHA COMUNICACIÓN CONTRATISTA')}
                  className={inputClass}
                />
                {formData['FECHA COMUNICACIÓN CONTRATISTA'] && (
                  <p className="text-sm text-[#1b6b2f] font-medium mt-1">{formData['FECHA COMUNICACIÓN CONTRATISTA']}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Fecha Factura</label>
                <input
                  type="date"
                  value={getDateInputValue(formData['FECHA FACTURA'])}
                  onChange={(e) => handleDateChange(e, 'FECHA FACTURA')}
                  className={inputClass}
                />
                {formData['FECHA FACTURA'] && (
                  <p className="text-sm text-[#1b6b2f] font-medium mt-1">{formData['FECHA FACTURA']}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Fecha Liquidación</label>
                <input
                  type="date"
                  value={getDateInputValue(formData['FECHA LIQUIDACION'])}
                  onChange={(e) => handleDateChange(e, 'FECHA LIQUIDACION')}
                  className={inputClass}
                />
                {formData['FECHA LIQUIDACION'] && (
                  <p className="text-sm text-[#1b6b2f] font-medium mt-1">{formData['FECHA LIQUIDACION']}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Acta de Cierre</label>
                <input
                  type="date"
                  value={getDateInputValue(formData['ACTA CIERRE'])}
                  onChange={(e) => handleDateChange(e, 'ACTA CIERRE')}
                  className={inputClass}
                />
                {formData['ACTA CIERRE'] && (
                  <p className="text-sm text-[#1b6b2f] font-medium mt-1">{formData['ACTA CIERRE']}</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Acuerdos</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Acuerdo Presupuesto</label>
                <input
                  type="text"
                  name="ACUERDO PRESUPUESTO"
                  value={formData['ACUERDO PRESUPUESTO']}
                  onChange={handleChange}
                  placeholder="Ej: 009, del 12 de noviembre de 2025"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1b6b2f] text-white rounded-lg hover:bg-[#0d4620] transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              <Save size={20} />
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
