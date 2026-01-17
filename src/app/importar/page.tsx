'use client';

import { useState } from 'react';
import ImportadorCartones from '@/presentation/components/importador/ImportadorCartones';
import ListaPaquetes from '@/presentation/components/importador/ListaPaquetes';
import { Upload, Package } from 'lucide-react';

export default function ImportarPage() {
  const [activeTab, setActiveTab] = useState<'importar' | 'lista'>('importar');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImportSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('lista');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('importar')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold transition-colors ${
              activeTab === 'importar'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-5 h-5" />
            Importar Cartones
          </button>
          <button
            onClick={() => setActiveTab('lista')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold transition-colors ${
              activeTab === 'lista'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            Ver Paquetes
          </button>
        </div>
      </div>

      {activeTab === 'importar' ? (
        <ImportadorCartones onImportSuccess={handleImportSuccess} />
      ) : (
        <ListaPaquetes key={refreshKey} />
      )}
    </div>
  );
}
