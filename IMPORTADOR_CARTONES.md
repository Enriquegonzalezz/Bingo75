# Importador de Cartones desde Excel/CSV

## Descripción

Sistema completo para importar cartones de bingo desde archivos Excel (.xlsx/.xls) o CSV (.csv). Los cartones importados se almacenan permanentemente en el sistema y pueden ser utilizados en los sorteos.

## Características

- ✅ Importación de archivos Excel (.xlsx, .xls) y CSV (.csv)
- ✅ Conversión automática de filas a cartones de bingo
- ✅ Configuración del cuadro libre automático en posición [2][2]
- ✅ Almacenamiento permanente en el sistema de archivos
- ✅ Asignación de nombres personalizados a los paquetes
- ✅ Visualización de todos los paquetes importados
- ✅ Interfaz intuitiva con validaciones

## Formato del Archivo Excel/CSV

### Estructura Requerida

Cada **fila** del archivo (Excel o CSV) representa un cartón de bingo completo con el siguiente formato:

```csv
Columna 1: Serial del cartón (texto, ej: "BINGO CARABOBO")
Columna 2: ID/Número del cartón (número entero)
Columnas 3-27: 25 números del cartón
```

Los 25 números están organizados así:
```csv
Posiciones 3-7:   B (números del 1-15)
Posiciones 8-12:  I (números del 16-30)
Posiciones 13-17: N (números del 31-45)
Posiciones 18-22: G (números del 46-60)
Posiciones 23-27: O (números del 61-75)
```

**IMPORTANTE:** El cuadro del centro (posición 15, columna N) se establece automáticamente en 0 (FREE).

### Ejemplo de CSV:

```csv
BINGO CARABOBO,1,7,30,33,54,63,12,19,36,56,66,1,20,45,48,72,5,25,37,55,73,6,22,35,60,62
BINGO CARABOBO,2,6,14,3,10,13,30,17,22,21,28,37,45,40,35,50,51,54,58,56,63,69,75,62,70
BINGO CARABOBO,3,9,18,34,53,61,12,30,44,51,75,7,19,43,46,71,10,27,31,54,63,15,17,52,70,70
```

### Ejemplo de Excel:

| Serial | ID | B1 | I1 | N1 | G1 | O1 | B2 | I2 | N2 | G2 | O2 | B3 | I3 | N3 | G3 | O3 | B4 | I4 | N4 | G4 | O4 | B5 | I5 | N5 | G5 | O5 |
|--------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| BINGO CARABOBO | 1 | 7 | 30 | 33 | 54 | 63 | 12 | 19 | 36 | 56 | 66 | 1 | 20 | 45 | 48 | 72 | 5 | 25 | 37 | 55 | 73 | 6 | 22 | 35 | 60 | 62 |
| BINGO CARABOBO | 2 | 6 | 14 | 3 | 10 | 13 | 30 | 17 | 22 | 21 | 28 | 37 | 45 | 40 | 35 | 50 | 51 | 54 | 58 | 56 | 63 | 69 | 75 | 62 | 70 |...
```

### Distribución en el Cartón

Los 25 números se distribuyen así:

```
Posición en archivo: 1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25
                     ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓   ↓
Cartón resultante:   B1  I1  N1  G1  O1  B2  I2  N2  G2  O2  B3  I3  [0] G3  O3  B4  I4  N4  G4  O4  B5  I5  N5  G5  O5
```

Donde:
- **B** = Columna B (números 1-15)
- **I** = Columna I (números 16-30)
- **N** = Columna N (números 31-45, centro = 0)
- **G** = Columna G (números 46-60)
- **O** = Columna O (números 61-75)

## Cómo Usar

### 1. Acceder al Importador

Navega a: `/importar`

### 2. Importar un Paquete

1. **Nombre del Paquete**: Ingresa un nombre descriptivo (ej: "Paquete Enero 2026")
2. **Serial** (Opcional): Ingresa el serial del bingo (por defecto: "BINGO")
3. **Seleccionar Archivo**: Haz clic en el área de carga y selecciona tu archivo Excel o CSV
4. **Importar**: Haz clic en "Importar Cartones"

### 3. Ver Paquetes Importados

Cambia a la pestaña "Ver Paquetes" para ver todos los paquetes importados con:
- Nombre del paquete
- ID único
- Total de cartones
- Fecha de importación

## Estructura de Almacenamiento

Los paquetes se guardan en:
```
src/shared/constants/paquetes-cartones/paquete-{nombre}.json
```

### Formato del JSON Generado

```json
{
  "version": "1.0",
  "paquete_id": "paquete-enero-2026",
  "nombre": "Paquete Enero 2026",
  "fecha_generacion": "2026-01-17T20:00:00.000Z",
  "total_cartones": 100,
  "descripcion": "Paquete Enero 2026 - 100 cartones únicos de Bingo",
  "cartones": [
    {
      "id": "carton-1768419239-12345-1",
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
  ]
}
```

## API Endpoints

### POST /api/import-cartones
Importa un archivo Excel o CSV y crea un paquete de cartones.

**FormData:**
- `file`: Archivo Excel (.xlsx, .xls) o CSV (.csv)
- `nombre`: Nombre del paquete
- `serial`: Serial del bingo (opcional)

**Respuesta:**
```json
{
  "success": true,
  "message": "Paquete de cartones importado exitosamente",
  "paquete": {
    "id": "paquete-enero-2026",
    "nombre": "Paquete Enero 2026",
    "total_cartones": 100,
    "fecha_generacion": "2026-01-17T20:00:00.000Z"
  }
}
```

### GET /api/import-cartones
Obtiene la lista de todos los paquetes importados.

**Respuesta:**
```json
{
  "paquetes": [
    {
      "id": "paquete-enero-2026",
      "nombre": "Paquete Enero 2026",
      "total_cartones": 100,
      "fecha_generacion": "2026-01-17T20:00:00.000Z"
    }
  ]
}
```

## Validaciones

- ✅ Solo acepta archivos Excel (.xlsx, .xls) y CSV (.csv)
- ✅ Cada fila debe tener exactamente 25 números
- ✅ El nombre del paquete es obligatorio
- ✅ Filas vacías o incompletas se omiten automáticamente
- ✅ El cuadro libre se establece automáticamente en 0

## Integración con el Sistema

Los paquetes importados se integran automáticamente con todo el sistema:

### ✅ Vista de Cartones (`/cartones`)
- Los paquetes importados aparecen automáticamente en el selector de paquetes
- Se pueden visualizar todos los cartones del paquete importado
- Búsqueda y paginación funcionan igual que con los paquetes predefinidos

### ✅ Modal de Configuración (Sorteo)
- Los paquetes importados están disponibles en el dropdown de selección
- Se pueden usar en cualquier ronda del sorteo
- Compatible con todas las modalidades de juego

### ✅ Actualización Automática
- Al importar un paquete nuevo, la lista se actualiza automáticamente
- Los selectores de paquetes se refrescan dinámicamente
- No requiere recargar la página

## Notas Importantes

1. **Cuadro Libre**: El sistema automáticamente establece la posición [2][2] (centro) en 0, sin importar el valor en el Excel/CSV
2. **Persistencia**: Los paquetes se almacenan permanentemente en el sistema de archivos
3. **IDs Únicos**: Cada cartón recibe un ID único basado en timestamp y número aleatorio
4. **Compatibilidad**: Compatible con el formato de los paquetes existentes (alpha, beta, gamma, delta, original)
5. **Integración Total**: Los paquetes importados funcionan exactamente igual que los paquetes predefinidos en todo el sistema

## Tecnologías Utilizadas

- **xlsx**: Librería para parsear archivos Excel
- **Next.js API Routes**: Backend para procesamiento
- **React**: Frontend con componentes interactivos
- **TypeScript**: Tipado fuerte para mayor seguridad
- **Tailwind CSS**: Estilos modernos y responsivos
