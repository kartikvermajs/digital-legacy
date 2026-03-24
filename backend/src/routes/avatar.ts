import type { FastifyInstance } from 'fastify'
import { v2 as cloudinary } from 'cloudinary'
import Replicate from 'replicate'

export default async function avatarRoutes(fastify: FastifyInstance) {
  fastify.post('/upload', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.status(400).send({ error: 'No file uploaded' })

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!
    })

    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'digital_legacy_avatars' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        data.file.pipe(uploadStream)
      })

      return { url: (uploadResult as any).secure_url }
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Upload failed' })
    }
  })

  fastify.post('/generate', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { imageUrl } = request.body as any
    if (!imageUrl) return reply.status(400).send({ error: 'Image URL required' })

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

    if (!REPLICATE_API_TOKEN) {
      throw new Error('Missing REPLICATE_API_TOKEN')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    })

    try {
      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            image: imageUrl,
            prompt: "highly detailed 3d render of the person as a futuristic AI digital avatar, cyber aesthetic, cinematic lighting, portrait",
            prompt_strength: 0.8
          }
        }
      )

      const generatedImageUrl = Array.isArray(output) ? output[0] : output
      const url = typeof generatedImageUrl === 'string' ? generatedImageUrl : (generatedImageUrl as any)?.url || String(generatedImageUrl)

      await fastify.prisma.user.update({
        where: { id: request.user.id },
        data: { avatarUrl: url }
      })

      return { url }
    } catch (err: any) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Failed to generate avatar' })
    }
  })
}
