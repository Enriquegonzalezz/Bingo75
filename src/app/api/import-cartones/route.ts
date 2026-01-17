import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
// import { promises as fs } from 'fs'; // ❌ YA NO USAMOS FILESYSTEM
// import path from 'path'; // ❌ YA NO USAMOS FILESYSTEM

// ============================================================================
// 🔴 JHONATHAN: IMPORTA LAS FUNCIONES DE BASE DE DATOS
// ============================================================================
import { guardarPaqueteEnDB, paqueteExiste } from '@/lib/db-operations';
// ============================================================================

interface CartonNumeros {
  B: number[];
  I: number[];
  N: number[];
  G: number[];
  O: number[];
}

interface Carton {
  id: string;
  serial: string;
  numero_carton: number;
  numeros: CartonNumeros;
  matriz: number[][];
}

interface PaqueteCartones {
  version: string;
  paquete_id: string;
  nombre: string;
  fecha_generacion: string;
  total_cartones: number;
  descripcion: string;
  cartones: Carton[];
}

function parseFileToCartones(buffer: Buffer, nombrePaquete: string, serialDefault: string): PaqueteCartones {
  console.log('\n========================================');
  console.log('🔵 INICIO DE PROCESAMIENTO DE ARCHIVO');
  console.log('========================================');
  console.log('📦 Nombre del paquete:', nombrePaquete);
  console.log('🏷️  Serial por defecto:', serialDefault);
  console.log('📄 Tamaño del buffer:', buffer.length, 'bytes');
  
  const workbook = XLSX.read(buffer, { type: 'buffer', raw: true });
  console.log('\n📊 Archivo Excel/CSV leído exitosamente');
  console.log('📑 Hojas disponibles:', workbook.SheetNames);
  
  const sheetName = workbook.SheetNames[0];
  console.log('✅ Usando hoja:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: null });
  
  console.log('\n📋 DATOS EXTRAÍDOS DEL ARCHIVO:');
  console.log('Total de filas:', data.length);
  console.log('\n🔍 Primeras 3 filas (raw):');
  data.slice(0, 3).forEach((row, i) => {
    console.log(`  Fila ${i + 1}:`, row);
    console.log(`    - Longitud: ${row.length}`);
    console.log(`    - Valores: [${row.join(', ')}]`);
  });

  const cartones: Carton[] = [];
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  
  console.log('\n🎯 PROCESANDO CARTONES...');

  data.forEach((row, index) => {
    if (!row || row.length === 0) {
      console.log(`⚠️  Fila ${index + 1}: Vacía, se omite`);
      return;
    }

    // Formato esperado: [Serial, ID, ...25 números]
    // Ejemplo: BINGO CARABOBO,2,6,14,3,10,13,30,17,22,21,28,37,45,40,35,50,51,54,58,56,63,69,75,62,70
    
    // Extraer serial (primera columna, puede ser texto)
    const serialCarton = row[0] ? String(row[0]).trim() : serialDefault;
    
    // Extraer ID del cartón (segunda columna)
    const idCarton = row[1] ? parseInt(String(row[1])) : cartones.length + 1;
    
    // Extraer los 25 números (desde la columna 2 en adelante)
    const numerosRaw = row.slice(2);
    const numeros: number[] = numerosRaw
      .filter((cell) => cell !== null && cell !== undefined && cell !== '')
      .map(cell => {
        const num = typeof cell === 'number' ? cell : parseInt(String(cell));
        return isNaN(num) ? 0 : num;
      });
    
    console.log(`\n✅ Fila ${index + 1}: Procesando cartón`);
    console.log(`   Serial: "${serialCarton}"`);
    console.log(`   ID: ${idCarton}`);
    console.log(`   Números extraídos: ${numeros.length}`);
    console.log(`   Números:`, numeros);
    
    // Validar que tenga exactamente 25 números
    if (numeros.length !== 25) {
      console.warn(`❌ Fila ${index + 1}: Tiene ${numeros.length} números (se requieren 25), se omite`);
      console.warn(`   Formato esperado: Serial, ID, 25 números`);
      console.warn(`   Ejemplo: BINGO CARABOBO,2,6,14,3,10,13,30,17,22,21,28,37,45,40,35,50,51,54,58,56,63,69,75,62,70`);
      return;
    }

    const matriz: number[][] = [];
    for (let i = 0; i < 5; i++) {
      matriz.push(numeros.slice(i * 5, (i + 1) * 5));
    }
    
    console.log('   📐 Matriz 5x5 creada:');
    matriz.forEach((fila, i) => {
      console.log(`      Fila ${i + 1}: [${fila.join(', ')}]`);
    });

    matriz[2][2] = 0;
    console.log('   🎯 Cuadro libre establecido en [2][2] = 0');

    const cartonNumeros: CartonNumeros = {
      B: [matriz[0][0], matriz[1][0], matriz[2][0], matriz[3][0], matriz[4][0]],
      I: [matriz[0][1], matriz[1][1], matriz[2][1], matriz[3][1], matriz[4][1]],
      N: [matriz[0][2], matriz[1][2], 0, matriz[3][2], matriz[4][2]],
      G: [matriz[0][3], matriz[1][3], matriz[2][3], matriz[3][3], matriz[4][3]],
      O: [matriz[0][4], matriz[1][4], matriz[2][4], matriz[3][4], matriz[4][4]],
    };
    
    console.log('   🔤 Columnas BINGO:');
    console.log('      B:', cartonNumeros.B);
    console.log('      I:', cartonNumeros.I);
    console.log('      N:', cartonNumeros.N);
    console.log('      G:', cartonNumeros.G);
    console.log('      O:', cartonNumeros.O);

    const carton: Carton = {
      id: `carton-${timestamp}-${randomId}-${idCarton}`,
      serial: serialCarton,
      numero_carton: idCarton,
      numeros: cartonNumeros,
      matriz: matriz,
    };
    
    console.log('   ✨ Cartón creado:');
    console.log('      ID:', carton.id);
    console.log('      Número:', carton.numero_carton);
    console.log('      Serial:', carton.serial);

    cartones.push(carton);
    console.log(`   ✅ Cartón #${carton.numero_carton} agregado al paquete`);
  });

  console.log('\n========================================');
  console.log('📦 RESUMEN DEL PAQUETE');
  console.log('========================================');
  
  const paqueteId = `paquete-${nombrePaquete.toLowerCase().replace(/\s+/g, '-')}`;
  
  const paquete: PaqueteCartones = {
    version: '1.0',
    paquete_id: paqueteId,
    nombre: nombrePaquete,
    fecha_generacion: new Date().toISOString(),
    total_cartones: cartones.length,
    descripcion: `Paquete ${nombrePaquete} - ${cartones.length} cartones únicos de Bingo`,
    cartones: cartones,
  };
  
  console.log('✅ Paquete ID:', paquete.paquete_id);
  console.log('✅ Nombre:', paquete.nombre);
  console.log('✅ Total de cartones procesados:', paquete.total_cartones);
  console.log('✅ Fecha de generación:', paquete.fecha_generacion);
  console.log('\n🎯 PRIMER CARTÓN DEL PAQUETE (ejemplo):');
  if (cartones.length > 0) {
    console.log(JSON.stringify(cartones[0], null, 2));
  }
  console.log('========================================\n');

  return paquete;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const nombrePaquete = formData.get('nombre') as string;
    const serial = formData.get('serial') as string || 'BINGO';

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    if (!nombrePaquete) {
      return NextResponse.json(
        { error: 'No se proporcionó el nombre del paquete' },
        { status: 400 }
      );
    }

    console.log('\n🚀 INICIANDO IMPORTACIÓN');
    console.log('📁 Archivo:', file.name);
    console.log('📏 Tamaño:', file.size, 'bytes');
    console.log('📋 Tipo:', file.type);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const paquete = parseFileToCartones(buffer, nombrePaquete, serial);

    // ========================================================================
    // 🔴 JHONATHAN: AQUÍ ES DONDE SE GUARDA EN LA BASE DE DATOS
    // ========================================================================
    // El paquete ya está procesado con todos sus cartones
    // Ahora debes guardarlo en la base de datos SQL
    // ========================================================================
    
    console.log('\n💾 GUARDANDO EN BASE DE DATOS...');
    console.log('📦 Paquete ID:', paquete.paquete_id);
    console.log('📊 Total de cartones:', paquete.total_cartones);
    
    // Verificar si el paquete ya existe
    const existe = await paqueteExiste(paquete.paquete_id);
    if (existe) {
      console.log('⚠️  El paquete ya existe en la base de datos');
      return NextResponse.json(
        { error: `El paquete "${nombrePaquete}" ya existe. Usa otro nombre.` },
        { status: 400 }
      );
    }
    
    // 🔴 JHONATHAN: Esta función guarda el paquete y todos sus cartones en la DB
    await guardarPaqueteEnDB(paquete);
    
    console.log('✅ Paquete guardado exitosamente en la base de datos');
    console.log('========================================\n');
    
    // ========================================================================
    // ❌ CÓDIGO VIEJO (FILESYSTEM) - YA NO SE USA
    // ========================================================================
    // const paquetesDir = path.join(process.cwd(), 'src', 'shared', 'constants', 'paquetes-cartones');
    // await fs.mkdir(paquetesDir, { recursive: true });
    // const fileName = `${paquete.paquete_id}.json`;
    // const filePath = path.join(paquetesDir, fileName);
    // await fs.writeFile(filePath, JSON.stringify(paquete, null, 2), 'utf-8');
    // ========================================================================

    return NextResponse.json({
      success: true,
      message: 'Paquete de cartones importado exitosamente',
      paquete: {
        id: paquete.paquete_id,
        nombre: paquete.nombre,
        total_cartones: paquete.total_cartones,
        fecha_generacion: paquete.fecha_generacion,
      },
    });
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo XLSX/CSV' },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🔴 JHONATHAN: ENDPOINT GET - LISTAR PAQUETES DESDE LA BASE DE DATOS
// ============================================================================
// Este endpoint debe retornar todos los paquetes guardados en la base de datos
// Solo necesita información básica, no los cartones completos
// ============================================================================
export async function GET() {
  try {
    console.log('📋 Obteniendo lista de paquetes desde la base de datos...');
    
    // 🔴 JHONATHAN: Esta función obtiene todos los paquetes de la DB
    // const paquetes = await obtenerTodosPaquetes();
    
    // Por ahora retornamos array vacío hasta que implementes la DB
    const paquetes: any[] = [];
    
    console.log(`✅ Se encontraron ${paquetes.length} paquetes`);
    
    return NextResponse.json({ paquetes });
    
    // ========================================================================
    // ❌ CÓDIGO VIEJO (FILESYSTEM) - YA NO SE USA
    // ========================================================================
    // const paquetesDir = path.join(process.cwd(), 'src', 'shared', 'constants', 'paquetes-cartones');
    // const files = await fs.readdir(paquetesDir);
    // const jsonFiles = files.filter(file => file.endsWith('.json'));
    // const paquetes = await Promise.all(
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
  } catch (error) {
    console.error('❌ Error al listar paquetes:', error);
    return NextResponse.json(
      { error: 'Error al listar paquetes' },
      { status: 500 }
    );
  }
}
