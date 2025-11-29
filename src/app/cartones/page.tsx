'use client';

import { useState } from 'react';
import { useCartones } from '@/presentation/hooks/useCartones';
import { CartonGrid } from '@/presentation/components/cartones/CartonGrid';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Search, RefreshCw } from 'lucide-react';

export default function CartonesPage() {
  const { cartones, loading, recargar } = useCartones();
  const [busqueda, setBusqueda] = useState('');

  const cartonesFiltrados = cartones.filter(
    (c) =>
      c.serial.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.numero_carton.toString().includes(busqueda)
  );

  return (
    <div className="min-h-screen bg-[#124723] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#ffd402]">Cartones</h1>
            <p className="text-[#f8df7e] mt-2">
              {cartones.length} cartones disponibles
            </p>
          </div>

          <Button size="lg" onClick={recargar} disabled={loading}>
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
        </div>

        {/* Búsqueda */}
        <div className="bg-[#1d1d1b] rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#f8df7e] w-5 h-5" />
            <Input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por serial o número de cartón..."
              className="pl-10"
            />
          </div>
          {busqueda && (
            <p className="text-sm text-[#f8df7e] mt-2">
              {cartonesFiltrados.length} resultado(s) encontrado(s)
            </p>
          )}
        </div>

        {/* Grid de cartones */}
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-[#ffd402] animate-spin" />
            <p className="text-[#f8df7e]">Cargando cartones...</p>
          </div>
        ) : cartones.length === 0 ? (
          <div className="text-center py-16 bg-[#1d1d1b] rounded-xl shadow-lg">
            <RefreshCw className="w-16 h-16 mx-auto mb-4 text-[#baa115]" />
            <h3 className="text-xl font-bold text-[#ffd402] mb-2">
              Error al cargar cartones
            </h3>
            <p className="text-[#f8df7e] mb-6">
              No se pudieron cargar los cartones desde el JSON
            </p>
            <Button onClick={recargar}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : cartonesFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-[#1d1d1b] rounded-xl shadow-lg">
            <Search className="w-16 h-16 mx-auto mb-4 text-[#baa115]" />
            <p className="text-[#f8df7e]">
              No se encontraron cartones con &quot;{busqueda}&quot;
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cartonesFiltrados.map((carton) => (
              <div
                key={carton.id}
                className="bg-[#1d1d1b] rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-[#baa115]"
              >
                <div className="mb-4">
                  <p className="text-sm text-[#f8df7e]">Cartón</p>
                  <p className="text-2xl font-bold text-[#ffd402]">#{carton.numero_carton}</p>
                  <p className="text-sm text-[#68b258] truncate">{carton.serial}</p>
                </div>
                <CartonGrid carton={carton} size="small" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
