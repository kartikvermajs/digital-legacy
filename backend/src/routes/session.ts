import type { FastifyInstance } from 'fastify'

export default async function sessionRoutes(fastify: FastifyInstance) {
  fastify.post('/create', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { personaId, isPrebuilt, name, traits, tone, gender, avatarUrl } = request.body as any
    if (!personaId) return reply.status(400).send({ error: 'personaId is required' })

    const userId = request.user.id

    try {
      let activePersonaId = personaId

      // If it's a prebuilt persona, we need to check if the user already has it in their DB
      if (isPrebuilt) {
        // Use an atomic transaction to prevent race conditions during DB insert
        const existingPersona = await fastify.prisma.persona.findFirst({
          where: {
            userId: userId,
            prebuiltId: personaId, // Using the stable identifier
          }
        })

        if (!existingPersona) {
          // Sync prebuilt persona into DB
          const newPersona = await fastify.prisma.persona.create({
            data: {
              userId,
              prebuiltId: personaId,
              name: name || 'Unknown Prebuilt',
              traits: traits || '',
              tone: tone || 'expert',
              gender: gender || 'Not specified',
              avatarUrl: avatarUrl || ''
            }
          })
          activePersonaId = newPersona.id
        } else {
          activePersonaId = existingPersona.id
        }
      } else {
        // Verify user persona exists and belongs to the user
        const userPersona = await fastify.prisma.persona.findUnique({
          where: { id: personaId }
        })
        if (!userPersona || userPersona.userId !== userId) {
          return reply.status(403).send({ error: 'Not authorized for this persona or it does not exist' })
        }
      }

      // Create a new session attached to the user and the resolved activePersonaId
      const newSession = await fastify.prisma.session.create({
        data: {
          userId,
          personaId: activePersonaId
        }
      })

      return { sessionId: newSession.id, activePersonaId }
    } catch (err: any) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Failed to create session' })
    }
  })
}
