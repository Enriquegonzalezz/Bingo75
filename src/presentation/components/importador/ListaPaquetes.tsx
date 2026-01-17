'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Calendar, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaqueteInfo {
  id: string;
  nombre: string;
  total_cartones: number;
  fecha_generacion: string;
}

export default function ListaPaquetes() {
  const [paquetes, setPaquetes] = useState<PaqueteInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarPaquetes();
  }, []);

  const cargarPaquetes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/import-cartones');
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {paquete.nombre}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>ID: {paquete.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>{paquete.total_cartones} cartones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Importado: {new Date(paquete.fecha_generacion).toLocaleString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Total: {paquetes.length} paquete{paquetes.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
