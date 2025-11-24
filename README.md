# 🎯 Bingo 75 - Sistema de Sorteo Manual con Validación Automática

Sistema optimizado de Bingo 75 con **validación automática en tiempo real** de 1000 cartones.

## 🎮 Cómo Funciona

1. **Los 1000 cartones YA ESTÁN en el sistema** (carga automática)
2. **La mujer saca un número** con su método tradicional
3. **Clickea el número en el tablero** (1-75)
4. **El sistema valida AUTOMÁTICAMENTE** los 1000 cartones en ~50ms
5. **Si hay ganador, aparece INMEDIATAMENTE** con notificación 🎉

## 🏗️ Arquitectura

```
src/
├── domain/              # Lógica de negocio pura
│   ├── entities/        # Entidades del dominio
│   ├── value-objects/   # Objetos de valor
│   ├── factories/       # Factory Pattern
│   ├── validators/      # Validadores de patrones
│   └── interfaces/      # Contratos
├── application/         # Casos de uso
│   ├── use-cases/       # Lógica de aplicación
│   ├── dtos/            # Data Transfer Objects
│   └── mappers/         # Transformadores
├── infrastructure/      # Implementaciones técnicas
│   ├── repositories/    # Persistencia
│   └── storage/         # LocalStorage
├── presentation/        # UI y componentes
│   ├── components/      # React Components
│   ├── hooks/           # Custom Hooks
│   └── stores/          # Estado global
└── shared/              # Utilidades compartidas
    ├── utils/           # Funciones helper
    └── constants/       # Constantes
```

## ✨ Características

- ✅ **Generación de cartones únicos** con Factory Pattern
- ✅ **6 patrones de validación** (Horizontal, Vertical, Diagonal, Esquinas, Lleno)
- ✅ **Clean Architecture** con separación de capas
- ✅ **TypeScript estricto** con validaciones completas
- ✅ **Persistencia en LocalStorage**
- ✅ **UI profesional** con Tailwind CSS
- ✅ **Testing** con Vitest
- ✅ **Production ready**

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build de Producción

```bash
npm run build
npm run start
```

### Testing

```bash
npm run test
npm run test:ui
npm run test:coverage
```

## 📦 Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Zustand** - Estado global
- **Vitest** - Testing
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos

## 🎮 Uso

### Generar Cartones

1. Ve a **Cartones** → **Generar Cartones**
2. Ingresa el serial y cantidad
3. Los cartones se generan automáticamente con números únicos

### Validar Cartón

1. Ve a **Validar**
2. Ingresa el número de cartón
3. Selecciona el patrón a validar
4. El sistema verifica si es ganador

### Sorteo

1. Ve a **Tablero**
2. Inicia el sorteo automático o manual
3. Los números se marcan en tiempo real

## 📁 Estructura de Datos

### Cartón

```typescript
{
  id: string;
  serial: string;
  numero_carton: number;
  numeros: {
    B: number[];  // 1-15
    I: number[];  // 16-30
    N: number[];  // 31-45 (FREE en centro)
    G: number[];  // 46-60
    O: number[];  // 61-75
  };
  matriz: number[][];
  fecha_creacion: Date;
  activo: boolean;
}
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests con UI
npm run test:ui

# Coverage
npm run test:coverage
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter
- `npm run test` - Tests
- `npm run migrate-excel` - Migrar Excel a JSON

## 🔧 Migración de Excel

Si tienes cartones en Excel:

```bash
npm run migrate-excel path/to/excel.xlsm output.json
```

## 📄 Licencia

MIT

## 📚 Documentación Completa

- **[Tutorial de Migración](docs/TUTORIAL_MIGRACION.md)** - Guía completa de migración desde Excel
- **[Guía Rápida](docs/GUIA_RAPIDA.md)** - Usar el sistema en 5 minutos
- **[Migración Excel](docs/MIGRACION_EXCEL.md)** - Detalles técnicos de migración
- **[Ejemplos de Código](docs/EJEMPLOS_CODIGO.md)** - Casos de uso reales con código

## 🎯 Migración desde Excel

### ¿Qué hacía tu Excel?

Tu archivo Excel generaba cartones de Bingo 75 con:
- Números únicos en rangos correctos (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75)
- FREE en el centro
- Validación de duplicados
- Almacenamiento en hojas

### ¿Qué hace AHORA este sistema?

✅ **Todo lo del Excel** + muchas mejoras:

| Característica | Excel | Sistema Nuevo |
|----------------|-------|---------------|
| Generar 100 cartones | ~30 seg | ~2 seg |
| Validar ganador | Manual | Automático |
| Interfaz | Celdas | UI moderna |
| Sorteo | Manual | Automático |
| Búsqueda | Ctrl+F | Instantánea |
| Costo | Licencia | Gratis |

### Migrar en 3 pasos:

```bash
# 1. Coloca tu Excel en la carpeta raíz
# 2. Ejecuta el script
npm run migrate-excel

# 3. Importa desde la interfaz
# Configuración → Importar Cartones
```

**O mejor:** ¡Genera cartones nuevos en segundos!

```bash
npm run dev
# Ve a Cartones → Generar Cartones
# Serial: "BINGO CARABOBO"
# Cantidad: 1000
# ¡Listo!
```

## 👨‍💻 Autor

Sistema Bingo 75 - Arquitectura Escalable

---

**¿Preguntas?** Revisa la [documentación completa](docs/) o los [ejemplos de código](docs/EJEMPLOS_CODIGO.md)
