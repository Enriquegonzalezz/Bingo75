'use client';

import { Card } from '@/presentation/components/ui/Card';
import { Settings } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Configuración</h1>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-bold">Configuración del Juego</h2>
            </div>

            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700 text-center">
                Las dinámicas del juego se configuran desde el <strong>Tablero</strong> antes de iniciar el sorteo.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
