import { FastifyInstance } from 'fastify'

export default async function personaRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { name, traits, tone, avatarUrl } = request.body as any
    if (!name || !traits || !tone) return reply.status(400).send({ error: 'Name, traits, and tone are required' })

    try {
      const persona = await fastify.prisma.persona.create({
        data: {
          name,
          traits,
          tone,
          avatarUrl,
          userId: request.user.id
        }
      })
      return persona
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Failed to create persona' })
    }
  })

  fastify.get('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const personas = await fastify.prisma.persona.findMany({
        where: { userId: request.user.id }
      })
      return personas
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Failed to fetch personas' })
    }
  })
}
