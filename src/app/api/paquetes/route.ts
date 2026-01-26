import { NextResponse } from 'next/server';
import { obtenerTodosPaquetes } from '@/lib/db-operations';

interface PaqueteInfo {
  id: string;
  nombre: string;
  total_cartones: number;
  fecha_generacion?: string;
}

export async function GET() {
  try {
    console.log('📋 Obteniendo todos los paquetes desde la base de datos...');

    const paquetes: PaqueteInfo[] = await obtenerTodosPaquetes();

    // Ordenar paquetes
    paquetes.sort((a, b) => {
      const orderMap: Record<string, number> = {
        'paquete-original': 0,
        'paquete-alpha': 1,
        'paquete-beta': 2,
        'paquete-gamma': 3,
        'paquete-delta': 4,
      };

      const orderA = orderMap[a.id] ?? 999;
      const orderB = orderMap[b.id] ?? 999;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.nombre.localeCompare(b.nombre);
    });

    console.log(`✅ Se encontraron ${paquetes.length} paquetes`);
    return NextResponse.json({ paquetes });
  } catch (error) {
    console.error('Error al listar paquetes:', error);
    return NextResponse.json({ error: 'Error al listar paquetes' }, { status: 500 });
  }
}
