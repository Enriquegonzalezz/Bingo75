#!/bin/sh
# =============================================================================
# Script de migración de base de datos para Bingo75
# =============================================================================

echo "🔄 Esperando a que MySQL esté completamente listo..."
sleep 10

echo "📦 Creando/actualizando tablas en la base de datos..."
npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Tablas creadas/actualizadas exitosamente"
else
    echo "❌ Error al crear las tablas"
    exit 1
fi

echo "🎉 Proceso de migración completado"
