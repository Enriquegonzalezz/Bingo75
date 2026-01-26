import { NextResponse } from 'next/server';
import { obtenerCartonesPorPaquete } from '@/lib/db-operations';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paqueteId: string }> }
) {
  try {
    const { paqueteId } = await params;

    console.log(`📦 Obteniendo cartones del paquete: ${paqueteId}`);

    const cartones = await obtenerCartonesPorPaquete(paqueteId);

    if (cartones.length === 0) {
      return NextResponse.json(
        { error: `Paquete ${paqueteId} no encontrado o sin cartones` },
        { status: 404 }
      );
    }

    console.log(`✅ Se encontraron ${cartones.length} cartones`);
    return NextResponse.json({ cartones });
  } catch (error) {
    console.error('Error al obtener cartones:', error);
    return NextResponse.json({ error: 'Error al obtener cartones' }, { status: 500 });
  }
}
