import { PrismaClient } from '@prisma/client'
import '@fastify/jwt'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    authenticate: any
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string, email: string }
    user: { id: string, email: string }
  }
}
