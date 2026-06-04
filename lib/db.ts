import 'server-only'
import { PrismaClient } from '@prisma/client'

function createClient() {
  return new PrismaClient()
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const db = globalForPrisma.prisma ?? createClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
