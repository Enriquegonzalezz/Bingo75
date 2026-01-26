import prisma from './db';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CartonNumeros {
  B: number[];
  I: number[];
  N: number[];
  G: number[];
  O: number[];
}

export interface Carton {
  id: string;
  serial: string;
  numero_carton: number;
  numeros: CartonNumeros;
  matriz: number[][];
}

export interface PaqueteCartones {
  version: string;
  paquete_id: string;
  nombre: string;
  fecha_generacion: string;
  total_cartones: number;
  descripcion: string;
  cartones: Carton[];
}

export interface PaqueteInfo {
  id: string;
  nombre: string;
  total_cartones: number;
  fecha_generacion: string;
}

// ============================================================================
// FUNCIÓN 1 - VERIFICAR SI UN PAQUETE EXISTE
// ============================================================================

export async function paqueteExiste(paqueteId: string): Promise<boolean> {
  try {
    const paquete = await prisma.paquete.findUnique({
      where: { paquete_id: paqueteId },
    });
    return paquete !== null;
  } catch (error) {
    console.error('❌ Error al verificar paquete:', error);
    return false;
  }
}

// ============================================================================
// FUNCIÓN 2 - GUARDAR PAQUETE EN LA BASE DE DATOS
// ============================================================================

export async function guardarPaqueteEnDB(paquete: PaqueteCartones): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Crear el paquete
      const paqueteCreado = await tx.paquete.create({
        data: {
          paquete_id: paquete.paquete_id,
          nombre: paquete.nombre,
          version: paquete.version,
          fecha_generacion: new Date(paquete.fecha_generacion),
          total_cartones: paquete.total_cartones,
          descripcion: paquete.descripcion,
          serial: paquete.cartones[0]?.serial || 'BINGO',
        },
      });

      // 2. Crear todos los cartones asociados al paquete
      const cartonesData = paquete.cartones.map((carton) => ({
        carton_id: carton.id,
        numero_carton: carton.numero_carton,
        serial: carton.serial,
        paquete_id: paqueteCreado.id,
        numeros_b: carton.numeros.B,
        numeros_i: carton.numeros.I,
        numeros_n: carton.numeros.N,
        numeros_g: carton.numeros.G,
        numeros_o: carton.numeros.O,
        matriz: carton.matriz,
      }));

      await tx.carton.createMany({
        data: cartonesData,
      });

      console.log('✅ Paquete guardado exitosamente en la base de datos');
    });
  } catch (error) {
    console.error('❌ Error al guardar en la base de datos:', error);
    throw error;
  }
}

// ============================================================================
// FUNCIÓN 3 - OBTENER TODOS LOS PAQUETES
// ============================================================================

export async function obtenerTodosPaquetes(): Promise<PaqueteInfo[]> {
  try {
    const paquetes = await prisma.paquete.findMany({
      select: {
        paquete_id: true,
        nombre: true,
        total_cartones: true,
        fecha_generacion: true,
      },
      orderBy: {
        fecha_generacion: 'desc',
      },
    });

    return paquetes.map((p) => ({
      id: p.paquete_id,
      nombre: p.nombre,
      total_cartones: p.total_cartones,
      fecha_generacion: p.fecha_generacion.toISOString(),
    }));
  } catch (error) {
    console.error('❌ Error al obtener paquetes:', error);
    throw error;
  }
}

// ============================================================================
// FUNCIÓN 4 - OBTENER CARTONES DE UN PAQUETE
// ============================================================================

export async function obtenerCartonesPorPaquete(paqueteId: string): Promise<Carton[]> {
  try {
    const paquete = await prisma.paquete.findUnique({
      where: { paquete_id: paqueteId },
      include: {
        cartones: {
          orderBy: { numero_carton: 'asc' },
        },
      },
    });

    if (!paquete) {
      console.warn(`⚠️ Paquete ${paqueteId} no encontrado en la base de datos`);
      return [];
    }

    return paquete.cartones.map((c) => ({
      id: c.carton_id,
      serial: c.serial,
      numero_carton: c.numero_carton,
      numeros: {
        B: c.numeros_b as number[],
        I: c.numeros_i as number[],
        N: c.numeros_n as number[],
        G: c.numeros_g as number[],
        O: c.numeros_o as number[],
      },
      matriz: c.matriz as number[][],
    }));
  } catch (error) {
    console.error('❌ Error al obtener cartones:', error);
    throw error;
  }
}

// ============================================================================
// FUNCIÓN 5 - OBTENER PAQUETE COMPLETO CON CARTONES
// ============================================================================

export async function obtenerPaqueteConCartones(
  paqueteId: string
): Promise<PaqueteCartones | null> {
  try {
    const paquete = await prisma.paquete.findUnique({
      where: { paquete_id: paqueteId },
      include: {
        cartones: {
          orderBy: { numero_carton: 'asc' },
        },
      },
    });

    if (!paquete) return null;

    return {
      version: paquete.version,
      paquete_id: paquete.paquete_id,
      nombre: paquete.nombre,
      fecha_generacion: paquete.fecha_generacion.toISOString(),
      total_cartones: paquete.total_cartones,
      descripcion: paquete.descripcion || '',
      cartones: paquete.cartones.map((c) => ({
        id: c.carton_id,
        serial: c.serial,
        numero_carton: c.numero_carton,
        numeros: {
          B: c.numeros_b as number[],
          I: c.numeros_i as number[],
          N: c.numeros_n as number[],
          G: c.numeros_g as number[],
          O: c.numeros_o as number[],
        },
        matriz: c.matriz as number[][],
      })),
    };
  } catch (error) {
    console.error('❌ Error al obtener paquete completo:', error);
    throw error;
  }
}

// ============================================================================
// FUNCIÓN 6 - ELIMINAR PAQUETE
// ============================================================================

export async function eliminarPaquete(paqueteId: string): Promise<boolean> {
  try {
    const paquete = await prisma.paquete.findUnique({
      where: { paquete_id: paqueteId },
    });

    if (!paquete) return false;

    await prisma.paquete.delete({
      where: { paquete_id: paqueteId },
    });

    console.log(`✅ Paquete ${paqueteId} eliminado`);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar paquete:', error);
    return false;
  }
}
