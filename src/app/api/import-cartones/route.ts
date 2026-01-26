import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

import { guardarPaqueteEnDB, paqueteExiste } from '@/lib/db-operations';

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

function parseFileToCartones(
  buffer: Buffer,
  nombrePaquete: string,
  serialDefault: string
): PaqueteCartones {
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
    console.log(`  Fila ${i + 1}: ${row.length} columnas`);
  });

  const cartones: Carton[] = [];
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);

  console.log('\n🎯 PROCESANDO CARTONES...');

  data.forEach((row, index) => {
    if (!row || row.length === 0) {
      return;
    }

    // Extraer serial (primera columna)
    const serialCarton = row[0] ? String(row[0]).trim() : serialDefault;

    // Extraer ID del cartón (segunda columna)
    const idCarton = row[1] ? parseInt(String(row[1])) : cartones.length + 1;

    // Extraer los números (desde la columna 2 en adelante)
    const numerosRaw = row.slice(2);
    const numeros: number[] = numerosRaw
      .filter((cell: any) => cell !== null && cell !== undefined && cell !== '')
      .map((cell: any) => {
        const num = typeof cell === 'number' ? cell : parseInt(String(cell));
        return isNaN(num) ? 0 : num;
      });

    // =====================================================================
    // SOPORTE PARA AMBOS FORMATOS: 24 o 25 números
    // =====================================================================
    let numeros25: number[];

    if (numeros.length === 24) {
      // Formato con 24 números: insertar 0 en la posición del centro (índice 12)
      numeros25 = [
        ...numeros.slice(0, 12), // Primeros 12 números
        0, // FREE en el centro
        ...numeros.slice(12), // Últimos 12 números
      ];
      console.log(
        `✅ Fila ${index + 1}: Cartón #${idCarton} - 24 números (FREE insertado automáticamente)`
      );
    } else if (numeros.length === 25) {
      // Formato con 25 números: usar tal cual, asegurar que el centro sea 0
      numeros25 = [...numeros];
      numeros25[12] = 0; // Forzar FREE en el centro
      console.log(`✅ Fila ${index + 1}: Cartón #${idCarton} - 25 números`);
    } else {
      console.warn(
        `❌ Fila ${index + 1}: Tiene ${numeros.length} números (se requieren 24 o 25), se omite`
      );
      return;
    }

    // Crear matriz 5x5
    const matriz: number[][] = [];
    for (let i = 0; i < 5; i++) {
      matriz.push(numeros25.slice(i * 5, (i + 1) * 5));
    }

    // Crear objeto de números por columna BINGO
    const cartonNumeros: CartonNumeros = {
      B: [matriz[0][0], matriz[1][0], matriz[2][0], matriz[3][0], matriz[4][0]],
      I: [matriz[0][1], matriz[1][1], matriz[2][1], matriz[3][1], matriz[4][1]],
      N: [matriz[0][2], matriz[1][2], 0, matriz[3][2], matriz[4][2]],
      G: [matriz[0][3], matriz[1][3], matriz[2][3], matriz[3][3], matriz[4][3]],
      O: [matriz[0][4], matriz[1][4], matriz[2][4], matriz[3][4], matriz[4][4]],
    };

    const carton: Carton = {
      id: `carton-${timestamp}-${randomId}-${idCarton}`,
      serial: serialCarton,
      numero_carton: idCarton,
      numeros: cartonNumeros,
      matriz: matriz,
    };

    cartones.push(carton);
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
  console.log('========================================\n');

  return paquete;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const nombrePaquete = formData.get('nombre') as string;
    const serial = (formData.get('serial') as string) || 'BINGO';

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const paquete = parseFileToCartones(buffer, nombrePaquete, serial);

    if (paquete.total_cartones === 0) {
      return NextResponse.json(
        {
          error:
            'No se encontraron cartones válidos en el archivo. Verifica que cada fila tenga 24 o 25 números.',
        },
        { status: 400 }
      );
    }

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

    await guardarPaqueteEnDB(paquete);

    console.log('✅ Paquete guardado exitosamente en la base de datos');
    console.log('========================================\n');

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
    return NextResponse.json({ error: 'Error al procesar el archivo XLSX/CSV' }, { status: 500 });
  }
}
