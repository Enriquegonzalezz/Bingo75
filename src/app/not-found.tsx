import Link from 'next/link';
import { Home, PlayCircle, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 md:p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <p className="text-sm font-semibold tracking-wide text-orange-600 mb-2">Error 404</p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
          Página no encontrada
        </h1>
        <p className="text-gray-600 mb-8">
          La ruta que estás buscando no existe dentro del sistema de Bingo 75.
          Revisa la URL o vuelve a una de las secciones principales de la aplicación.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/">
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-purple-600 bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105">
              <Home className="h-5 w-5" />
              <span>Volver al inicio</span>
            </button>
          </Link>

          <Link href="/tablero">
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-pink-600 bg-white px-6 py-3 text-sm font-bold text-pink-600 shadow-md transition-transform duration-200 hover:scale-105 hover:bg-pink-50">
              <PlayCircle className="h-5 w-5" />
              <span>Ir al tablero</span>
            </button>
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Bingo 75 · Sistema de sorteo manual con validación automática
        </p>
      </div>
    </div>
  );
}
