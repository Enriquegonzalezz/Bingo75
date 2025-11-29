'use client';

import { useState, useMemo } from 'react';
import { useCartones } from '@/presentation/hooks/useCartones';
import { CartonGrid } from '@/presentation/components/cartones/CartonGrid';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Search, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const ITEMS_PER_PAGE = 100;

export default function CartonesPage() {
  const { cartones, loading, recargar } = useCartones();
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Filtrar cartones
  const cartonesFiltrados = useMemo(() => {
    if (!busqueda) return cartones;
    return cartones.filter(
      (c) =>
        c.serial.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.numero_carton.toString().includes(busqueda)
    );
  }, [cartones, busqueda]);

  // Calcular paginación
  const totalPaginas = Math.ceil(cartonesFiltrados.length / ITEMS_PER_PAGE);
  const indiceInicio = (paginaActual - 1) * ITEMS_PER_PAGE;
  const indiceFin = indiceInicio + ITEMS_PER_PAGE;
  
  // Solo cargar los cartones de la página actual
  const cartonesPaginados = useMemo(() => {
    return cartonesFiltrados.slice(indiceInicio, indiceFin);
  }, [cartonesFiltrados, indiceInicio, indiceFin]);

  // Resetear página al buscar
  const handleBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPaginaActual(1);
  };

  // Navegación de páginas
  const irAPagina = (pagina: number) => {
    setPaginaActual(Math.max(1, Math.min(pagina, totalPaginas)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generar números de página visibles
  const paginasVisibles = useMemo(() => {
    const paginas: number[] = [];
    const rango = 2;
    
    let inicio = Math.max(1, paginaActual - rango);
    let fin = Math.min(totalPaginas, paginaActual + rango);
    
    if (fin - inicio < rango * 2) {
      if (inicio === 1) {
        fin = Math.min(totalPaginas, inicio + rango * 2);
      } else if (fin === totalPaginas) {
        inicio = Math.max(1, fin - rango * 2);
      }
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }, [paginaActual, totalPaginas]);

  return (
    <div className="min-h-screen bg-[#124723] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#ffd402]">Cartones</h1>
            <p className="text-[#f8df7e] mt-2">
              {cartones.length.toLocaleString()} cartones disponibles
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={recargar} 
            disabled={loading}
            className="bg-[#ffd402] text-[#1d1d1b] hover:bg-[#ffe44a]"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
        </div>

        {/* Búsqueda y Info de Paginación */}
        <div className="bg-[#1d1d1b] rounded-xl shadow-lg p-6 mb-8 border border-[#ffd402]/30">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#f8df7e] w-5 h-5" />
              <Input
                type="text"
                value={busqueda}
                onChange={(e) => handleBusqueda(e.target.value)}
                placeholder="Buscar por serial o número de cartón..."
                className="pl-10 bg-[#1d1d1b] border-[#3d3d3b] text-white placeholder-gray-500 focus:border-[#ffd402]"
              />
            </div>
            <div className="text-[#f8df7e] text-sm whitespace-nowrap">
              Mostrando <span className="font-bold text-[#ffd402]">{indiceInicio + 1}</span> - <span className="font-bold text-[#ffd402]">{Math.min(indiceFin, cartonesFiltrados.length)}</span> de <span className="font-bold text-[#ffd402]">{cartonesFiltrados.length.toLocaleString()}</span>
            </div>
          </div>
          {busqueda && (
            <p className="text-sm text-[#68b258] mt-2">
              {cartonesFiltrados.length.toLocaleString()} resultado(s) encontrado(s)
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
          <div className="text-center py-16 bg-[#1d1d1b] rounded-xl shadow-lg border border-[#ffd402]/30">
            <RefreshCw className="w-16 h-16 mx-auto mb-4 text-[#ffd402]/50" />
            <h3 className="text-xl font-bold text-[#ffd402] mb-2">
              Error al cargar cartones
            </h3>
            <p className="text-[#f8df7e] mb-6">
              No se pudieron cargar los cartones desde el JSON
            </p>
            <Button onClick={recargar} className="bg-[#ffd402] text-[#1d1d1b] hover:bg-[#ffe44a]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : cartonesFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-[#1d1d1b] rounded-xl shadow-lg border border-[#ffd402]/30">
            <Search className="w-16 h-16 mx-auto mb-4 text-[#ffd402]/50" />
            <p className="text-[#f8df7e]">
              No se encontraron cartones con &quot;{busqueda}&quot;
            </p>
          </div>
        ) : (
          <>
            {/* Grid de cartones paginados */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {cartonesPaginados.map((carton) => (
                <div
                  key={carton.id}
                  className="bg-[#1d1d1b] rounded-xl shadow-lg p-4 hover:shadow-xl transition-all hover:scale-[1.02] border border-[#ffd402]/20 hover:border-[#ffd402]/50"
                >
                  <div className="mb-3 text-center">
                    <p className="text-xs text-[#f8df7e]/70">Cartón</p>
                    <p className="text-xl font-bold text-[#ffd402]">#{carton.numero_carton}</p>
                    <p className="text-xs text-gray-500 truncate">{carton.serial}</p>
                  </div>
                  <CartonGrid carton={carton} size="small" />
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#1d1d1b] rounded-xl p-4 border border-[#ffd402]/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => irAPagina(1)}
                    disabled={paginaActual === 1}
                    className="p-2 rounded-lg bg-[#2d2d2b] text-[#ffd402] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffd402] hover:text-[#1d1d1b] transition-colors"
                    title="Primera página"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => irAPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="p-2 rounded-lg bg-[#2d2d2b] text-[#ffd402] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffd402] hover:text-[#1d1d1b] transition-colors"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {paginasVisibles[0] > 1 && (
                      <>
                        <button
                          onClick={() => irAPagina(1)}
                          className="w-10 h-10 rounded-lg bg-[#2d2d2b] text-[#f8df7e] hover:bg-[#ffd402] hover:text-[#1d1d1b] transition-colors font-bold"
                        >
                          1
                        </button>
                        {paginasVisibles[0] > 2 && (
                          <span className="text-[#f8df7e] px-2">...</span>
                        )}
                      </>
                    )}
                    
                    {paginasVisibles.map((pagina) => (
                      <button
                        key={pagina}
                        onClick={() => irAPagina(pagina)}
                        className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                          pagina === paginaActual
                            ? 'bg-[#ffd402] text-[#1d1d1b] shadow-lg'
                            : 'bg-[#2d2d2b] text-[#f8df7e] hover:bg-[#ffd402] hover:text-[#1d1d1b]'
                        }`}
                      >
                        {pagina}
                      </button>
                    ))}
                    
                    {paginasVisibles[paginasVisibles.length - 1] < totalPaginas && (
                      <>
                        {paginasVisibles[paginasVisibles.length - 1] < totalPaginas - 1 && (
                          <span className="text-[#f8df7e] px-2">...</span>
                        )}
                        <button
                          onClick={() => irAPagina(totalPaginas)}
                          className="w-10 h-10 rounded-lg bg-[#2d2d2b] text-[#f8df7e] hover:bg-[#ffd402] hover:text-[#1d1d1b] transition-colors font-bold"
                        >
                          {totalPaginas}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => irAPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 rounded-lg bg-[#2d2d2b] text-[#ffd402] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffd402] hover:text-[#1d1d1b] transition-colors"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => irAPagina(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 rounded-lg bg-[#2d2d2b] text-[#ffd402] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffd402] hover:text-[#1d1d1b] transition-colors"
                    title="Última página"
                  >
                    <ChevronsRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-[#f8df7e] text-sm">
                  Página <span className="font-bold text-[#ffd402]">{paginaActual}</span> de <span className="font-bold text-[#ffd402]">{totalPaginas}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
