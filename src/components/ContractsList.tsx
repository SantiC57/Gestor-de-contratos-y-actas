import { Eye, Pencil, Trash2, Download, Plus, Upload } from 'lucide-react';
import { Contrato } from '../lib/supabase';

interface ContractsListProps {
  contratos: Contrato[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}

export default function ContractsList({
  contratos,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onExport,
  onImport,
}: ContractsListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    if (!date || date === 'Invalid Date') return '-';
    return date;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Contratos</h1>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
              <Upload size={20} />
              Importar Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={20} />
              Descargar Excel
            </button>
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Nuevo Contrato
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    N° Contrato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contratista
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Valor Contrato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contratos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No hay contratos registrados. Crea tu primer contrato.
                    </td>
                  </tr>
                ) : (
                  contratos.map((contrato) => (
                    <tr key={contrato.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {contrato['N CONTRATO']}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {contrato['TIPO CONTRATO']}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {contrato['CONTRATISTA']}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatCurrency(contrato['VALOR'])}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(contrato['FECHA INICIO'])}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(contrato['FECHA FIN'])}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onView(contrato.id!)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => onEdit(contrato.id!)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(contrato.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

        {contratos.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total de contratos: {contratos.length}
          </div>
        )}
      </div>
    </div>
  );
}
