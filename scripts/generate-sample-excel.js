const XLSX = require('xlsx');

function generateSampleCartones(cantidad = 10) {
  const cartones = [];

  for (let i = 0; i < cantidad; i++) {
    const carton = [];
    
    for (let fila = 0; fila < 5; fila++) {
      for (let col = 0; col < 5; col++) {
        let numero;
        
        if (col === 0) {
          numero = Math.floor(Math.random() * 15) + 1;
        } else if (col === 1) {
          numero = Math.floor(Math.random() * 15) + 16;
        } else if (col === 2) {
          numero = Math.floor(Math.random() * 15) + 31;
        } else if (col === 3) {
          numero = Math.floor(Math.random() * 15) + 46;
        } else {
          numero = Math.floor(Math.random() * 15) + 61;
        }
        
        carton.push(numero);
      }
    }
    
    cartones.push(carton);
  }

  return cartones;
}

const cartones = generateSampleCartones(10);

const worksheet = XLSX.utils.aoa_to_sheet(cartones);

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Cartones');

XLSX.writeFile(workbook, 'ejemplo-cartones-bingo.xlsx');

console.log('✅ Archivo de ejemplo generado: ejemplo-cartones-bingo.xlsx');
console.log(`📊 Total de cartones: ${cartones.length}`);
console.log('📝 Formato: Cada fila = 1 cartón con 25 números');
