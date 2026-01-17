import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { supabase, Ano } from '../lib/supabase';

interface YearManagerProps {
  selectedYear: Ano | null;
  onYearSelect: (year: Ano) => void;
  onYearsChange: () => void;
}

export default function YearManager({
  selectedYear,
  onYearSelect,
  onYearsChange,
}: YearManagerProps) {
  const [anos, setAnos] = useState<Ano[]>([]);
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<Ano | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const { data, error } = await supabase
        .from('anos')
        .select('*')
        .order('ano', { ascending: false });

      if (error) throw error;

      const yearsList = data || [];
      setAnos(yearsList);

      if (yearsList.length > 0 && !selectedYear) {
        onYearSelect(yearsList[0]);
      }
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  const handleAddYear = async () => {
    if (!newYear) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('anos')
        .insert([{ ano: newYear }])
        .select()
        .single();

      if (error && error.code !== '23505') {
        throw error;
      }

      setNewYear(new Date().getFullYear() + 1);
      await fetchYears();
      
      // Seleccionar automáticamente el año recién creado
      if (data) {
        onYearSelect(data);
      }
      
      onYearsChange();
    } catch (error) {
      console.error('Error adding year:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (year: Ano) => {
    setYearToDelete(year);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!yearToDelete) return;

    try {
      const { error } = await supabase.from('anos').delete().eq('id', yearToDelete.id);

      if (error) throw error;

      await fetchYears();
      onYearsChange();

      if (selectedYear?.id === yearToDelete.id) {
        const remainingYears = anos.filter(y => y.id !== yearToDelete.id);
        if (remainingYears.length > 0) {
          onYearSelect(remainingYears[0]);
        }
      }
    } catch (error) {
      console.error('Error deleting year:', error);
    } finally {
      setShowDeleteConfirm(false);
      setYearToDelete(null);
      setShowDeleteMode(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setYearToDelete(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 border-l-4 border-[#1b6b2f]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#1b6b2f] text-lg">Gestión de Años</h3>
          <div className="flex gap-3">
            {/* Sección de añadir año */}
            <div className="flex gap-2 items-center border-r pr-3 border-gray-300">
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value))}
                className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1b6b2f] focus:border-transparent transition-all"
                min={1900}
                max={2100}
              />
              <button
                onClick={handleAddYear}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-2 bg-[#1b6b2f] text-white rounded-lg hover:bg-[#0d4620] disabled:bg-gray-400 transition-colors text-sm font-medium shadow-sm"
                title="Añadir nuevo año"
              >
                <Plus size={16} />
                Añadir
              </button>
            </div>
            
            {/* Botón de modo eliminar */}
            <button
              onClick={() => setShowDeleteMode(!showDeleteMode)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm ${
                showDeleteMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
              title={showDeleteMode ? 'Cancelar eliminación' : 'Activar modo eliminar'}
            >
              <Trash2 size={16} />
              {showDeleteMode ? 'Cancelar' : 'Eliminar'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {anos.map((year) => (
            <div
              key={year.id}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all font-semibold ${
                showDeleteMode
                  ? 'border-red-300 bg-red-50 cursor-pointer hover:border-red-500 hover:bg-red-100'
                  : selectedYear?.id === year.id
                  ? 'border-[#1b6b2f] bg-green-50 text-[#1b6b2f] cursor-pointer'
                  : 'border-gray-300 bg-gray-50 text-gray-900 hover:border-[#1b6b2f] cursor-pointer'
              }`}
              onClick={() => {
                if (showDeleteMode) {
                  handleDeleteClick(year);
                } else {
                  onYearSelect(year);
                }
              }}
            >
              <span className={showDeleteMode ? 'text-red-700' : ''}>{year.ano}</span>
              {showDeleteMode && (
                <Trash2 size={16} className="text-red-600" />
              )}
            </div>
          ))}
        </div>

        {anos.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay años registrados. Añade uno para comenzar.
          </p>
        )}

        {showDeleteMode && anos.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Modo eliminación activo:</strong> Haz clic en un año para eliminarlo. 
              Se borrarán todos los contratos y actas asociados.
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && yearToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-t-4 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirmar eliminación</h3>
            </div>
            
            <p className="text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar el año <strong>{yearToDelete.ano}</strong>?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-800">
                <strong>⚠️ Advertencia:</strong> Esta acción eliminará permanentemente todos los 
                <strong> contratos y actas</strong> asociados a este año. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md"
              >
                Sí, eliminar año
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
