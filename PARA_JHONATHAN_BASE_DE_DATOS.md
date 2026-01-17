# 🔴 JHONATHAN: GUÍA PARA IMPLEMENTAR LA BASE DE DATOS

## 📍 RESUMEN

Los cartones importados desde CSV/Excel ahora deben guardarse en una **base de datos SQL** en lugar del filesystem. Todo el código está preparado con comentarios claros indicando dónde debes implementar la lógica de base de datos.

## 🗂️ ARCHIVOS IMPORTANTES

### 1. **`src/lib/db.ts`** - Configuración de la conexión
- Aquí configuras la conexión a tu base de datos
- Opciones disponibles: Prisma, pg (PostgreSQL), mysql2
- Descomenta la opción que vayas a usar

### 2. **`src/lib/db-operations.ts`** - Operaciones de base de datos
- Contiene 4 funciones principales que debes implementar:
  - `guardarPaqueteEnDB()` - Guarda un paquete completo con todos sus cartones
  - `obtenerTodosPaquetes()` - Obtiene lista de todos los paquetes
  - `obtenerCartonesPorPaquete()` - Obtiene todos los cartones de un paquete
  - `paqueteExiste()` - Verifica si un paquete ya existe
- Cada función tiene ejemplos comentados con Prisma y PostgreSQL

### 3. **`prisma/schema.prisma`** - Schema de la base de datos
- Define la estructura de las tablas
- 2 tablas principales: `Paquete` y `Carton`
- Incluye todos los campos necesarios

### 4. **`src/app/api/import-cartones/route.ts`** - API de importación
- Endpoint POST: Recibe el CSV/Excel y llama a `guardarPaqueteEnDB()`
- Endpoint GET: Lista paquetes llamando a `obtenerTodosPaquetes()`
- **Líneas clave:**
  - Línea 9: Import de funciones de DB
  - Línea 192-216: Donde se guarda en la base de datos
  - Línea 257-258: Donde se obtienen los paquetes

### 5. **`src/app/api/paquetes/route.ts`** - API de listado de paquetes
- Usado por la página de cartones y el modal de configuración
- **Líneas clave:**
  - Línea 8: Import de funciones de DB
  - Línea 30-32: Donde se obtienen los paquetes

### 6. **`env.example.txt`** - Variables de entorno
- Ejemplos de configuración para diferentes bases de datos

## 📊 ESTRUCTURA DE DATOS

### Tabla: Paquete
```sql
- id (PK, UUID/CUID)
- paquete_id (UNIQUE, ej: "paquete-mi-paquete")
- nombre (ej: "Mi Paquete")
- version (ej: "1.0")
- fecha_generacion (TIMESTAMP)
- total_cartones (INTEGER)
- descripcion (TEXT)
- serial (ej: "BINGO")
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Tabla: Carton
```sql
- id (PK, UUID/CUID)
- carton_id (UNIQUE, ej: "carton-1737154800000-12345-1")
- numero_carton (INTEGER, ej: 1, 2, 3...)
- serial (ej: "BINGO")
- paquete_id (FK -> Paquete.id)
- numeros_b (JSON, array de 5 números)
- numeros_i (JSON, array de 5 números)
- numeros_n (JSON, array de 5 números, con 0 en el centro)
- numeros_g (JSON, array de 5 números)
- numeros_o (JSON, array de 5 números)
- matriz (JSON, array 5x5)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Relación
- Un Paquete tiene muchos Cartones (1:N)
- Cuando se elimina un Paquete, se eliminan sus Cartones (CASCADE)

## 🚀 PASOS PARA IMPLEMENTAR

### OPCIÓN A: Usando Prisma (Recomendado)

#### 1. Instalar dependencias
```bash
npm install @prisma/client
npm install -D prisma
```

#### 2. Inicializar Prisma
```bash
npx prisma init
```

#### 3. Configurar el schema
- El archivo `prisma/schema.prisma` ya está listo
- Solo ajusta el `provider` según tu base de datos (postgresql, mysql, etc.)

#### 4. Configurar variables de entorno
- Crea `.env.local` basándote en `env.example.txt`
- Configura `DATABASE_URL` con tu conexión

#### 5. Crear la base de datos
```bash
npx prisma migrate dev --name init
```

#### 6. Generar el cliente
```bash
npx prisma generate
```

#### 7. Implementar las funciones
- Ve a `src/lib/db.ts` y descomenta la sección de Prisma
- Ve a `src/lib/db-operations.ts` y descomenta los ejemplos de Prisma
- Ve a `src/app/api/import-cartones/route.ts` línea 258 y descomenta
- Ve a `src/app/api/paquetes/route.ts` línea 32 y descomenta

#### 8. Probar
```bash
npm run dev
```
- Ve a `/importar`
- Sube un CSV de prueba
- Verifica en la terminal que se guarde en la DB
- Usa `npx prisma studio` para ver los datos

### OPCIÓN B: Usando PostgreSQL directo (pg)

#### 1. Instalar dependencias
```bash
npm install pg
npm install -D @types/pg
```

#### 2. Crear las tablas manualmente
```sql
CREATE TABLE paquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paquete_id VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  version VARCHAR(50) DEFAULT '1.0',
  fecha_generacion TIMESTAMP NOT NULL,
  total_cartones INTEGER NOT NULL,
  descripcion TEXT,
  serial VARCHAR(50) DEFAULT 'BINGO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cartones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carton_id VARCHAR(255) UNIQUE NOT NULL,
  numero_carton INTEGER NOT NULL,
  serial VARCHAR(50) NOT NULL,
  paquete_id UUID NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  numeros_b JSONB NOT NULL,
  numeros_i JSONB NOT NULL,
  numeros_n JSONB NOT NULL,
  numeros_g JSONB NOT NULL,
  numeros_o JSONB NOT NULL,
  matriz JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paquetes_paquete_id ON paquetes(paquete_id);
CREATE INDEX idx_cartones_paquete_id ON cartones(paquete_id);
CREATE INDEX idx_cartones_numero_carton ON cartones(numero_carton);
```

#### 3. Configurar variables de entorno
- Crea `.env.local` con las variables de PostgreSQL

#### 4. Implementar las funciones
- Ve a `src/lib/db.ts` y descomenta la sección de pg
- Ve a `src/lib/db-operations.ts` y descomenta los ejemplos de pg
- Adapta las queries según necesites

## 🔍 FLUJO DE DATOS

### Cuando el usuario importa un CSV:

1. **Frontend** (`/importar`): Usuario sube CSV + nombre del paquete
2. **API** (`/api/import-cartones` POST):
   - Recibe el archivo
   - Parsea el CSV con `xlsx`
   - Crea objeto `PaqueteCartones` con todos los cartones
   - **🔴 AQUÍ LLAMA A `guardarPaqueteEnDB(paquete)`** (línea 213)
   - Retorna éxito
3. **Base de Datos**: 
   - Se inserta 1 registro en `paquetes`
   - Se insertan N registros en `cartones` (uno por cada cartón)

### Cuando se lista los paquetes:

1. **Frontend** (`/cartones` o modal de configuración): Carga la página
2. **API** (`/api/paquetes` GET):
   - **🔴 AQUÍ LLAMA A `obtenerTodosPaquetes()`** (línea 32)
   - Retorna array de paquetes
3. **Frontend**: Muestra los paquetes en el selector

## 📝 EJEMPLO DE DATOS

### Paquete guardado:
```json
{
  "paquete_id": "paquete-mi-paquete",
  "nombre": "Mi Paquete",
  "version": "1.0",
  "fecha_generacion": "2026-01-17T21:00:00.000Z",
  "total_cartones": 100,
  "descripcion": "Paquete Mi Paquete - 100 cartones únicos de Bingo",
  "serial": "BINGO"
}
```

### Cartón guardado:
```json
{
  "carton_id": "carton-1737154800000-12345-1",
  "numero_carton": 1,
  "serial": "BINGO",
  "paquete_id": "uuid-del-paquete",
  "numeros_b": [7, 12, 1, 5, 6],
  "numeros_i": [30, 19, 20, 25, 22],
  "numeros_n": [33, 36, 0, 37, 35],
  "numeros_g": [54, 56, 48, 55, 60],
  "numeros_o": [63, 66, 72, 73, 62],
  "matriz": [
    [7, 30, 33, 54, 63],
    [12, 19, 36, 56, 66],
    [1, 20, 0, 48, 72],
    [5, 25, 37, 55, 73],
    [6, 22, 35, 60, 62]
  ]
}
```

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Transacciones
Usa transacciones para garantizar que si falla al guardar un cartón, se haga rollback de todo el paquete.

### 2. Validación
- Verifica que el `paquete_id` sea único antes de insertar
- La función `paqueteExiste()` ya está llamada en el endpoint

### 3. Performance
- Un paquete puede tener miles de cartones
- Usa `createMany()` en Prisma o batch inserts en SQL
- Considera agregar índices en columnas frecuentemente buscadas

### 4. JSON vs Columnas separadas
- Los números están guardados como JSON para facilidad
- Si necesitas buscar por números específicos, considera columnas separadas

### 5. Migraciones
- Usa migraciones para cambios en el schema
- No modifiques las tablas manualmente en producción

## 🧪 TESTING

### Probar con pocos cartones primero:
1. Crea un CSV con 5-10 cartones
2. Impórtalo
3. Verifica en la base de datos que se guardó correctamente
4. Verifica que aparezca en `/cartones`
5. Verifica que aparezca en el modal de configuración

### Comandos útiles de Prisma:
```bash
# Ver datos en interfaz gráfica
npx prisma studio

# Ver el estado de las migraciones
npx prisma migrate status

# Resetear la base de datos (¡cuidado en producción!)
npx prisma migrate reset

# Generar SQL sin aplicar
npx prisma migrate dev --create-only
```

## 📍 UBICACIÓN DE LOS ENDPOINTS

### POST `/api/import-cartones`
- **Archivo:** `src/app/api/import-cartones/route.ts`
- **Función:** Importar CSV/Excel
- **Línea clave:** 213 - `await guardarPaqueteEnDB(paquete)`

### GET `/api/import-cartones`
- **Archivo:** `src/app/api/import-cartones/route.ts`
- **Función:** Listar paquetes importados
- **Línea clave:** 258 - `await obtenerTodosPaquetes()`

### GET `/api/paquetes`
- **Archivo:** `src/app/api/paquetes/route.ts`
- **Función:** Listar todos los paquetes (usado por selectores)
- **Línea clave:** 32 - `await obtenerTodosPaquetes()`

## ✅ CHECKLIST

- [ ] Elegir base de datos (PostgreSQL, MySQL, SQLite)
- [ ] Instalar dependencias (Prisma o pg/mysql2)
- [ ] Configurar variables de entorno en `.env.local`
- [ ] Crear/migrar las tablas
- [ ] Descomentar código en `src/lib/db.ts`
- [ ] Implementar funciones en `src/lib/db-operations.ts`
- [ ] Descomentar llamadas en los endpoints
- [ ] Probar con CSV pequeño
- [ ] Verificar que los datos se guarden correctamente
- [ ] Verificar que aparezcan en la UI
- [ ] Probar con CSV grande (1000+ cartones)

## 🆘 AYUDA

Si tienes dudas:
1. Revisa los comentarios en el código (todos empiezan con 🔴 JHONATHAN)
2. Los ejemplos están comentados en cada función
3. El schema de Prisma está completamente documentado
4. Cada endpoint tiene logs que te indican qué está pasando

¡Éxito con la implementación! 🚀
