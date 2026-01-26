import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const paquetes = await prisma.paquete.findMany({
      include: {
        _count: {
          select: { cartones: true },
        },
      },
      orderBy: {
        fecha_generacion: 'desc',
      },
    });

    const paquetesFormateados = paquetes.map((p) => ({
      id: p.id, // Usar el ID real de la base de datos
      nombre: p.nombre,
      total_cartones: p._count.cartones,
      fecha_generacion: p.fecha_generacion.toISOString(),
    }));

    return NextResponse.json({ paquetes: paquetesFormateados });
  } catch (error) {
    console.error('Error al obtener paquetes:', error);
    return NextResponse.json({ error: 'Error al obtener los paquetes' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
