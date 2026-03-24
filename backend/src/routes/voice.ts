import type { FastifyInstance } from 'fastify'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import os from 'os'
import util from 'util'
import { pipeline } from 'stream'

const pump = util.promisify(pipeline)

export default async function voiceRoutes(fastify: FastifyInstance) {
  fastify.post('/transcribe', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.status(400).send({ error: 'No audio file uploaded' })

    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}-${data.filename}`)
    await pump(data.file, fs.createWriteStream(tempFilePath))

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
      })

      fs.unlinkSync(tempFilePath)
      return { text: transcription.text }
    } catch (err) {
      fastify.log.error(err)
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath)
      return reply.status(500).send({ error: 'Failed to transcribe audio' })
    }
  })
}
