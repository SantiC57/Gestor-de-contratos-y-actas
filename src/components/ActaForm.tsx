import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Acta, Ano } from '../lib/supabase';
import { formatDateForDisplay, formatDateForInput } from '../utils/validations';

interface ActaFormProps {
  acta?: Acta;
  year: Ano;
  onSave: (acta: Omit<Acta, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isEditing: boolean;
  nextActaNumber: number;
}

export default function ActaForm({
  acta,
  year,
  onSave,
  onCancel,
  isEditing,
  nextActaNumber,
}: ActaFormProps) {
  const [formData, setFormData] = useState<Omit<Acta, 'id' | 'created_at' | 'updated_at'>>({
    ano_id: year.id!,
    'NO_DE_ACTA': '',
    'ORGANO_QUE_SE_REUNE': '',
    'FECHA_DE_LA_REUNION': '',
    'NATURALEZA_DE_LA_REUNION': '',
    'LUGAR': '',
    'SECRETARIO_DE_LA_REUNION': '',
    'FORMATO_DE_CONVOCATORIA': '',
    'HORA_DE_INICIO_DE_LA_REUNION': '',
    'HORA_DE_TERMINACION': '',
    'CARGO': '',
    'ORGANO1': '',
    'ORGANO2': '',
    'ORGANO3': '',
    'ORGANO4': '',
    'ORGANO5': '',
    'ORGANO6': '',
    'ORGANO7': '',
    'ORGANO8': '',
    'ORGANO9': '',
    'ORGANO10': '',
    'NOMBRE1': '',
    'NOMBRE2': '',
    'NOMBRE3': '',
    'NOMBRE4': '',
    'NOMBRE5': '',
    'NOMBRE6': '',
    'NOMBRE7': '',
    'NOMBRE8': '',
    'NOMBRE9': '',
    'NOMBRE10': '',
    'OBJETIVO': '',
    'TEMA1': '',
    'TEMA2': '',
    'TEMA3': '',
    'TEMA4': '',
    'TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA': '',
    'TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR': '',
    'TEXTO_DEL_TEMA1': '',
    'TEXTO_DEL_TEMA2': '',
    'TEXTO_DEL_TEMA3': '',
    'TEXTO_DEL_TEMA4': '',
    'TEXTO_DE_PROPOSICIONES_Y_VARIOS': '',
  });

  useEffect(() => {
    if (acta) {
      setFormData(acta);
    } else {
      setFormData((prev) => ({
        ...prev,
        'NO_DE_ACTA': `ACTA-${String(nextActaNumber).padStart(3, '0')}-${year.ano}`,
      }));
    }
  }, [acta, nextActaNumber, year]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const displayDate = formatDateForDisplay(`${dateValue}T00:00:00`);
      setFormData((prev) => ({ ...prev, [fieldName]: displayDate }));
    }
  };

  const getDateInputValue = (displayDate: string): string => {
    return formatDateForInput(displayDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData['NO_DE_ACTA']) {
      alert('Por favor completa el número de acta');
      return;
    }

    onSave(formData);
  };

  const sectionClass = 'space-y-4 pb-6 border-b border-gray-200';
  const labelClass = 'block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide';
  const inputClass =
    'w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b6b2f] focus:border-[#1b6b2f] transition-all bg-white shadow-sm';
  const requiredClass = 'text-red-500';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1b6b2f]">
            {isEditing ? 'Editar Acta' : 'Nueva Acta'}
          </h1>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8 border-l-4 border-[#1b6b2f]">
          {/* Información General */}
          <section className={sectionClass}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  N° DE ACTA <span className={requiredClass}>*</span>
                </label>
                <input
                  type="text"
                  name="NO_DE_ACTA"
                  value={formData['NO_DE_ACTA']}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 mt-1">Formato: ACTA-XXX-{year.ano}</p>
              </div>

              <div>
                <label className={labelClass}>ÓRGANO QUE SE REÚNE</label>
                <input
                  type="text"
                  name="ORGANO_QUE_SE_REUNE"
                  value={formData['ORGANO_QUE_SE_REUNE']}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>FECHA DE LA REUNIÓN</label>
                <input
                  type="date"
                  value={getDateInputValue(formData['FECHA_DE_LA_REUNION'])}
                  onChange={(e) => handleDateChange(e, 'FECHA_DE_LA_REUNION')}
                  className={inputClass}
                />
                {formData['FECHA_DE_LA_REUNION'] && (
                  <p className="text-sm text-gray-600 mt-1">{formData['FECHA_DE_LA_REUNION']}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>NATURALEZA DE LA REUNIÓN</label>
                <input
                  type="text"
                  name="NATURALEZA_DE_LA_REUNION"
                  value={formData['NATURALEZA_DE_LA_REUNION']}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>LUGAR</label>
                <input
                  type="text"
                  name="LUGAR"
                  value={formData['LUGAR']}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>SECRETARIO DE LA REUNIÓN</label>
                <input
                  type="text"
                  name="SECRETARIO_DE_LA_REUNION"
                  value={formData['SECRETARIO_DE_LA_REUNION']}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>FORMATO DE CONVOCATORIA</label>
                <input
                  type="text"
                  name="FORMATO_DE_CONVOCATORIA"
                  value={formData['FORMATO_DE_CONVOCATORIA']}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>HORA DE INICIO</label>
                <input
                  type="time"
                  name="HORA_DE_INICIO_DE_LA_REUNION"
                  value={formData['HORA_DE_INICIO_DE_LA_REUNION']}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>HORA DE TERMINACIÓN</label>
                <input
                  type="time"
                  name="HORA_DE_TERMINACION"
                  value={formData['HORA_DE_TERMINACION']}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>CARGO</label>
                <input
                  type="text"
                  name="CARGO"
                  value={formData['CARGO']}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Participantes - Órganos */}
          <section className={sectionClass}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Órganos Participantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <div key={`organo${num}`}>
                  <label className={labelClass}>ÓRGANO {num}</label>
                  <input
                    type="text"
                    name={`ORGANO${num}`}
                    value={formData[`ORGANO${num}` as keyof typeof formData]}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Participantes - Nombres */}
          <section className={sectionClass}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Nombres de Participantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <div key={`nombre${num}`}>
                  <label className={labelClass}>NOMBRE {num}</label>
                  <input
                    type="text"
                    name={`NOMBRE${num}`}
                    value={formData[`NOMBRE${num}` as keyof typeof formData]}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Objetivos y Temas */}
          <section className={sectionClass}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Objetivos y Temas</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>OBJETIVO</label>
                <textarea
                  name="OBJETIVO"
                  value={formData['OBJETIVO']}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </div>

              {[1, 2, 3, 4].map((num) => (
                <div key={`tema${num}`}>
                  <label className={labelClass}>TEMA {num}</label>
                  <input
                    type="text"
                    name={`TEMA${num}`}
                    value={formData[`TEMA${num}` as keyof typeof formData]}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Desarrollo de la Reunión */}
          <section className={sectionClass}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Desarrollo de la Reunión</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>TEXTO DE SALUDO Y VERIFICACIÓN DE ASISTENCIA</label>
                <textarea
                  name="TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA"
                  value={formData['TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA']}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>TEXTO DE LECTURA Y APROBACIÓN DE ACTA ANTERIOR</label>
                <textarea
                  name="TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR"
                  value={formData['TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR']}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </div>

              {[1, 2, 3, 4].map((num) => (
                <div key={`texto${num}`}>
                  <label className={labelClass}>TEXTO DEL TEMA {num}</label>
                  <textarea
                    name={`TEXTO_DEL_TEMA${num}`}
                    value={formData[`TEXTO_DEL_TEMA${num}` as keyof typeof formData]}
                    onChange={handleChange}
                    rows={4}
                    className={inputClass}
                  />
                </div>
              ))}

              <div>
                <label className={labelClass}>TEXTO DE PROPOSICIONES Y VARIOS</label>
                <textarea
                  name="TEXTO_DE_PROPOSICIONES_Y_VARIOS"
                  value={formData['TEXTO_DE_PROPOSICIONES_Y_VARIOS']}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Botón de guardar */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-[#1b6b2f] text-white rounded-lg hover:bg-[#0d4620] transition-colors font-medium shadow-md"
            >
              <Save size={20} />
              {isEditing ? 'Actualizar Acta' : 'Guardar Acta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
