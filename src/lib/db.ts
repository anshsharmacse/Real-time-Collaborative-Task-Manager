import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Supabase with connection pooling (Supavisor)
// We need to handle the prepared statement issue
// The URL should be: postgresql://...?pgbouncer=true
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  
  // If URL doesn't have pgbouncer param and we're in production, add it
  if (process.env.NODE_ENV === 'production' && !url.includes('pgbouncer')) {
    // Add pgbouncer=true to disable prepared statements
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}pgbouncer=true`
  }
  return url
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
