import type { FastifyInstance } from 'fastify'

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.put('/update', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { name, email, birthday, gender, avatarUrl } = request.body as any

    try {
      const dataPayload: any = {};
      if (name !== undefined) dataPayload.name = name;
      if (email !== undefined) dataPayload.email = email;
      if (birthday !== undefined) dataPayload.birthday = birthday;
      if (gender !== undefined) dataPayload.gender = gender;
      if (avatarUrl !== undefined) dataPayload.avatarUrl = avatarUrl;

      const user = await fastify.prisma.user.update({
        where: { id: request.user.id },
        data: dataPayload
      })
      const { password: _, ...safeUser } = user;
      return safeUser
    } catch (err: any) {
      fastify.log.error(err)
      return reply.status(500).send({ error: err.message || 'Failed to update profile' })
    }
  })
}
