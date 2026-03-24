import { FastifyInstance } from 'fastify'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { buildSystemPrompt } from '../utils/promptBuilder'

export default async function websocketRoutes(fastify: FastifyInstance) {
  fastify.get('/conversation/:sessionId', { websocket: true }, (connection, req) => {
    const sessionId = (req.params as any).sessionId
    let audioBuffer = Buffer.alloc(0)

    connection.socket.on('message', async (message: Buffer | string) => {
      // If binary, append to audio buffer
      if (Buffer.isBuffer(message)) {
        audioBuffer = Buffer.concat([audioBuffer, message])
      } else {
        const data = JSON.parse(message as string)
        if (data.event === 'stop_audio') {
          try {
            // 1. STT (Whisper)
            const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`)
            fs.writeFileSync(tempFilePath, audioBuffer)
            
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            const transcription = await openai.audio.transcriptions.create({
              file: fs.createReadStream(tempFilePath) as any,
              model: 'whisper-1',
            })
            fs.unlinkSync(tempFilePath)

            const userText = transcription.text
            connection.socket.send(JSON.stringify({ event: 'stt_result', text: userText }))

            // DB Fetch
            const session = await fastify.prisma.session.findUnique({
              where: { id: sessionId },
              include: { persona: true }
            })
            if (!session) return connection.socket.send(JSON.stringify({ error: 'Session not found' }))

            await fastify.prisma.message.create({
              data: { sessionId, role: 'user', content: userText }
            })

            // 2. AI (OpenRouter)
            const history = await fastify.prisma.message.findMany({
              where: { sessionId },
              orderBy: { createdAt: 'asc' },
              take: 10
            })

            const openrouter = new OpenAI({
              baseURL: 'https://openrouter.ai/api/v1',
              apiKey: process.env.OPENROUTER_API_KEY,
            })

            const systemPrompt = buildSystemPrompt(session.persona)
            const messages: any[] = [{ role: 'system', content: systemPrompt }]
            history.forEach((msg: any) => {
              messages.push({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.content })
            })

            const aiStream = await openrouter.chat.completions.create({
              model: 'meta-llama/llama-3-8b-instruct:free',
              messages,
              stream: true,
            })

            let fullResponse = ''
            for await (const chunk of aiStream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                fullResponse += content
                connection.socket.send(JSON.stringify({ event: 'ai_text_chunk', text: content }))
              }
            }
            connection.socket.send(JSON.stringify({ event: 'ai_text_done', text: fullResponse }))

            await fastify.prisma.message.create({
              data: { sessionId, role: 'ai', content: fullResponse }
            })

            // 3. TTS (ElevenLabs)
            const voiceId = '21m00Tcm4TlvDq8ikWAM' // Generic voice fallback
            const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
              method: 'POST',
              headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
              },
              body: JSON.stringify({
                text: fullResponse,
                model_id: 'eleven_turbo_v2_5',
              })
            })

            if (ttsResponse.body) {
              const reader = ttsResponse.body.getReader()
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                connection.socket.send(value) // binary stream back
              }
            }
            
            connection.socket.send(JSON.stringify({ event: 'tts_done' }))
            audioBuffer = Buffer.alloc(0) // reset for next turn

          } catch (err: any) {
            fastify.log.error(err)
            connection.socket.send(JSON.stringify({ error: err.message }))
          }
        }
      }
    })
  })
}
