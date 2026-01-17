import { ArrowLeft, Pencil } from 'lucide-react';
import { Acta } from '../lib/supabase';

interface ActaDetailProps {
  acta: Acta;
  onEdit: () => void;
  onBack: () => void;
}

export default function ActaDetail({ acta, onEdit, onBack }: ActaDetailProps) {
  const DetailField = ({ label, value }: { label: string; value: string | number }) => (
    <div className="space-y-1 pb-3">
      <dt className="text-xs font-semibold text-gray-600 uppercase">{label}</dt>
      <dd className="text-base text-gray-900 whitespace-pre-wrap">{value || '-'}</dd>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1b6b2f]">Detalle del Acta</h1>
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

        <div className="grid grid-cols-1 gap-6">
          {/* Información General */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Información General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailField label="N° de Acta" value={acta['NO_DE_ACTA']} />
              <DetailField label="Órgano que se Reúne" value={acta['ORGANO_QUE_SE_REUNE']} />
              <DetailField label="Fecha de la Reunión" value={acta['FECHA_DE_LA_REUNION']} />
              <DetailField label="Naturaleza de la Reunión" value={acta['NATURALEZA_DE_LA_REUNION']} />
              <DetailField label="Lugar" value={acta['LUGAR']} />
              <DetailField label="Secretario de la Reunión" value={acta['SECRETARIO_DE_LA_REUNION']} />
              <DetailField label="Formato de Convocatoria" value={acta['FORMATO_DE_CONVOCATORIA']} />
              <DetailField label="Hora de Inicio" value={acta['HORA_DE_INICIO_DE_LA_REUNION']} />
              <DetailField label="Hora de Terminación" value={acta['HORA_DE_TERMINACION']} />
              <DetailField label="Cargo" value={acta['CARGO']} />
            </div>
          </div>

          {/* Órganos Participantes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Órganos Participantes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const value = acta[`ORGANO${num}` as keyof Acta];
                if (!value) return null;
                return (
                  <DetailField
                    key={`organo${num}`}
                    label={`Órgano ${num}`}
                    value={value as string}
                  />
                );
              })}
            </div>
          </div>

          {/* Nombres de Participantes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Nombres de Participantes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const value = acta[`NOMBRE${num}` as keyof Acta];
                if (!value) return null;
                return (
                  <DetailField
                    key={`nombre${num}`}
                    label={`Nombre ${num}`}
                    value={value as string}
                  />
                );
              })}
            </div>
          </div>

          {/* Objetivos y Temas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Objetivos y Temas
            </h2>
            <div className="space-y-4">
              <DetailField label="Objetivo" value={acta['OBJETIVO']} />
              {[1, 2, 3, 4].map((num) => {
                const value = acta[`TEMA${num}` as keyof Acta];
                if (!value) return null;
                return (
                  <DetailField
                    key={`tema${num}`}
                    label={`Tema ${num}`}
                    value={value as string}
                  />
                );
              })}
            </div>
          </div>

          {/* Desarrollo de la Reunión */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Desarrollo de la Reunión
            </h2>
            <div className="space-y-6">
              <DetailField
                label="Saludo y Verificación de Asistencia"
                value={acta['TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA']}
              />
              <DetailField
                label="Lectura y Aprobación de Acta Anterior"
                value={acta['TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR']}
              />
              {[1, 2, 3, 4].map((num) => {
                const value = acta[`TEXTO_DEL_TEMA${num}` as keyof Acta];
                if (!value) return null;
                return (
                  <DetailField
                    key={`texto${num}`}
                    label={`Texto del Tema ${num}`}
                    value={value as string}
                  />
                );
              })}
              <DetailField
                label="Proposiciones y Varios"
                value={acta['TEXTO_DE_PROPOSICIONES_Y_VARIOS']}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
