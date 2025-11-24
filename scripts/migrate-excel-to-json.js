const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function getLetraFromNumber(numero) {
  if (numero >= 1 && numero <= 15) return 'B';
  if (numero >= 16 && numero <= 30) return 'I';
  if (numero >= 31 && numero <= 45) return 'N';
  if (numero >= 46 && numero <= 60) return 'G';
  if (numero >= 61 && numero <= 75) return 'O';
  return 'B';
}

function migrateExcelToJson(excelPath, outputPath) {
  console.log('🚀 Iniciando migración de Excel a JSON...\n');

  // Leer archivo Excel
  const workbook = XLSX.readFile(excelPath);

  // Obtener hoja "Tabla Cart" (o el nombre que tenga)
  const sheetNames = workbook.SheetNames;
  console.log('📋 Hojas encontradas:', sheetNames.join(', '));

  // Buscar la hoja que contiene cartones
  const sheetName = sheetNames.find(
    (name) =>
      name.toLowerCase().includes('cart') ||
      name.toLowerCase().includes('tabla') ||
      name.toLowerCase().includes('datos')
  );

  if (!sheetName) {
    throw new Error('No se encontró una hoja con cartones (buscar "Tabla Cart", "Datos", etc.)');
  }

  console.log(`✅ Usando hoja: "${sheetName}"\n`);

  const worksheet = workbook.Sheets[sheetName];

  // Convertir a JSON
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`📊 Total de filas encontradas: ${data.length}\n`);

  // Transformar datos al formato esperado
  const cartones = data.map((row, index) => {
    // Extraer números de cada columna
    const B = [row.B1, row.B2, row.B3, row.B4, row.B5].filter((n) => n != null);
    const I = [row.I1, row.I2, row.I3, row.I4, row.I5].filter((n) => n != null);
    const N = [row.N1, row.N2, 0, row.N4, row.N5].filter((n, i) => i !== 2 || n === 0); // FREE en centro
    const G = [row.G1, row.G2, row.G3, row.G4, row.G5].filter((n) => n != null);
    const O = [row.O1, row.O2, row.O3, row.O4, row.O5].filter((n) => n != null);

    // Si no tiene columnas B, I, N, G, O, intentar con estructura alternativa
    const numeros =
      B.length > 0
        ? { B, I, N, G, O }
        : {
            B: [row.Col0_0, row.Col0_1, row.Col0_2, row.Col0_3, row.Col0_4],
            I: [row.Col1_0, row.Col1_1, row.Col1_2, row.Col1_3, row.Col1_4],
            N: [row.Col2_0, row.Col2_1, 0, row.Col2_3, row.Col2_4],
            G: [row.Col3_0, row.Col3_1, row.Col3_2, row.Col3_3, row.Col3_4],
            O: [row.Col4_0, row.Col4_1, row.Col4_2, row.Col4_3, row.Col4_4],
          };

    const matriz = [
      [numeros.B[0], numeros.I[0], numeros.N[0], numeros.G[0], numeros.O[0]],
      [numeros.B[1], numeros.I[1], numeros.N[1], numeros.G[1], numeros.O[1]],
      [numeros.B[2], numeros.I[2], 0, numeros.G[2], numeros.O[2]],
      [numeros.B[3], numeros.I[3], numeros.N[3], numeros.G[3], numeros.O[3]],
      [numeros.B[4], numeros.I[4], numeros.N[4], numeros.G[4], numeros.O[4]],
    ];

    return {
      id: `carton-${Date.now()}-${index}`,
      serial: row.Serial || row.serie || 'BINGO CARABOBO',
      numero_carton: row.Numero || row.numero || index + 1,
      numeros,
      matriz,
      fecha_creacion: new Date().toISOString(),
      activo: true,
    };
  });

  // Validar que los cartones tengan datos válidos
  const cartonesValidos = cartones.filter((c) => {
    const todosNumeros = [
      ...c.numeros.B,
      ...c.numeros.I,
      ...c.numeros.N.filter((n) => n !== 0),
      ...c.numeros.G,
      ...c.numeros.O,
    ];
    return todosNumeros.every((n) => typeof n === 'number' && n > 0 && n <= 75);
  });

  console.log(`✅ Cartones válidos: ${cartonesValidos.length}/${cartones.length}\n`);

  // Crear estructura final
  const output = {
    version: '1.0',
    fecha_migracion: new Date().toISOString(),
    total_cartones: cartonesValidos.length,
    cartones: cartonesValidos,
  };

  // Crear directorio si no existe
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Escribir JSON
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`✅ Migración completada exitosamente!`);
  console.log(`📁 Archivo guardado en: ${outputPath}`);
  console.log(`📊 Total de cartones migrados: ${cartonesValidos.length}\n`);

  // Estadísticas
  console.log('📈 Estadísticas:');
  console.log(`   - Cartones únicos: ${new Set(cartonesValidos.map((c) => c.numero_carton)).size}`);
  console.log(`   - Seriales diferentes: ${new Set(cartonesValidos.map((c) => c.serial)).size}`);
}

// Ejecutar
const excelPath = process.argv[2] || './Bingo_75_Autoguardado.xlsm';
const outputPath = process.argv[3] || './src/infrastructure/data/cartones-migrados.json';

try {
  migrateExcelToJson(excelPath, outputPath);
} catch (error) {
  console.error('❌ Error durante la migración:', error.message);
  process.exit(1);
}
