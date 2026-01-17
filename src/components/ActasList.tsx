import { useState, useMemo } from 'react';
import { Eye, Pencil, Trash2, Download, Plus, Upload, Search } from 'lucide-react';
import { Acta } from '../lib/supabase';

interface ActasListProps {
  actas: Acta[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export default function ActasList({
  actas,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onExport,
  onImport,
}: ActasListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('');

  const filteredActas = useMemo(() => {
    return actas.filter((acta) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();

      if (filterField) {
        const fieldValue = String(acta[filterField as keyof Acta] || '').toLowerCase();
        return fieldValue.includes(searchLower);
      }

      return (
        String(acta['NO_DE_ACTA']).toLowerCase().includes(searchLower) ||
        String(acta['ORGANO_QUE_SE_REUNE']).toLowerCase().includes(searchLower) ||
        String(acta['LUGAR']).toLowerCase().includes(searchLower) ||
        String(acta['SECRETARIO_DE_LA_REUNION']).toLowerCase().includes(searchLower)
      );
    });
  }, [actas, searchTerm, filterField]);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const fieldOptions = [
    { value: '', label: 'Todos los campos' },
    { value: 'NO_DE_ACTA', label: 'N° Acta' },
    { value: 'ORGANO_QUE_SE_REUNE', label: 'Órgano' },
    { value: 'LUGAR', label: 'Lugar' },
    { value: 'SECRETARIO_DE_LA_REUNION', label: 'Secretario' },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar acta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {fieldOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1b6b2f] text-white rounded-lg hover:bg-[#0d4620] transition-colors font-medium shadow-md"
        >
          <Plus size={20} />
          Nueva Acta
        </button>

        <button
          onClick={onExport}
          disabled={actas.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
        >
          <Download size={20} />
          Exportar a Excel
        </button>

        <label className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-md cursor-pointer">
          <Upload size={20} />
          Importar desde Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileImport}
            className="hidden"
          />
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-700 to-gray-600 text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">N° Acta</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Órgano</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha Reunión</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Lugar</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Secretario</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredActas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm
                      ? 'No se encontraron actas que coincidan con la búsqueda'
                      : 'No hay actas registradas'}
                  </td>
                </tr>
              ) : (
                filteredActas.map((acta, index) => (
                  <tr
                    key={acta.id}
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {acta['NO_DE_ACTA']}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {acta['ORGANO_QUE_SE_REUNE'] || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {acta['FECHA_DE_LA_REUNION'] || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {acta['LUGAR'] || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {acta['SECRETARIO_DE_LA_REUNION'] || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onView(acta.id!)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(acta.id!)}
                          className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(acta.id!)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredActas.length} de {actas.length} acta{actas.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
