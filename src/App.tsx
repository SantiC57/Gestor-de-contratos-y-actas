import { useState, useEffect } from 'react';
import { supabase, Contrato, Acta, Ano } from './lib/supabase';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Logo from './components/Logo';
import YearManager from './components/YearManager';
import ContractsList from './components/ContractsList';
import ContractForm from './components/ContractForm';
import ContractDetail from './components/ContractDetail';
import ActasList from './components/ActasList';
import ActaForm from './components/ActaForm';
import ActaDetail from './components/ActaDetail';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';
import { exportContratosToExcel, importContratosFromExcel, exportActasToExcel, importActasFromExcel } from './utils/exportToExcel';
import PDFToWordConverter from './components/PDFToWordConverter';
import { LogOut, Settings, FileText, ClipboardList, FileSearch } from 'lucide-react';

type View = 'list' | 'create' | 'edit' | 'detail' | 'settings' | 'pdf-extractor';
type Module = 'contratos' | 'actas';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

function AppContent() {
  const { isLoggedIn, usuario, logout, changePassword } = useAuth();
  const [view, setView] = useState<View>('list');
  const [selectedModule, setSelectedModule] = useState<Module>('contratos');
  const [selectedYear, setSelectedYear] = useState<Ano | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [actas, setActas] = useState<Acta[]>([]);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [selectedActa, setSelectedActa] = useState<Acta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contratoToDelete, setContratoToDelete] = useState<string | null>(null);
  const [actaToDelete, setActaToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [newUsuario, setNewUsuario] = useState(usuario || '');
  const [newContrasena, setNewContrasena] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchContratos = async (yearId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('ano_id', yearId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContratos(data || []);
    } catch (error) {
      showToast('Error al cargar los contratos', 'error');
      console.error('Error fetching contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActas = async (yearId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('actas')
        .select('*')
        .eq('ano_id', yearId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActas(data || []);
    } catch (error) {
      showToast('Error al cargar las actas', 'error');
      console.error('Error fetching actas:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const handleYearSelect = (year: Ano) => {
    setSelectedYear(year);
    setView('list');
    // Cargar datos según el módulo seleccionado
    if (selectedModule === 'contratos') {
      fetchContratos(year.id!);
    } else {
      fetchActas(year.id!);
    }
  };

  const handleModuleChange = (module: Module) => {
    setSelectedModule(module);
    setView('list');
    setSelectedContrato(null);
    setSelectedActa(null);
    
    // Cargar datos del módulo seleccionado
    if (selectedYear) {
      if (module === 'contratos') {
        fetchContratos(selectedYear.id!);
      } else {
        fetchActas(selectedYear.id!);
      }
    }
  };

  const handleYearsChange = () => {
    if (selectedYear) {
      if (selectedModule === 'contratos') {
        fetchContratos(selectedYear.id!);
      } else {
        fetchActas(selectedYear.id!);
      }
    }
  };

  // ========== HANDLERS CONTRATOS ==========
  
  const handleCreate = () => {
    setSelectedContrato(null);
    setSelectedActa(null);
    setView('create');
  };

  const handleEdit = (id: string) => {
    if (selectedModule === 'contratos') {
      const contrato = contratos.find((c) => c.id === id);
      if (contrato) {
        setSelectedContrato(contrato);
        setView('edit');
      }
    } else {
      const acta = actas.find((a) => a.id === id);
      if (acta) {
        setSelectedActa(acta);
        setView('edit');
      }
    }
  };

  const handleView = (id: string) => {
    if (selectedModule === 'contratos') {
      const contrato = contratos.find((c) => c.id === id);
      if (contrato) {
        setSelectedContrato(contrato);
        setView('detail');
      }
    } else {
      const acta = actas.find((a) => a.id === id);
      if (acta) {
        setSelectedActa(acta);
        setView('detail');
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    if (selectedModule === 'contratos') {
      setContratoToDelete(id);
    } else {
      setActaToDelete(id);
    }
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedModule === 'contratos' && contratoToDelete) {
        const { error } = await supabase.from('contratos').delete().eq('id', contratoToDelete);
        if (error) throw error;
        
        if (selectedYear) {
          await fetchContratos(selectedYear.id!);
        }
        showToast('Contrato eliminado exitosamente', 'success');
        setContratoToDelete(null);
      } else if (selectedModule === 'actas' && actaToDelete) {
        const { error } = await supabase.from('actas').delete().eq('id', actaToDelete);
        if (error) throw error;
        
        if (selectedYear) {
          await fetchActas(selectedYear.id!);
        }
        showToast('Acta eliminada exitosamente', 'success');
        setActaToDelete(null);
      }
    } catch (error) {
      showToast(`Error al eliminar ${selectedModule === 'contratos' ? 'el contrato' : 'el acta'}`, 'error');
      console.error('Error deleting:', error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleSave = async (contratoData: Omit<Contrato, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('💾 Guardando contrato...');
      console.log('📋 Datos recibidos:', contratoData);
      console.log('📅 Año seleccionado:', selectedYear);
      
      if (selectedContrato && view === 'edit') {
        console.log('✏️ Modo edición');
        const { error } = await supabase
          .from('contratos')
          .update(contratoData)
          .eq('id', selectedContrato.id);

        if (error) {
          console.error('❌ Error actualizando:', error);
          throw error;
        }

        showToast('Contrato actualizado exitosamente', 'success');
      } else {
        console.log('➕ Modo creación');
        // Asegurar que ano_id está incluido al crear
        const dataToInsert = {
          ...contratoData,
          ano_id: selectedYear?.id || contratoData.ano_id
        };
        
        console.log('📝 Datos a insertar:', dataToInsert);
        console.log('🆔 ano_id:', dataToInsert.ano_id);
        
        const { data, error } = await supabase.from('contratos').insert([dataToInsert]).select();

        if (error) {
          console.error('❌ Error insertando:', error);
          throw error;
        }

        console.log('✅ Contrato creado:', data);
        showToast('Contrato creado exitosamente', 'success');
      }

      if (selectedYear) {
        await fetchContratos(selectedYear.id!);
      }
      setView('list');
      setSelectedContrato(null);
    } catch (error) {
      console.error('❌ Error completo:', error);
      showToast('Error al guardar el contrato', 'error');
    }
  };

  const handleSaveActa = async (actaData: Omit<Acta, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedActa && view === 'edit') {
        const { error } = await supabase
          .from('actas')
          .update(actaData)
          .eq('id', selectedActa.id);

        if (error) throw error;

        showToast('Acta actualizada exitosamente', 'success');
      } else {
        const dataToInsert = {
          ...actaData,
          ano_id: selectedYear?.id || actaData.ano_id
        };
        
        const { error } = await supabase.from('actas').insert([dataToInsert]).select();

        if (error) throw error;

        showToast('Acta creada exitosamente', 'success');
      }

      if (selectedYear) {
        await fetchActas(selectedYear.id!);
      }
      setView('list');
      setSelectedActa(null);
    } catch (error) {
      console.error('Error saving acta:', error);
      showToast('Error al guardar el acta', 'error');
    }
  };

  const handleCancel = () => {
    setView('list');
    setSelectedContrato(null);
    setSelectedActa(null);
  };

  // ========== EXPORTACIÓN/IMPORTACIÓN ==========
  
  const handleExport = () => {
    if (selectedModule === 'contratos') {
      if (contratos.length === 0) {
        showToast('No hay contratos para exportar', 'error');
        return;
      }
      try {
        exportContratosToExcel(contratos, String(selectedYear?.ano || ''));
        showToast('Excel descargado exitosamente', 'success');
      } catch (error) {
        showToast('Error al exportar a Excel', 'error');
        console.error('Error exporting to Excel:', error);
      }
    } else {
      if (actas.length === 0) {
        showToast('No hay actas para exportar', 'error');
        return;
      }
      try {
        exportActasToExcel(actas, String(selectedYear?.ano || ''));
        showToast('Excel descargado exitosamente', 'success');
      } catch (error) {
        showToast('Error al exportar a Excel', 'error');
        console.error('Error exporting to Excel:', error);
      }
    }
  };

  const handleImport = async (file: File) => {
    if (!selectedYear || !selectedYear.id) {
      showToast('Selecciona un año primero', 'error');
      return;
    }

    if (selectedModule === 'contratos') {
      await handleImportContratos(file);
    } else {
      await handleImportActas(file);
    }
  };

  const handleImportContratos = async (file: File) => {
    try {
      const data = await importContratosFromExcel(file);

      console.log('📊 Datos importados:', data);
      console.log('📅 Año seleccionado:', selectedYear);

      const contractsToInsert = data.map((row: any) => ({
        ano_id: selectedYear!.id,
        'N CONTRATO': row['N CONTRATO'] || row['N_CONTRATO'] || '',
        'TIPO CONTRATO': row['TIPO CONTRATO'] || '',
        'CONTRATISTA': row['CONTRATISTA'] || '',
        'CONTRATANTE': row['CONTRATANTE'] || '',
        'NIT': row['NIT'] || '',
        'OBJETIVO': row['OBJETIVO'] || '',
        'DESCRIPCION DE LA NECESIDAD': row['DESCRIPCION DE LA NECESIDAD'] || '',
        'VALOR': parseFloat(row['VALOR']) || 0,
        'FECHA INICIO': row['FECHA INICIO'] || '',
        'FECHA FIN': row['FECHA FIN'] || '',
        'PLAZO': row['PLAZO'] || '',
        'RUBRO PRESUPUESTAL': row['RUBRO PRESUPUESTAL'] || '',
        'DISPONIBILIDAD PRESUPUESTAL': row['DISPONIBILIDAD PRESUPUESTAL'] || '',
        'RPC': row['RPC'] || '',
        'VIGENCIA': row['VIGENCIA'] || '',
        'VALOR CONTRATO LETRAS': row['VALOR CONTRATO LETRAS'] || '',
        'FECHA EXPEDICIÓN': row['FECHA EXPEDICIÓN'] || row['FECHA EXPEDICION'] || '',
        'FUENTE DE FINANCIACION': row['FUENTE DE FINANCIACION'] || '',
        'FORMA DE PAGO': row['FORMA DE PAGO'] || '',
        'REGIMEN': row['REGIMEN'] || '',
        'CEDULA': row['CEDULA'] || '',
        'DIRECCION': row['DIRECCION'] || '',
        'TELEFONO': row['TELEFONO'] || '',
        'FECHA SELECCION CONTRATISTA': row['FECHA SELECCION CONTRATISTA'] || '',
        'FECHA COMUNICACIÓN CONTRATISTA': row['FECHA COMUNICACIÓN CONTRATISTA'] || '',
        'FECHA FACTURA': row['FECHA FACTURA'] || '',
        'FECHA LIQUIDACION': row['FECHA LIQUIDACION'] || '',
        'ACUERDO PRESUPUESTO': row['ACUERDO PRESUPUESTO'] || '',
        'ACTA CIERRE': row['ACTA CIERRE'] || '',
      }));

      const { error } = await supabase.from('contratos').insert(contractsToInsert).select();

      if (error) throw error;

      await fetchContratos(selectedYear!.id!);
      showToast(`${contractsToInsert.length} contratos importados exitosamente`, 'success');
    } catch (error) {
      console.error('Error importing contratos:', error);
      showToast('Error al importar contratos', 'error');
    }
  };

  const handleImportActas = async (file: File) => {
    try {
      const data = await importActasFromExcel(file);

      const actasToInsert = data.map((row: any) => ({
        ano_id: selectedYear!.id,
        'NO_DE_ACTA': row['NO_DE_ACTA'] || '',
        'ORGANO_QUE_SE_REUNE': row['ORGANO_QUE_SE_REUNE'] || '',
        'FECHA_DE_LA_REUNION': row['FECHA_DE_LA_REUNION'] || '',
        'NATURALEZA_DE_LA_REUNION': row['NATURALEZA_DE_LA_REUNION'] || '',
        'LUGAR': row['LUGAR'] || '',
        'SECRETARIO_DE_LA_REUNION': row['SECRETARIO_DE_LA_REUNION'] || '',
        'FORMATO_DE_CONVOCATORIA': row['FORMATO_DE_CONVOCATORIA'] || '',
        'HORA_DE_INICIO_DE_LA_REUNION': row['HORA_DE_INICIO_DE_LA_REUNION'] || '',
        'HORA_DE_TERMINACION': row['HORA_DE_TERMINACION'] || '',
        'CARGO': row['CARGO'] || '',
        'ORGANO1': row['ORGANO1'] || '',
        'ORGANO2': row['ORGANO2'] || '',
        'ORGANO3': row['ORGANO3'] || '',
        'ORGANO4': row['ORGANO4'] || '',
        'ORGANO5': row['ORGANO5'] || '',
        'ORGANO6': row['ORGANO6'] || '',
        'ORGANO7': row['ORGANO7'] || '',
        'ORGANO8': row['ORGANO8'] || '',
        'ORGANO9': row['ORGANO9'] || '',
        'ORGANO10': row['ORGANO10'] || '',
        'NOMBRE1': row['NOMBRE1'] || '',
        'NOMBRE2': row['NOMBRE2'] || '',
        'NOMBRE3': row['NOMBRE3'] || '',
        'NOMBRE4': row['NOMBRE4'] || '',
        'NOMBRE5': row['NOMBRE5'] || '',
        'NOMBRE6': row['NOMBRE6'] || '',
        'NOMBRE7': row['NOMBRE7'] || '',
        'NOMBRE8': row['NOMBRE8'] || '',
        'NOMBRE9': row['NOMBRE9'] || '',
        'NOMBRE10': row['NOMBRE10'] || '',
        'OBJETIVO': row['OBJETIVO'] || '',
        'TEMA1': row['TEMA1'] || '',
        'TEMA2': row['TEMA2'] || '',
        'TEMA3': row['TEMA3'] || '',
        'TEMA4': row['TEMA4'] || '',
        'TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA': row['TEXTO_DE_SALUDO_Y_VERIFICACION_DE_ASISTENCIA'] || '',
        'TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR': row['TEXTO_DE_LECTURA_Y_PROBACION_DE_ACTA_ANTERIOR'] || '',
        'TEXTO_DEL_TEMA1': row['TEXTO_DEL_TEMA1'] || '',
        'TEXTO_DEL_TEMA2': row['TEXTO_DEL_TEMA2'] || '',
        'TEXTO_DEL_TEMA3': row['TEXTO_DEL_TEMA3'] || '',
        'TEXTO_DEL_TEMA4': row['TEXTO_DEL_TEMA4'] || '',
        'TEXTO_DE_PROPOSICIONES_Y_VARIOS': row['TEXTO_DE_PROPOSICIONES_Y_VARIOS'] || '',
      }));

      const { error } = await supabase.from('actas').insert(actasToInsert).select();

      if (error) throw error;

      await fetchActas(selectedYear!.id!);
      showToast(`${actasToInsert.length} actas importadas exitosamente`, 'success');
    } catch (error) {
      console.error('Error importing actas:', error);
      showToast('Error al importar actas', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsuario || !newContrasena) {
      showToast('Completa todos los campos', 'error');
      return;
    }

    setSettingsLoading(true);

    try {
      const success = await changePassword(newUsuario, newContrasena);
      if (success) {
        showToast('Credenciales actualizadas exitosamente', 'success');
        setView('list');
        setNewContrasena('');
      } else {
        showToast('Error al actualizar las credenciales', 'error');
      }
    } catch {
      showToast('Error al actualizar las credenciales', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === 'list' && (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b-4 border-[#1b6b2f] shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Logo size={15} />
                  <div>
                    <h1 className="text-2xl font-bold text-[#1b6b2f]">
                      Gestor de {selectedModule === 'contratos' ? 'Contratos' : 'Actas'}
                    </h1>
                    <p className="text-xs text-gray-600">Colegio Juan Tamayo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setView('pdf-extractor')}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FileSearch size={20} />
                    Extractor PDF
                  </button>
                  <button
                    onClick={() => setView('settings')}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Settings size={20} />
                    Configuración
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <LogOut size={20} />
                    Salir
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <p className="text-sm text-gray-600 mb-6">
                Usuario: <span className="font-semibold text-[#1b6b2f]">{usuario}</span>
              </p>

            <YearManager
              selectedYear={selectedYear}
              onYearSelect={handleYearSelect}
              onYearsChange={handleYearsChange}
            />

            {selectedYear && (
              <>
                {/* Selector de Módulo */}
                <div className="bg-white rounded-xl shadow-md p-5 mb-6 border-l-4 border-blue-600">
                  <h3 className="font-bold text-gray-800 text-lg mb-4">Seleccionar Módulo</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleModuleChange('contratos')}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all font-semibold ${
                        selectedModule === 'contratos'
                          ? 'border-[#1b6b2f] bg-green-50 text-[#1b6b2f] shadow-md'
                          : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <FileText size={24} />
                      <span>Contratos</span>
                    </button>
                    <button
                      onClick={() => handleModuleChange('actas')}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all font-semibold ${
                        selectedModule === 'actas'
                          ? 'border-[#1b6b2f] bg-green-50 text-[#1b6b2f] shadow-md'
                          : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <ClipboardList size={24} />
                      <span>Actas</span>
                    </button>
                  </div>
                </div>

                {/* Lista según módulo */}
                {selectedModule === 'contratos' ? (
                  <ContractsList
                    contratos={contratos}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onCreate={handleCreate}
                    onExport={handleExport}
                    onImport={handleImport}
                  />
                ) : (
                  <ActasList
                    actas={actas}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onCreate={handleCreate}
                    onExport={handleExport}
                    onImport={handleImport}
                  />
                )}
              </>
            )}

              {!selectedYear && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-600 text-lg">
                    Crea o selecciona un año para comenzar a gestionar contratos y actas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(view === 'create' || view === 'edit') && selectedYear && selectedModule === 'contratos' && (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">
            <ContractForm
              contrato={selectedContrato || undefined}
              year={selectedYear}
              onSave={handleSave}
              onCancel={handleCancel}
              isEditing={view === 'edit'}
              nextContractNumber={contratos.length + 1}
            />
          </div>
        </div>
      )}

      {(view === 'create' || view === 'edit') && selectedYear && selectedModule === 'actas' && (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">
            <ActaForm
              acta={selectedActa || undefined}
              year={selectedYear}
              onSave={handleSaveActa}
              onCancel={handleCancel}
              isEditing={view === 'edit'}
              nextActaNumber={actas.length + 1}
            />
          </div>
        </div>
      )}

      {view === 'detail' && selectedContrato && selectedModule === 'contratos' && (
        <ContractDetail
          contrato={selectedContrato}
          onEdit={() => handleEdit(selectedContrato.id!)}
          onBack={handleCancel}
        />
      )}

      {view === 'detail' && selectedActa && selectedModule === 'actas' && (
        <ActaDetail
          acta={selectedActa}
          onEdit={() => handleEdit(selectedActa.id!)}
          onBack={handleCancel}
        />
      )}

      {view === 'settings' && (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Configuración</h1>

            <div className="bg-white rounded-lg shadow-md p-8">
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 pb-4 border-b">
                  Cambiar Usuario y Contraseña
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Usuario
                  </label>
                  <input
                    type="text"
                    value={newUsuario}
                    onChange={(e) => setNewUsuario(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={newContrasena}
                    onChange={(e) => setNewContrasena(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="px-6 py-2.5 bg-[#1b6b2f] text-white rounded-lg hover:bg-[#0d4620] disabled:bg-gray-400 transition-colors font-semibold shadow-md"
                  >
                    {settingsLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {view === 'pdf-extractor' && (
        <PDFToWordConverter onClose={() => setView('list')} />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={`Eliminar ${selectedModule === 'contratos' ? 'Contrato' : 'Acta'}`}
        message={`¿Estás seguro de que deseas eliminar est${selectedModule === 'contratos' ? 'e contrato' : 'a acta'}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setContratoToDelete(null);
          setActaToDelete(null);
        }}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
