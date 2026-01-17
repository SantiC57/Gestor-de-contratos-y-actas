import React, { useState, useCallback } from 'react';
import { FileUp, FileText, Download, Loader2, Eye, X, Table } from 'lucide-react';
import { convertPDFToWord, extractPDFText } from '../utils/pdfToWordConverter';

interface PDFToWordConverterProps {
  onClose: () => void;
}

interface ConversionResult {
  headers?: string[];
  rowCount?: number;
}

export default function PDFToWordConverter({ onClose }: PDFToWordConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewText, setPreviewText] = useState<string>('');
  const [wordBlob, setWordBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Por favor selecciona un archivo PDF');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setPreviewText('');
    setWordBlob(null);

    // Extraer texto para vista previa
    setIsProcessing(true);
    try {
      const text = await extractPDFText(selectedFile);
      setPreviewText(text);
    } catch (err) {
      setError('Error al leer el PDF');
    }
    setIsProcessing(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await convertPDFToWord(file);

      if (result.success && result.blob) {
        setWordBlob(result.blob);
        setPreviewText(result.text);
        setConversionResult({
          headers: result.headers,
          rowCount: result.rowCount,
        });
      } else {
        setError(result.error || 'Error al convertir el PDF');
        setPreviewText(result.text); // Mostrar texto raw si falla
      }
    } catch (err) {
      setError('Error inesperado al convertir');
    }

    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (!wordBlob || !file) return;

    const url = URL.createObjectURL(wordBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '.docx');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreviewText('');
    setWordBlob(null);
    setError(null);
    setConversionResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">
              Convertir PDF a Word
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Zona de carga de archivo */}
          {!file && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('pdf-input')?.click()}
            >
              <FileUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Arrastra un archivo PDF aquí
              </p>
              <p className="text-sm text-gray-500 mb-4">
                o haz clic para seleccionar
              </p>
              <input
                id="pdf-input"
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}

          {/* Archivo seleccionado */}
          {file && (
            <div className="space-y-4">
              {/* Info del archivo */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              {/* Vista previa del texto */}
              {previewText && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Vista previa del contenido extraído:
                    </span>
                  </div>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-auto max-h-64 font-mono">
                    {previewText}
                  </pre>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4">
                {!wordBlob ? (
                  <button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Convirtiendo...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Convertir a Word
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Descargar Word (.docx)
                  </button>
                )}
              </div>

              {/* Mensaje de éxito */}
              {wordBlob && conversionResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <Table className="w-5 h-5" />
                    Tabla extraída exitosamente
                  </div>
                  <div className="text-sm text-green-600">
                    <p>✓ Columnas: {conversionResult.headers?.length || 0}</p>
                    <p>✓ Filas de datos: {conversionResult.rowCount || 0}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Orden de columnas: {conversionResult.headers?.join(' → ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con info */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <p className="text-xs text-gray-500 text-center">
            Extrae la tabla de productos del PDF y genera un Word con la misma estructura.
            Respeta el orden exacto de columnas y filas del documento original.
          </p>
        </div>
      </div>
    </div>
  );
}
