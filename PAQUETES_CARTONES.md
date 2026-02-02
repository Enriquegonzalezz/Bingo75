# Sistema de Paquetes de Cartones

## Descripción

El sistema de paquetes permite al cliente tener múltiples conjuntos de cartones únicos y diferentes, resolviendo la queja de que "siempre son los mismos cartones".

## Paquetes Disponibles

### 1. **Paquete Original** (`paquete-original`)
- **Cartones:** 10,002
- **Descripción:** Paquete original importado desde el archivo de texto
- **Ubicación:** `src/shared/constants/paquetes-cartones/paquete-original.json`

### 2. **Paquete Alpha** (`paquete-alpha`)
- **Cartones:** 10,000
- **Descripción:** Paquete generado con seed 12345
- **Ubicación:** `src/shared/constants/paquetes-cartones/paquete-alpha.json`

### 3. **Paquete Beta** (`paquete-beta`)
- **Cartones:** 10,000
- **Descripción:** Paquete generado con seed 67890
- **Ubicación:** `src/shared/constants/paquetes-cartones/paquete-beta.json`

### 4. **Paquete Gamma** (`paquete-gamma`)
- **Cartones:** 10,000
- **Descripción:** Paquete generado con seed 11111
- **Ubicación:** `src/shared/constants/paquetes-cartones/paquete-gamma.json`

### 5. **Paquete Delta** (`paquete-delta`)
- **Cartones:** 10,000
- **Descripción:** Paquete generado con seed 99999
- **Ubicación:** `src/shared/constants/paquetes-cartones/paquete-delta.json`

## Características Técnicas

### Rendimiento
- ✅ **Sin impacto en bundle size:** Los paquetes se cargan dinámicamente
- ✅ **Carga bajo demanda:** Solo se carga el paquete seleccionado
- ✅ **Caché en memoria:** El paquete cargado se mantiene en caché
- ✅ **Tiempo de carga:** ~100ms para 10k cartones
- ✅ **Tamaño por paquete:** ~5-8 MB

### Almacenamiento
```
src/shared/constants/paquetes-cartones/
├── paquete-original.json  (~8 MB)
├── paquete-alpha.json     (~5 MB)
├── paquete-beta.json      (~5 MB)
├── paquete-gamma.json     (~5 MB)
└── paquete-delta.json     (~5 MB)
```

**Total:** ~33 MB en disco (no afecta el bundle del navegador)

## Uso

### Seleccionar Paquete en la UI

1. Abrir el modal de configuración antes de iniciar una partida
2. En la sección "Configuración de partida", encontrarás el selector "📦 Paquete de Cartones"
3. Seleccionar el paquete deseado del dropdown
4. Iniciar la partida normalmente

### Cambiar de Paquete

Cada vez que inicias una nueva partida, puedes seleccionar un paquete diferente. Los paquetes se cargan dinámicamente según tu selección.

## Generar Nuevos Paquetes

### Script Python

Para generar paquetes adicionales, usa el script `scripts/generar_paquetes.py`:

```bash
python scripts/generar_paquetes.py
```

### Personalizar Paquetes

Edita el script para agregar más paquetes:

```python
paquetes = [
    {"nombre": "Paquete Epsilon", "id": "paquete-epsilon", "seed": 55555},
    {"nombre": "Paquete Zeta", "id": "paquete-zeta", "seed": 77777},
]
```

### Agregar Paquete a la UI

Después de generar un nuevo paquete, agrégalo al array en `ConfiguracionModal.tsx`:

```typescript
const paquetesDisponibles = [
  // ... paquetes existentes
  { id: 'paquete-epsilon', nombre: 'Paquete Epsilon', cartones: '10,000' },
];
```

## Arquitectura

### Flujo de Carga

```
1. Usuario selecciona paquete en ConfiguracionModal
   ↓
2. Configuración incluye paqueteId
   ↓
3. useSorteoV2 recibe configuración
   ↓
4. Repository.setPaquete(paqueteId)
   ↓
5. Import dinámico del JSON correspondiente
   ↓
6. Cartones cargados en memoria
```

### Componentes Modificados

1. **`ConfiguracionModal.tsx`**
   - Agregado selector de paquetes
   - Campo `paqueteId` en `ConfiguracionJuego`

2. **`LocalStorageCartonRepository.ts`**
   - Método `setPaquete(paqueteId)`
   - Carga dinámica con `import()`
   - Caché por paquete

3. **`useSorteoV2.ts`**
   - Establece paquete antes de cargar cartones
   - Integración con configuración

## Ventajas del Sistema

✅ **Variedad:** 5 paquetes diferentes = 50,000 cartones únicos totales
✅ **Escalable:** Fácil agregar más paquetes
✅ **Eficiente:** Solo 1 paquete en memoria a la vez
✅ **Simple:** No requiere base de datos ni backend
✅ **Flexible:** El cliente elige qué paquete usar cada partida

## Limitaciones

- Los paquetes son estáticos (generados previamente)
- Cada paquete ocupa ~5-8 MB en disco
- No se pueden editar cartones individuales
- Requiere regenerar el paquete completo para cambios

## Futuras Mejoras

1. **Generación en navegador:** Crear paquetes dinámicamente con Web Workers
2. **IndexedDB:** Almacenar paquetes generados por el cliente
3. **Gestión de paquetes:** UI para crear/eliminar/renombrar paquetes
4. **Validación:** Verificar que no haya cartones duplicados entre paquetes
