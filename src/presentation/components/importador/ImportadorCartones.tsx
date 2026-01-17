'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaqueteInfo {
  id: string;
  nombre: string;
  total_cartones: number;
  fecha_generacion: string;
}

interface ImportadorCartonesProps {
  onImportSuccess?: () => void;
}

export default function ImportadorCartones({ onImportSuccess }: ImportadorCartonesProps = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [nombrePaquete, setNombrePaquete] = useState('');
  const [serial, setSerial] = useState('BINGO');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [paqueteInfo, setPaqueteInfo] = useState<PaqueteInfo | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.type === 'text/csv' ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls') ||
        selectedFile.name.endsWith('.csv')
      ) {
        setFile(selectedFile);
        setUploadSuccess(false);
      } else {
        toast.error('Por favor selecciona un archivo válido (.xlsx, .xls o .csv)');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    if (!nombrePaquete.trim()) {
      toast.error('Por favor ingresa un nombre para el paquete');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nombre', nombrePaquete.trim());
      formData.append('serial', serial.trim());

      const response = await fetch('/api/import-cartones', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al importar el archivo');
      }

      setPaqueteInfo(data.paquete);
      setUploadSuccess(true);
      toast.success(`¡Paquete "${data.paquete.nombre}" importado exitosamente!`);
      
      if (onImportSuccess) {
        onImportSuccess();
      }
      
      setFile(null);
      setNombrePaquete('');
      setSerial('BINGO');
      
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al importar el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setNombrePaquete('');
    setSerial('BINGO');
    setUploadSuccess(false);
    setPaqueteInfo(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Importar Cartones desde Excel/CSV</h2>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Formato del archivo Excel/CSV:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cada fila representa un cartón completo</li>
            <li>• Cada fila debe tener exactamente 25 números</li>
            <li>• Los números se organizan de izquierda a derecha, de arriba a abajo</li>
            <li>• El cuadro libre (centro) se establecerá automáticamente en 0</li>
            <li>• Formato: Fila 1 = Cartón A, Fila 2 = Cartón B, etc.</li>
          </ul>
        </div>

        {uploadSuccess && paqueteInfo && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">¡Importación exitosa!</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Paquete:</strong> {paqueteInfo.nombre}</p>
                  <p><strong>ID:</strong> {paqueteInfo.id}</p>
                  <p><strong>Total de cartones:</strong> {paqueteInfo.total_cartones}</p>
                  <p><strong>Fecha:</strong> {new Date(paqueteInfo.fecha_generacion).toLocaleString('es-ES')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre-paquete" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Paquete *
            </label>
            <input
              id="nombre-paquete"
              type="text"
              value={nombrePaquete}
              onChange={(e) => setNombrePaquete(e.target.value)}
              placeholder="Ej: Paquete Enero 2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isUploading}
            />
          </div>

          <div>
            <label htmlFor="serial" className="block text-sm font-medium text-gray-700 mb-2">
              Serial (Opcional)
            </label>
            <input
              id="serial"
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Ej: BINGO"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isUploading}
            />
          </div>

          <div>
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              Archivo Excel/CSV *
            </label>
            <div className="relative">
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="file-input"
                className={`flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  file
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {file ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <span className="text-green-700 font-medium">{file.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600">Haz clic para seleccionar un archivo Excel o CSV</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!file || !nombrePaquete.trim() || isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Importar Cartones
                </>
              )}
            </button>

            {(file || nombrePaquete || uploadSuccess) && !isUploading && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
