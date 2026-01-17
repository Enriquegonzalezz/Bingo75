# 🔍 DEBUG: Importación de Cartones - Guía Completa

## 📍 1. ¿DÓNDE ESTÁ EL BACKEND?

### ❌ NO HAY BASE DE DATOS SQL
Este proyecto **NO usa SQL, PostgreSQL, MySQL ni Prisma**. Los cartones se guardan como archivos JSON en el filesystem.

### ✅ Backend de Importación
**Ubicación:** `src/app/api/import-cartones/route.ts`

**Función principal:** `parseFileToCartones()`
- Lee el archivo Excel/CSV
- Convierte cada fila en un cartón
- Guarda el resultado como JSON

### 💾 Dónde se Guardan los Cartones
```
src/shared/constants/paquetes-cartones/
├── paquete-original.json
├── paquete-alpha.json
├── paquete-beta.json
├── paquete-gamma.json
├── paquete-delta.json
└── paquete-{tu-nombre}.json  ← AQUÍ SE GUARDAN LOS IMPORTADOS
```

## 📊 2. CÓMO VER EL PROCESO (Console Logs)

### Paso 1: Abre la Terminal del Servidor
Cuando ejecutes `npm run dev`, verás los logs en la terminal donde corre Next.js.

### Paso 2: Importa un Archivo
Ve a `/importar` y sube tu CSV/Excel.

### Paso 3: Observa los Logs
Verás algo como esto en la terminal:

```
🚀 INICIANDO IMPORTACIÓN
📁 Archivo: cartones.csv
📏 Tamaño: 2048 bytes
📋 Tipo: text/csv

========================================
🔵 INICIO DE PROCESAMIENTO DE ARCHIVO
========================================
📦 Nombre del paquete: Mi Paquete Test
🏷️  Serial: BINGO
📄 Tamaño del buffer: 2048 bytes

📊 Archivo Excel/CSV leído exitosamente
📑 Hojas disponibles: [ 'Sheet1' ]
✅ Usando hoja: Sheet1

📋 DATOS EXTRAÍDOS DEL ARCHIVO:
Total de filas: 10

🔍 Primeras 3 filas (raw):
  Fila 1: [ 7, 30, 33, 54, 63, 12, 19, 36, 56, 66, 1, 20, 45, 48, 72, 5, 25, 37, 55, 73, 6, 22, 35, 60, 62 ]
    - Longitud: 25
    - Valores: [7, 30, 33, 54, 63, 12, 19, 36, 56, 66, 1, 20, 45, 48, 72, 5, 25, 37, 55, 73, 6, 22, 35, 60, 62]
  Fila 2: [ 9, 18, 34, 53, 61, 12, 30, 44, 51, 75, 7, 19, 43, 46, 71, 10, 27, 31, 54, 63, 15, 17, 52, 70, 70 ]
    - Longitud: 25
    - Valores: [9, 18, 34, 53, 61, 12, 30, 44, 51, 75, 7, 19, 43, 46, 71, 10, 27, 31, 54, 63, 15, 17, 52, 70, 70]

🎯 PROCESANDO CARTONES...

✅ Fila 1: Procesando cartón #1
   25 números válidos: [ 7, 30, 33, 54, 63, 12, 19, 36, 56, 66, 1, 20, 45, 48, 72, 5, 25, 37, 55, 73, 6, 22, 35, 60, 62 ]
   📐 Matriz 5x5 creada:
      Fila 1: [7, 30, 33, 54, 63]
      Fila 2: [12, 19, 36, 56, 66]
      Fila 3: [1, 20, 45, 48, 72]
      Fila 4: [5, 25, 37, 55, 73]
      Fila 5: [6, 22, 35, 60, 62]
   🎯 Cuadro libre establecido en [2][2] = 0
   🔤 Columnas BINGO:
      B: [ 7, 12, 1, 5, 6 ]
      I: [ 30, 19, 20, 25, 22 ]
      N: [ 33, 36, 0, 37, 35 ]
      G: [ 54, 56, 48, 55, 60 ]
      O: [ 63, 66, 72, 73, 62 ]
   ✨ Cartón creado:
      ID: carton-1737154800000-12345-1
      Número: 1
      Serial: BINGO
   ✅ Cartón #1 agregado al paquete

========================================
📦 RESUMEN DEL PAQUETE
========================================
✅ Paquete ID: paquete-mi-paquete-test
✅ Nombre: Mi Paquete Test
✅ Total de cartones procesados: 10
✅ Fecha de generación: 2026-01-17T21:00:00.000Z

🎯 PRIMER CARTÓN DEL PAQUETE (ejemplo):
{
  "id": "carton-1737154800000-12345-1",
  "serial": "BINGO",
  "numero_carton": 1,
  "numeros": {
    "B": [7, 12, 1, 5, 6],
    "I": [30, 19, 20, 25, 22],
    "N": [33, 36, 0, 37, 35],
    "G": [54, 56, 48, 55, 60],
    "O": [63, 66, 72, 73, 62]
  },
  "matriz": [
    [7, 30, 33, 54, 63],
    [12, 19, 36, 56, 66],
    [1, 20, 0, 48, 72],
    [5, 25, 37, 55, 73],
    [6, 22, 35, 60, 62]
  ]
}
========================================

💾 GUARDANDO ARCHIVO JSON...
📂 Directorio: C:\Users\guzen\Desktop\bingo75\src\shared\constants\paquetes-cartones
📄 Archivo: paquete-mi-paquete-test.json
🗂️  Ruta completa: C:\Users\guzen\Desktop\bingo75\src\shared\constants\paquetes-cartones\paquete-mi-paquete-test.json
✅ Archivo JSON guardado exitosamente
========================================
```

## 🎯 3. PASO A PASO: CÓMO SE PROCESA EL CSV

### Entrada: CSV con Serial, ID y 25 números por fila
```csv
BINGO CARABOBO,1,7,30,33,54,63,12,19,36,56,66,1,20,45,48,72,5,25,37,55,73,6,22,35,60,62
BINGO CARABOBO,2,6,14,3,10,13,30,17,22,21,28,37,45,40,35,50,51,54,58,56,63,69,75,62,70
```

**Formato de cada fila:**
- Columna 1: Serial del cartón (texto)
- Columna 2: ID/Número del cartón (número)
- Columnas 3-27: Los 25 números del cartón

### Paso 1: Lectura del Archivo
- Se lee el CSV/Excel con la librería `xlsx`
- Se convierte a un array de arrays: `[["BINGO CARABOBO", 1, 7, 30, 33, ...], ["BINGO CARABOBO", 2, 6, 14, 3, ...]]`

### Paso 2: Extracción de Datos
Para cada fila:
- **Columna 0**: Se extrae el Serial (ej: "BINGO CARABOBO")
- **Columna 1**: Se extrae el ID del cartón (ej: 1, 2, 3...)
- **Columnas 2-26**: Se extraen los 25 números del cartón

### Paso 3: Validación
- Se verifica que tenga exactamente 25 números (después del Serial y el ID)
- Si tiene menos o más, se omite y se muestra un warning con el formato esperado

### Paso 4: Creación de la Matriz 5x5
Los 25 números se organizan en 5 filas de 5 columnas:
```
Posiciones:  1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25
             ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓
Matriz:     [7, 30, 33, 54, 63]  ← Fila 1
            [12, 19, 36, 56, 66]  ← Fila 2
            [1, 20, 45, 48, 72]   ← Fila 3
            [5, 25, 37, 55, 73]   ← Fila 4
            [6, 22, 35, 60, 62]   ← Fila 5
```

### Paso 4: Establecer Cuadro Libre
- La posición [2][2] (centro) se establece en 0
- Esto es el "FREE" del bingo

```
[7, 30, 33, 54, 63]
[12, 19, 36, 56, 66]
[1, 20,  0, 48, 72]  ← El 45 se reemplaza por 0
[5, 25, 37, 55, 73]
[6, 22, 35, 60, 62]
```

### Paso 5: Organizar por Columnas BINGO
Se extraen las columnas verticales:
```
B (col 0): [7, 12, 1, 5, 6]      ← Primera columna
I (col 1): [30, 19, 20, 25, 22]  ← Segunda columna
N (col 2): [33, 36, 0, 37, 35]   ← Tercera columna (con FREE=0)
G (col 3): [54, 56, 48, 55, 60]  ← Cuarta columna
O (col 4): [63, 66, 72, 73, 62]  ← Quinta columna
```

### Paso 6: Crear Objeto Cartón
```javascript
{
  id: "carton-1737154800000-12345-1",
  serial: "BINGO",
  numero_carton: 1,
  numeros: {
    B: [7, 12, 1, 5, 6],
    I: [30, 19, 20, 25, 22],
    N: [33, 36, 0, 37, 35],
    G: [54, 56, 48, 55, 60],
    O: [63, 66, 72, 73, 62]
  },
  matriz: [
    [7, 30, 33, 54, 63],
    [12, 19, 36, 56, 66],
    [1, 20, 0, 48, 72],
    [5, 25, 37, 55, 73],
    [6, 22, 35, 60, 62]
  ]
}
```

### Paso 7: Guardar en JSON
El paquete completo se guarda en:
```
src/shared/constants/paquetes-cartones/paquete-{nombre}.json
```

## 🔧 4. CÓMO DEBUGGEAR

### Opción 1: Ver Logs en Terminal
1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000/importar`
3. Sube tu CSV/Excel
4. **Mira la terminal** donde corre Next.js (NO el navegador)
5. Verás todos los logs detallados

### Opción 2: Ver el JSON Generado
1. Después de importar, ve a:
   ```
   src/shared/constants/paquetes-cartones/
   ```
2. Abre el archivo JSON generado
3. Verás todos los cartones procesados

### Opción 3: Ver en el Sistema
1. Ve a `/cartones`
2. Selecciona tu paquete importado
3. Verás todos los cartones renderizados

## ⚠️ 5. PROBLEMAS COMUNES

### Problema: "No tiene 25 números"
**Causa:** Tu CSV tiene más o menos de 25 números por fila
**Solución:** Verifica que cada fila tenga exactamente 25 números

### Problema: "No se ve en /cartones"
**Causa:** El archivo JSON no se guardó correctamente
**Solución:** 
1. Revisa los logs en la terminal
2. Verifica que el archivo existe en `paquetes-cartones/`
3. Recarga la página `/cartones`

### Problema: "Números incorrectos"
**Causa:** El CSV tiene formato incorrecto
**Solución:** 
1. Revisa los logs "Primeras 3 filas (raw)"
2. Asegúrate de que los números estén separados por comas
3. No debe haber encabezados en el CSV

## 📝 6. FORMATO CORRECTO DEL CSV

### ✅ CORRECTO:
```csv
BINGO CARABOBO,1,7,30,33,54,63,12,19,36,56,66,1,20,45,48,72,5,25,37,55,73,6,22,35,60,62
BINGO CARABOBO,2,6,14,3,10,13,30,17,22,21,28,37,45,40,35,50,51,54,58,56,63,69,75,62,70
BINGO CARABOBO,3,9,18,34,53,61,12,30,44,51,75,7,19,43,46,71,10,27,31,54,63,15,17,52,70,70
```

**Formato:** `Serial,ID,Num1,Num2,...,Num25`

### ❌ INCORRECTO (sin Serial e ID):
```csv
7,30,33,54,63,12,19,36,56,66,1,20,45,48,72,5,25,37,55,73,6,22,35,60,62
```

### ❌ INCORRECTO (con encabezados):
```csv
Serial,ID,B1,I1,N1,G1,O1,B2,I2,N2,G2,O2,B3,I3,N3,G3,O3,B4,I4,N4,G4,O4,B5,I5,N5,G5,O5
BINGO CARABOBO,1,7,30,33,54,63,12,19,36,56,66,1,20,45,48,72,5,25,37,55,73,6,22,35,60,62
```

### ❌ INCORRECTO (menos de 25 números):
```csv
BINGO CARABOBO,1,7,30,33,54,63,12,19,36,56,66,1,20,45,48,72
```

## 🎯 7. RESUMEN

1. **NO hay SQL** - Todo se guarda en JSON
2. **Backend:** `src/app/api/import-cartones/route.ts`
3. **Logs:** Se ven en la terminal del servidor (no en el navegador)
4. **Formato:** 25 números por fila, sin encabezados
5. **Resultado:** Archivo JSON en `paquetes-cartones/`
6. **Visualización:** Ve a `/cartones` para ver los cartones importados

## 🚀 PRÓXIMOS PASOS

1. Ejecuta `npm run dev`
2. Abre la terminal y déjala visible
3. Ve a `http://localhost:3000/importar`
4. Sube un CSV de prueba
5. **Observa la terminal** - verás todos los logs detallados
6. Revisa el JSON generado en `paquetes-cartones/`
7. Ve a `/cartones` y selecciona tu paquete
