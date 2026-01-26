import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener un paquete específico
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const paquete = await prisma.paquete.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cartones: true },
        },
      },
    });

    if (!paquete) {
      return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      paquete: {
        id: paquete.id,
        nombre: paquete.nombre,
        total_cartones: paquete._count.cartones,
        fecha_generacion: paquete.fecha_generacion,
      },
    });
  } catch (error) {
    console.error('Error al obtener paquete:', error);
    return NextResponse.json({ error: 'Error al obtener el paquete' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Eliminar un paquete y todos sus cartones
export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    console.log(`🗑️ Intentando eliminar paquete: ${id}`);

    const paquete = await prisma.paquete.findUnique({
      where: { id },
    });

    if (!paquete) {
      return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 });
    }

    const cartonesEliminados = await prisma.carton.deleteMany({
      where: { paquete_id: id },
    });

    console.log(`📦 ${cartonesEliminados.count} cartones eliminados`);

    await prisma.paquete.delete({
      where: { id },
    });

    console.log(`✅ Paquete "${paquete.nombre}" eliminado correctamente`);

    return NextResponse.json({
      success: true,
      mensaje: `Paquete "${paquete.nombre}" eliminado correctamente`,
      cartonesEliminados: cartonesEliminados.count,
    });
  } catch (error) {
    console.error('❌ Error al eliminar paquete:', error);
    return NextResponse.json({ error: 'Error al eliminar el paquete' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
