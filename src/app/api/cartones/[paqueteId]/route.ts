import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ paqueteId: string }> }
) {
  try {
    const { paqueteId } = await context.params;

    console.log(`📦 Buscando cartones del paquete: ${paqueteId}`);

    // Verificar que el paquete existe
    const paquete = await prisma.paquete.findUnique({
      where: { id: paqueteId },
    });

    if (!paquete) {
      console.log(`❌ Paquete no encontrado: ${paqueteId}`);

      const paquetesDisponibles = await prisma.paquete.findMany({
        select: { id: true, nombre: true },
      });

      return NextResponse.json(
        {
          error: `Paquete ${paqueteId} no encontrado`,
          disponibles: paquetesDisponibles.map((p) => p.id),
        },
        { status: 404 }
      );
    }

    // Obtener los cartones del paquete
    const cartones = await prisma.carton.findMany({
      where: { paquete_id: paqueteId },
      orderBy: { numero_carton: 'asc' },
    });

    console.log(`✅ Encontrados ${cartones.length} cartones para paquete "${paquete.nombre}"`);

    if (cartones.length === 0) {
      return NextResponse.json(
        { error: `Paquete ${paqueteId} no tiene cartones` },
        { status: 404 }
      );
    }

    // Formatear cartones para el frontend
    const cartonesFormateados = cartones.map((carton) => {
      // Extraer números de cada columna
      const parseJsonArray = (value: unknown): number[] => {
        if (Array.isArray(value)) return value as number[];
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        }
        return [];
      };

      const numeros = {
        B: parseJsonArray(carton.numeros_b),
        I: parseJsonArray(carton.numeros_i),
        N: parseJsonArray(carton.numeros_n),
        G: parseJsonArray(carton.numeros_g),
        O: parseJsonArray(carton.numeros_o),
      };

      // Construir matriz 5x5
      let matriz: number[][] = [];

      // Intentar usar la matriz guardada
      if (carton.matriz) {
        try {
          let matrizData: unknown;
          if (typeof carton.matriz === 'string') {
            matrizData = JSON.parse(carton.matriz);
          } else {
            matrizData = carton.matriz;
          }

          if (Array.isArray(matrizData) && matrizData.length === 5) {
            matriz = matrizData as number[][];
          }
        } catch {
          // Si falla el parsing, construir desde números
        }
      }

      // Si no hay matriz válida, construirla desde los números
      if (matriz.length === 0) {
        const columnas = ['B', 'I', 'N', 'G', 'O'] as const;
        for (let fila = 0; fila < 5; fila++) {
          const filaMatriz: number[] = [];
          for (let col = 0; col < 5; col++) {
            const columna = columnas[col];
            const numerosColumna = numeros[columna] || [];

            if (fila === 2 && col === 2) {
              filaMatriz.push(0); // FREE
            } else {
              let indice = fila;
              if (col === 2 && fila > 2) {
                indice = fila - 1;
              }
              filaMatriz.push(numerosColumna[indice] || 0);
            }
          }
          matriz.push(filaMatriz);
        }
      }

      return {
        id: carton.id,
        serial: carton.serial,
        numero_carton: carton.numero_carton,
        numeros,
        matriz,
      };
    });

    return NextResponse.json({
      paquete: {
        id: paquete.id,
        nombre: paquete.nombre,
      },
      total: cartonesFormateados.length,
      cartones: cartonesFormateados,
    });
  } catch (error) {
    console.error('❌ Error al obtener cartones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
