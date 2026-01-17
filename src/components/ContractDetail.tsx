import { ArrowLeft, Pencil } from 'lucide-react';
import { Contrato } from '../lib/supabase';
import { formatCurrency } from '../utils/validations';

interface ContratoDetailProps {
  contrato: Contrato;
  onEdit: () => void;
  onBack: () => void;
}

export default function ContratoDetail({ contrato, onEdit, onBack }: ContratoDetailProps) {
  const DetailField = ({ label, value }: { label: string; value: string | number }) => (
    <div className="space-y-1 pb-3">
      <dt className="text-xs font-semibold text-gray-600 uppercase">{label}</dt>
      <dd className="text-base text-gray-900">{value || '-'}</dd>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1b6b2f]">Detalle del Contrato</h1>
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1b6b2f] text-white rounded-lg hover:bg-[#0d4620] transition-colors font-medium shadow-md"
            >
              <Pencil size={20} />
              Editar
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
            >
              <ArrowLeft size={20} />
              Volver
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Información General
            </h2>
            <DetailField label="N Contrato" value={contrato['N CONTRATO']} />
            <DetailField label="Tipo Contrato" value={contrato['TIPO CONTRATO']} />
            <DetailField label="Contratista" value={contrato['CONTRATISTA']} />
            <DetailField label="Contratante" value={contrato['CONTRATANTE']} />
            <DetailField label="NIT" value={contrato['NIT']} />
            <DetailField label="Cédula" value={contrato['CEDULA']} />
            <DetailField label="Dirección" value={contrato['DIRECCION']} />
            <DetailField label="Teléfono" value={contrato['TELEFONO']} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Datos Financieros
            </h2>
            <DetailField
              label="Valor"
              value={contrato['VALOR'] ? formatCurrency(contrato['VALOR']) : '-'}
            />
            <DetailField label="Rubro Presupuestal" value={contrato['RUBRO PRESUPUESTAL']} />
            <DetailField label="Disponibilidad Presupuestal" value={contrato['DISPONIBILIDAD PRESUPUESTAL']} />
            <DetailField label="RPC" value={contrato['RPC']} />
            <DetailField label="Vigencia" value={contrato['VIGENCIA']} />
            <DetailField label="Fuente de Financiación" value={contrato['FUENTE DE FINANCIACION']} />
            <DetailField label="Forma de Pago" value={contrato['FORMA DE PAGO']} />
            <DetailField label="Régimen" value={contrato['REGIMEN']} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Fechas</h2>
            <DetailField label="Fecha Inicio" value={contrato['FECHA INICIO']} />
            <DetailField label="Fecha Fin" value={contrato['FECHA FIN']} />
            <DetailField label="Plazo" value={contrato['PLAZO']} />
            <DetailField label="Fecha Expedición" value={contrato['FECHA EXPEDICIÓN']} />
            <DetailField label="Fecha Selección Contratista" value={contrato['FECHA SELECCION CONTRATISTA']} />
            <DetailField label="Fecha Comunicación Contratista" value={contrato['FECHA COMUNICACIÓN CONTRATISTA']} />
            <DetailField label="Fecha Factura" value={contrato['FECHA FACTURA']} />
            <DetailField label="Fecha Liquidación" value={contrato['FECHA LIQUIDACION']} />
            <DetailField label="Acta Cierre" value={contrato['ACTA CIERRE']} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Descripciones
            </h2>
            <div className="space-y-4">
              <div>
                <dt className="text-xs font-semibold text-gray-600 uppercase mb-2">Objetivo</dt>
                <dd className="text-sm text-gray-900 whitespace-pre-wrap">
                  {contrato['OBJETIVO'] || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-600 uppercase mb-2">
                  Descripción de la Necesidad
                </dt>
                <dd className="text-sm text-gray-900 whitespace-pre-wrap">
                  {contrato['DESCRIPCION DE LA NECESIDAD'] || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-600 uppercase mb-2">
                  Valor en Letras
                </dt>
                <dd className="text-sm text-gray-900">
                  {contrato['VALOR CONTRATO LETRAS'] || '-'}
                </dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Acuerdos y Control
            </h2>
            <DetailField label="Acuerdo Presupuesto" value={contrato['ACUERDO PRESUPUESTO']} />
          </div>
        </div>
      </div>
    </div>
  );
}
