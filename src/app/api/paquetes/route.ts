import { NextResponse } from 'next/server';
// import { promises as fs } from 'fs'; // ❌ YA NO USAMOS FILESYSTEM
// import path from 'path'; // ❌ YA NO USAMOS FILESYSTEM

// ============================================================================
// 🔴 JHONATHAN: IMPORTA LAS FUNCIONES DE BASE DE DATOS
// ============================================================================
import { obtenerTodosPaquetes } from '@/lib/db-operations';
// ============================================================================

interface PaqueteInfo {
  id: string;
  nombre: string;
  total_cartones: number;
  fecha_generacion?: string;
}

// ============================================================================
// 🔴 JHONATHAN: ENDPOINT PRINCIPAL PARA OBTENER TODOS LOS PAQUETES
// ============================================================================
// Este endpoint es usado por:
// - La página de cartones (/cartones) para mostrar el selector de paquetes
// - El modal de configuración para el dropdown de paquetes
// - La página de importar para listar los paquetes importados
// ============================================================================
export async function GET() {
  try {
    console.log('📋 Obteniendo todos los paquetes desde la base de datos...');
    
    // 🔴 JHONATHAN: Esta función obtiene todos los paquetes de la DB
    // Descomenta la siguiente línea cuando implementes la base de datos:
    // const paquetes: PaqueteInfo[] = await obtenerTodosPaquetes();
    
    // Por ahora retornamos array vacío hasta que implementes la DB
    const paquetes: PaqueteInfo[] = [];
    
    // ========================================================================
    // ❌ CÓDIGO VIEJO (FILESYSTEM) - YA NO SE USA
    // ========================================================================
    // const paquetesDir = path.join(process.cwd(), 'src', 'shared', 'constants', 'paquetes-cartones');
    // const files = await fs.readdir(paquetesDir);
    // const jsonFiles = files.filter(file => file.endsWith('.json'));
    // const paquetes: PaqueteInfo[] = await Promise.all(
    //   jsonFiles.map(async (file) => {
    //     const filePath = path.join(paquetesDir, file);
    //     const content = await fs.readFile(filePath, 'utf-8');
    //     const paquete = JSON.parse(content);
    //     return {
    //       id: paquete.paquete_id,
    //       nombre: paquete.nombre,
    //       total_cartones: paquete.total_cartones,
    //       fecha_generacion: paquete.fecha_generacion,
    //     };
    //   })
    // );
    // ========================================================================

    // Ordenar paquetes: primero los predefinidos, luego los importados
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
    return NextResponse.json(
      { error: 'Error al listar paquetes' },
      { status: 500 }
    );
  }
}
