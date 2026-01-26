'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Calendar, Package, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface PaqueteInfo {
  id: string;
  nombre: string;
  total_cartones: number;
  fecha_generacion: string;
}

interface ListaPaquetesProps {
  onPaqueteEliminado?: () => void;
}

export default function ListaPaquetes({ onPaqueteEliminado }: ListaPaquetesProps = {}) {
  const [paquetes, setPaquetes] = useState<PaqueteInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<PaqueteInfo | null>(null);

  useEffect(() => {
    cargarPaquetes();
  }, []);

  const cargarPaquetes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/paquetes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar paquetes');
      }

      setPaquetes(data.paquetes || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar la lista de paquetes');
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarPaquete = async (paquete: PaqueteInfo) => {
    setEliminando(paquete.id);

    try {
      const response = await fetch(`/api/paquetes/${paquete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar paquete');
      }

      toast.success(`Paquete "${paquete.nombre}" eliminado correctamente`);

      setPaquetes((prev) => prev.filter((p) => p.id !== paquete.id));

      if (onPaqueteEliminado) {
        onPaqueteEliminado();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar paquete');
    } finally {
      setEliminando(null);
      setConfirmacion(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (paquetes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No hay paquetes importados</p>
        <p className="text-gray-400 text-sm mt-2">Importa tu primer paquete de cartones</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Paquetes Importados</h2>
          </div>

          <div className="grid gap-4">
            {paquetes.map((paquete) => (
              <div
                key={paquete.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{paquete.nombre}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>ID: {paquete.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{paquete.total_cartones.toLocaleString()} cartones</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Importado: {new Date(paquete.fecha_generacion).toLocaleString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setConfirmacion(paquete)}
                    disabled={eliminando === paquete.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar paquete"
                  >
                    {eliminando === paquete.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Total: {paquetes.length} paquete{paquetes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {confirmacion && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setConfirmacion(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">¿Eliminar paquete?</h3>
                  <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-semibold text-gray-800">{confirmacion.nombre}</p>
                <p className="text-sm text-gray-600">
                  {confirmacion.total_cartones.toLocaleString()} cartones serán eliminados
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmacion(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => eliminarPaquete(confirmacion)}
                  disabled={eliminando !== null}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {eliminando === confirmacion.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
