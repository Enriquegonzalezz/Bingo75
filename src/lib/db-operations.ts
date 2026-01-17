// ============================================================================
// 🔴 JHONATHAN: AQUÍ VAN LAS OPERACIONES DE BASE DE DATOS
// ============================================================================
// Este archivo contiene las funciones para interactuar con la base de datos
// Implementa estas funciones según el ORM/librería que elijas
// ============================================================================

// import { prisma } from './db'; // Si usas Prisma
// import { pool } from './db';   // Si usas pg o mysql2

// ============================================================================
// INTERFACES - Mantén estas para type safety
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

// ============================================================================
// 🔴 JHONATHAN: FUNCIÓN 1 - GUARDAR PAQUETE EN LA BASE DE DATOS
// ============================================================================
// Esta función recibe un paquete completo y lo guarda en la base de datos
// Debe guardar tanto el paquete como todos sus cartones
// ============================================================================

export async function guardarPaqueteEnDB(paquete: PaqueteCartones): Promise<void> {
  console.log('🔴 JHONATHAN: Aquí debes guardar el paquete en la base de datos');
  console.log('📦 Paquete a guardar:', {
    paquete_id: paquete.paquete_id,
    nombre: paquete.nombre,
    total_cartones: paquete.total_cartones,
  });
  
  // ========================================================================
  // EJEMPLO CON PRISMA:
  // ========================================================================
  // try {
  //   // 1. Crear el paquete
  //   const paqueteCreado = await prisma.paquete.create({
  //     data: {
  //       paquete_id: paquete.paquete_id,
  //       nombre: paquete.nombre,
  //       version: paquete.version,
  //       fecha_generacion: new Date(paquete.fecha_generacion),
  //       total_cartones: paquete.total_cartones,
  //       descripcion: paquete.descripcion,
  //       serial: paquete.cartones[0]?.serial || 'BINGO',
  //     },
  //   });
  //
  //   // 2. Crear todos los cartones asociados al paquete
  //   const cartonesData = paquete.cartones.map((carton) => ({
  //     carton_id: carton.id,
  //     numero_carton: carton.numero_carton,
  //     serial: carton.serial,
  //     paquete_id: paqueteCreado.id,
  //     numeros_b: carton.numeros.B,
  //     numeros_i: carton.numeros.I,
  //     numeros_n: carton.numeros.N,
  //     numeros_g: carton.numeros.G,
  //     numeros_o: carton.numeros.O,
  //     matriz: carton.matriz,
  //   }));
  //
  //   await prisma.carton.createMany({
  //     data: cartonesData,
  //   });
  //
  //   console.log('✅ Paquete guardado exitosamente en la base de datos');
  // } catch (error) {
  //   console.error('❌ Error al guardar en la base de datos:', error);
  //   throw error;
  // }
  
  // ========================================================================
  // EJEMPLO CON PostgreSQL POOL (pg):
  // ========================================================================
  // const client = await pool.connect();
  // try {
  //   await client.query('BEGIN');
  //   
  //   // 1. Insertar el paquete
  //   const paqueteResult = await client.query(
  //     `INSERT INTO paquetes (paquete_id, nombre, version, fecha_generacion, total_cartones, descripcion, serial)
  //      VALUES ($1, $2, $3, $4, $5, $6, $7)
  //      RETURNING id`,
  //     [
  //       paquete.paquete_id,
  //       paquete.nombre,
  //       paquete.version,
  //       paquete.fecha_generacion,
  //       paquete.total_cartones,
  //       paquete.descripcion,
  //       paquete.cartones[0]?.serial || 'BINGO'
  //     ]
  //   );
  //   
  //   const paqueteDbId = paqueteResult.rows[0].id;
  //   
  //   // 2. Insertar todos los cartones
  //   for (const carton of paquete.cartones) {
  //     await client.query(
  //       `INSERT INTO cartones (carton_id, numero_carton, serial, paquete_id, numeros_b, numeros_i, numeros_n, numeros_g, numeros_o, matriz)
  //        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
  //       [
  //         carton.id,
  //         carton.numero_carton,
  //         carton.serial,
  //         paqueteDbId,
  //         JSON.stringify(carton.numeros.B),
  //         JSON.stringify(carton.numeros.I),
  //         JSON.stringify(carton.numeros.N),
  //         JSON.stringify(carton.numeros.G),
  //         JSON.stringify(carton.numeros.O),
  //         JSON.stringify(carton.matriz)
  //       ]
  //     );
  //   }
  //   
  //   await client.query('COMMIT');
  //   console.log('✅ Paquete guardado exitosamente');
  // } catch (error) {
  //   await client.query('ROLLBACK');
  //   console.error('❌ Error al guardar:', error);
  //   throw error;
  // } finally {
  //   client.release();
  // }
  
  // ========================================================================
  // 🔴 JHONATHAN: DESCOMENTA Y ADAPTA EL CÓDIGO SEGÚN TU BASE DE DATOS
  // ========================================================================
}

// ============================================================================
// 🔴 JHONATHAN: FUNCIÓN 2 - OBTENER TODOS LOS PAQUETES
// ============================================================================
// Esta función debe retornar la lista de todos los paquetes disponibles
// Solo necesita información básica (id, nombre, total_cartones, fecha)
// ============================================================================

export async function obtenerTodosPaquetes(): Promise<Array<{
  id: string;
  nombre: string;
  total_cartones: number;
  fecha_generacion: string;
}>> {
  console.log('🔴 JHONATHAN: Aquí debes obtener todos los paquetes de la base de datos');
  
  // ========================================================================
  // EJEMPLO CON PRISMA:
  // ========================================================================
  // try {
  //   const paquetes = await prisma.paquete.findMany({
  //     select: {
  //       paquete_id: true,
  //       nombre: true,
  //       total_cartones: true,
  //       fecha_generacion: true,
  //     },
  //     orderBy: {
  //       fecha_generacion: 'desc',
  //     },
  //   });
  //   
  //   return paquetes.map(p => ({
  //     id: p.paquete_id,
  //     nombre: p.nombre,
  //     total_cartones: p.total_cartones,
  //     fecha_generacion: p.fecha_generacion.toISOString(),
  //   }));
  // } catch (error) {
  //   console.error('❌ Error al obtener paquetes:', error);
  //   throw error;
  // }
  
  // ========================================================================
  // EJEMPLO CON PostgreSQL POOL (pg):
  // ========================================================================
  // try {
  //   const result = await pool.query(
  //     `SELECT paquete_id, nombre, total_cartones, fecha_generacion
  //      FROM paquetes
  //      ORDER BY fecha_generacion DESC`
  //   );
  //   
  //   return result.rows.map(row => ({
  //     id: row.paquete_id,
  //     nombre: row.nombre,
  //     total_cartones: row.total_cartones,
  //     fecha_generacion: row.fecha_generacion,
  //   }));
  // } catch (error) {
  //   console.error('❌ Error al obtener paquetes:', error);
  //   throw error;
  // }
  
  // Por ahora retornamos array vacío
  return [];
}

// ============================================================================
// 🔴 JHONATHAN: FUNCIÓN 3 - OBTENER CARTONES DE UN PAQUETE
// ============================================================================
// Esta función debe retornar todos los cartones de un paquete específico
// ============================================================================

export async function obtenerCartonesPorPaquete(paqueteId: string): Promise<Carton[]> {
  console.log('🔴 JHONATHAN: Aquí debes obtener los cartones del paquete:', paqueteId);
  
  // ========================================================================
  // EJEMPLO CON PRISMA:
  // ========================================================================
  // try {
  //   const paquete = await prisma.paquete.findUnique({
  //     where: { paquete_id: paqueteId },
  //     include: {
  //       cartones: {
  //         orderBy: { numero_carton: 'asc' },
  //       },
  //     },
  //   });
  //   
  //   if (!paquete) {
  //     throw new Error(`Paquete ${paqueteId} no encontrado`);
  //   }
  //   
  //   return paquete.cartones.map(c => ({
  //     id: c.carton_id,
  //     serial: c.serial,
  //     numero_carton: c.numero_carton,
  //     numeros: {
  //       B: c.numeros_b as number[],
  //       I: c.numeros_i as number[],
  //       N: c.numeros_n as number[],
  //       G: c.numeros_g as number[],
  //       O: c.numeros_o as number[],
  //     },
  //     matriz: c.matriz as number[][],
  //   }));
  // } catch (error) {
  //   console.error('❌ Error al obtener cartones:', error);
  //   throw error;
  // }
  
  // ========================================================================
  // EJEMPLO CON PostgreSQL POOL (pg):
  // ========================================================================
  // try {
  //   const paqueteResult = await pool.query(
  //     'SELECT id FROM paquetes WHERE paquete_id = $1',
  //     [paqueteId]
  //   );
  //   
  //   if (paqueteResult.rows.length === 0) {
  //     throw new Error(`Paquete ${paqueteId} no encontrado`);
  //   }
  //   
  //   const paqueteDbId = paqueteResult.rows[0].id;
  //   
  //   const cartonesResult = await pool.query(
  //     `SELECT carton_id, numero_carton, serial, numeros_b, numeros_i, numeros_n, numeros_g, numeros_o, matriz
  //      FROM cartones
  //      WHERE paquete_id = $1
  //      ORDER BY numero_carton ASC`,
  //     [paqueteDbId]
  //   );
  //   
  //   return cartonesResult.rows.map(row => ({
  //     id: row.carton_id,
  //     serial: row.serial,
  //     numero_carton: row.numero_carton,
  //     numeros: {
  //       B: JSON.parse(row.numeros_b),
  //       I: JSON.parse(row.numeros_i),
  //       N: JSON.parse(row.numeros_n),
  //       G: JSON.parse(row.numeros_g),
  //       O: JSON.parse(row.numeros_o),
  //     },
  //     matriz: JSON.parse(row.matriz),
  //   }));
  // } catch (error) {
  //   console.error('❌ Error al obtener cartones:', error);
  //   throw error;
  // }
  
  // Por ahora retornamos array vacío
  return [];
}

// ============================================================================
// 🔴 JHONATHAN: FUNCIÓN 4 - VERIFICAR SI UN PAQUETE EXISTE
// ============================================================================

export async function paqueteExiste(paqueteId: string): Promise<boolean> {
  console.log('🔴 JHONATHAN: Aquí debes verificar si el paquete existe:', paqueteId);
  
  // ========================================================================
  // EJEMPLO CON PRISMA:
  // ========================================================================
  // try {
  //   const count = await prisma.paquete.count({
  //     where: { paquete_id: paqueteId },
  //   });
  //   return count > 0;
  // } catch (error) {
  //   console.error('❌ Error al verificar paquete:', error);
  //   return false;
  // }
  
  // ========================================================================
  // EJEMPLO CON PostgreSQL POOL (pg):
  // ========================================================================
  // try {
  //   const result = await pool.query(
  //     'SELECT COUNT(*) FROM paquetes WHERE paquete_id = $1',
  //     [paqueteId]
  //   );
  //   return parseInt(result.rows[0].count) > 0;
  // } catch (error) {
  //   console.error('❌ Error al verificar paquete:', error);
  //   return false;
  // }
  
  // Por ahora retornamos false
  return false;
}

// ============================================================================
// 🔴 JHONATHAN: NOTAS IMPORTANTES
// ============================================================================
// 1. Usa transacciones para garantizar que el paquete y sus cartones se guarden juntos
// 2. Maneja errores apropiadamente y haz rollback si algo falla
// 3. Considera usar índices en las columnas que se buscan frecuentemente
// 4. El campo JSON es útil para guardar arrays, pero asegúrate de que tu DB lo soporte
// 5. Prueba con pocos cartones primero antes de importar miles
// ============================================================================
