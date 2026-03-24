import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/signup', async (request, reply) => {
    const { email, password } = request.body as any
    if (!email || !password) return reply.status(400).send({ error: 'Email and password required' })

    const existingUser = await fastify.prisma.user.findUnique({ where: { email } })
    if (existingUser) return reply.status(400).send({ error: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await fastify.prisma.user.create({
      data: { email, password: hashedPassword }
    })

    const token = fastify.jwt.sign({ id: user.id, email: user.email })
    return { token, user: { id: user.id, email: user.email } }
  })

  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as any

    const user = await fastify.prisma.user.findUnique({ where: { email } })
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return reply.status(401).send({ error: 'Invalid credentials' })

    const token = fastify.jwt.sign({ id: user.id, email: user.email })
    return { token, user: { id: user.id, email: user.email } }
  })

  fastify.get('/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    return request.user
  })
}
