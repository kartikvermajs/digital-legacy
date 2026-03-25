import type { FastifyInstance } from 'fastify'
import OpenAI from 'openai'
import { buildSystemPrompt } from '../utils/promptBuilder.js'

const activeConnections = new Map<string, any>()

export default async function websocketRoutes(fastify: FastifyInstance) {
  fastify.get('/conversation/:sessionId', { websocket: true }, (connection, req) => {
    const sessionId = (req.params as any).sessionId

    // Ensure single active connection per session
    if (activeConnections.has(sessionId)) {
      try {
        activeConnections.get(sessionId).close()
      } catch { }
    }
    activeConnections.set(sessionId, connection)

    connection.on('close', () => {
      activeConnections.delete(sessionId)
    })

    connection.on('message', async (message: any, isBinary: boolean) => {
      if (isBinary) return

      try {
        const data = JSON.parse(message.toString())

        if (data.event === 'stt_result') {
          const userText = data.text

          // Fetch session + persona
          const session = await fastify.prisma.session.findUnique({
            where: { id: sessionId },
            include: { persona: true }
          })

          if (!session) {
            return connection.send(JSON.stringify({ error: 'Session not found' }))
          }

          // Save user message
          await fastify.prisma.message.create({
            data: { sessionId, role: 'user', content: userText }
          })

          // Fetch history
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

          const messages: any[] = [
            { role: 'system', content: systemPrompt }
          ]

          history.forEach((msg: any) => {
            messages.push({
              role: msg.role === 'ai' ? 'assistant' : 'user',
              content: msg.content
            })
          })

          let aiStream

          // Retry-safe AI call
          try {
            aiStream = await openrouter.chat.completions.create({
              model: 'openrouter/auto',
              messages,
              stream: true,
            })
          } catch (err) {
            fastify.log.error('AI primary failed, retrying...')
            aiStream = await openrouter.chat.completions.create({
              model: 'openrouter/auto',
              messages,
              stream: true,
            })
          }

          let fullResponse = ''

          try {
            for await (const chunk of aiStream as any) {
              const content = chunk.choices?.[0]?.delta?.content || ''
              if (content) {
                fullResponse += content
                connection.send(JSON.stringify({
                  event: 'ai_text_chunk',
                  text: content
                }))
              }
            }
          } catch (err) {
            fastify.log.error('AI stream failed')
            fullResponse = "I'm having trouble responding right now, but I'm still here."
          }

          connection.send(JSON.stringify({
            event: 'ai_text_done',
            text: fullResponse
          }))

          // Save AI response
          await fastify.prisma.message.create({
            data: { sessionId, role: 'ai', content: fullResponse }
          })

          // ElevenLabs TTS (streaming)
          try {
            const voiceId = '21m00Tcm4TlvDq8ikWAM'

            const ttsResponse = await fetch(
              `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
              {
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
              }
            )

            if (ttsResponse.body) {
              const reader = ttsResponse.body.getReader()
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                connection.send(value)
              }
            } else {
              const errorText = await ttsResponse.text()
              fastify.log.error('ElevenLabs error: ' + errorText)
            }

          } catch (err) {
            fastify.log.error('TTS failed')
          }

          connection.send(JSON.stringify({ event: 'tts_done' }))
        }

      } catch (err: any) {
        fastify.log.error(err)
        connection.send(JSON.stringify({ error: err.message }))
      }
    })
  })
}