// ============================================================================
// 🔴 JHONATHAN: AQUÍ VA LA CONFIGURACIÓN DE LA BASE DE DATOS
// ============================================================================
// Este archivo es donde debes configurar la conexión a la base de datos SQL
// Puedes usar Prisma, TypeORM, o un pool de PostgreSQL directo
// ============================================================================

// OPCIÓN 1: Usando Prisma (Recomendado)
// ============================================================================
// 1. Instalar: npm install @prisma/client
// 2. Instalar dev: npm install -D prisma
// 3. Inicializar: npx prisma init
// 4. Configurar schema.prisma (ver archivo src/prisma/schema.prisma)
// 5. Ejecutar migraciones: npx prisma migrate dev
// 6. Generar cliente: npx prisma generate

// import { PrismaClient } from '@prisma/client';
// 
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };
// 
// export const prisma = globalForPrisma.prisma ?? new PrismaClient({
//   log: ['query', 'error', 'warn'],
// });
// 
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================================================
// OPCIÓN 2: Usando pg (PostgreSQL Pool directo)
// ============================================================================
// 1. Instalar: npm install pg
// 2. Instalar types: npm install -D @types/pg
// 3. Configurar variables de entorno en .env.local

// import { Pool } from 'pg';
// 
// export const pool = new Pool({
//   host: process.env.DATABASE_HOST,
//   port: parseInt(process.env.DATABASE_PORT || '5432'),
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE_NAME,
//   max: 20, // Máximo de conexiones en el pool
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });

// ============================================================================
// OPCIÓN 3: Usando MySQL con mysql2
// ============================================================================
// 1. Instalar: npm install mysql2
// 2. Configurar variables de entorno en .env.local

// import mysql from 'mysql2/promise';
// 
// export const pool = mysql.createPool({
//   host: process.env.DATABASE_HOST,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// ============================================================================
// 🔴 JHONATHAN: DESCOMENTA LA OPCIÓN QUE VAYAS A USAR
// ============================================================================

// Por ahora exportamos un objeto vacío para que no de error
export const db = {
  // Aquí irán tus funciones de base de datos
};
