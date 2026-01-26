'use client';

import { useState, useCallback } from 'react';
import { Upload, Package, Eye } from 'lucide-react';
import ImportadorCartones from '@/presentation/components/importador/ImportadorCartones';
import ListaPaquetes from '@/presentation/components/importador/ListaPaquetes';

type TabType = 'importar' | 'paquetes' | 'visor';

export default function CartonesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('paquetes');
  const [key, setKey] = useState(0);

  const handleCambio = useCallback(() => {
    setKey((prev) => prev + 1);
  }, []);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'importar', label: 'Importar', icon: <Upload className="w-4 h-4" /> },
    { id: 'paquetes', label: 'Paquetes', icon: <Package className="w-4 h-4" /> },
    { id: 'visor', label: 'Visor', icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Gestión de Cartones</h1>

        <div className="w-full max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow p-1 flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido */}
          <div className="min-h-[400px]">
            {activeTab === 'importar' && <ImportadorCartones onImportSuccess={handleCambio} />}
            {activeTab === 'paquetes' && (
              <ListaPaquetes key={key} onPaqueteEliminado={handleCambio} />
            )}
            {activeTab === 'visor' && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Visor de cartones</p>
                <p className="text-gray-400 text-sm mt-2">
                  Selecciona un paquete en la pestaña Paquetes para ver sus cartones
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
