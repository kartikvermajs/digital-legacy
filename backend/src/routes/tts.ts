import { FastifyInstance } from 'fastify'

export default async function ttsRoutes(fastify: FastifyInstance) {
  fastify.post('/generate', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { text, voiceId = '21m00Tcm4TlvDq8ikWAM' } = request.body as any
    if (!text) return reply.status(400).send({ error: 'Text is required' })

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
        })
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
      }

      reply.raw.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked'
      })

      if (response.body) {
        // Node 18+ valid stream response body is a Web stream, convert or pipe
        const reader = response.body.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          reply.raw.write(Buffer.from(value))
        }
      }

      reply.raw.end()
    } catch (err) {
      fastify.log.error(err)
      if (!reply.raw.headersSent) {
        return reply.status(500).send({ error: 'Failed to generate speech' })
      } else {
        reply.raw.end()
      }
    }
  })
}
