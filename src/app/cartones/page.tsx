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
    <div className="min-h-screen bg-[#fbf7da] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#6a2818]">Cartones</h1>
            <p className="text-[#6a2818] mt-2 font-semibold">
              {cartones.length.toLocaleString()} cartones disponibles
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={recargar} 
            disabled={loading}
            className="bg-[#ffd74a] text-[#6a2818] hover:bg-[#ffe84d]"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
        </div>

        {/* Búsqueda y Info de Paginación */}
        <div className="bg-[#6a2818] rounded-xl shadow-lg p-6 mb-8 border border-[#ffd74a]/30">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ffd74a] w-5 h-5" />
              <Input
                type="text"
                value={busqueda}
                onChange={(e) => handleBusqueda(e.target.value)}
                placeholder="Buscar por serial o número de cartón..."
                className="pl-10 bg-[#fbf7da] border-[#6a2818] text-[#6a2818] placeholder-gray-500 focus:border-[#ffd74a]"
              />
            </div>
            <div className="text-[#ffd74a] text-sm whitespace-nowrap">
              Mostrando <span className="font-bold text-[#6a2818]">{indiceInicio + 1}</span> - <span className="font-bold text-[#6a2818]">{Math.min(indiceFin, cartonesFiltrados.length)}</span> de <span className="font-bold text-[#6a2818]">{cartonesFiltrados.length.toLocaleString()}</span>
            </div>
          </div>
          {busqueda && (
            <p className="text-sm text-[#ffd74a] mt-2 font-semibold">
              {cartonesFiltrados.length.toLocaleString()} resultado(s) encontrado(s)
            </p>
          )}
        </div>

        {/* Grid de cartones */}
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-[#ffd74a] animate-spin" />
            <p className="text-[#6a2818] font-semibold">Cargando cartones...</p>
          </div>
        ) : cartones.length === 0 ? (
          <div className="text-center py-16 bg-[#6a2818] rounded-xl shadow-lg border border-[#ffd74a]/30">
            <RefreshCw className="w-16 h-16 mx-auto mb-4 text-[#ffd74a]/50" />
            <h3 className="text-xl font-bold text-[#ffd74a] mb-2">
              Error al cargar cartones
            </h3>
            <p className="text-white mb-6">
              No se pudieron cargar los cartones desde el JSON
            </p>
            <Button onClick={recargar} className="bg-[#ffd74a] text-[#6a2818] hover:bg-[#ffe84d]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : cartonesFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-[#6a2818] rounded-xl shadow-lg border border-[#ffd74a]/30">
            <Search className="w-16 h-16 mx-auto mb-4 text-[#ffd74a]/50" />
            <p className="text-white">
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
                  className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all hover:scale-[1.02] border border-[#6a2818]/20 hover:border-[#ffd74a]/50"
                >
                  <div className="mb-3 text-center">
                    <p className="text-xs text-[#6a2818]/70">Cartón</p>
                    <p className="text-xl font-bold text-[#6a2818]">#{carton.numero_carton}</p>
                    <p className="text-xs text-gray-500 truncate">{carton.serial}</p>
                  </div>
                  <CartonGrid carton={carton} size="small" />
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#6a2818] rounded-xl p-4 border border-[#ffd74a]/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => irAPagina(1)}
                    disabled={paginaActual === 1}
                    className="p-2 rounded-lg bg-[#fbf7da] text-[#6a2818] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffd74a] hover:text-[#6a2818] transition-colors"
                    title="Primera página"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => irAPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="p-2 rounded-lg bg-[#fbf7da] text-[#6a2818] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffd74a] hover:text-[#6a2818] transition-colors"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {paginasVisibles[0] > 1 && (
                      <>
                        <button
                          onClick={() => irAPagina(1)}
                          className="w-10 h-10 rounded-lg bg-[#fbf7da] text-[#6a2818] hover:bg-[#ffd74a] hover:text-[#6a2818] transition-colors font-bold"
                        >
                          1
                        </button>
                        {paginasVisibles[0] > 2 && (
                          <span className="text-[#ffd74a] px-2">...</span>
                        )}
                      </>
                    )}
                    
                    {paginasVisibles.map((pagina) => (
                      <button
                        key={pagina}
                        onClick={() => irAPagina(pagina)}
                        className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                          pagina === paginaActual
                            ? 'bg-[#ffd74a] text-[#6a2818] shadow-lg'
                            : 'bg-[#fbf7da] text-[#6a2818] hover:bg-[#ffd74a] hover:text-[#6a2818]'
                        }`}
                      >
                        {pagina}
                      </button>
                    ))}
                    
                    {paginasVisibles[paginasVisibles.length - 1] < totalPaginas && (
                      <>
                        {paginasVisibles[paginasVisibles.length - 1] < totalPaginas - 1 && (
                          <span className="text-[#ffd74a] px-2">...</span>
                        )}
                        <button
                          onClick={() => irAPagina(totalPaginas)}
                          className="w-10 h-10 rounded-lg bg-[#fbf7da] text-[#6a2818] hover:bg-[#ffd74a] hover:text-[#6a2818] transition-colors font-bold"
                        >
                          {totalPaginas}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => irAPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 rounded-lg bg-[#fbf7da] text-[#6a2818] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffd74a] hover:text-[#6a2818] transition-colors"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => irAPagina(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 rounded-lg bg-[#fbf7da] text-[#6a2818] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffd74a] hover:text-[#6a2818] transition-colors"
                    title="Última página"
                  >
                    <ChevronsRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-[#ffd74a] text-sm">
                  Página <span className="font-bold text-white">{paginaActual}</span> de <span className="font-bold text-white">{totalPaginas}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
