import { FastifyInstance } from 'fastify'
import OpenAI from 'openai'
import { buildSystemPrompt } from '../utils/promptBuilder'

export default async function chatRoutes(fastify: FastifyInstance) {
  fastify.post('/message', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { sessionId, message } = request.body as any
    if (!sessionId || !message) return reply.status(400).send({ error: 'sessionId and message are required' })

    const session = await fastify.prisma.session.findUnique({
      where: { id: sessionId },
      include: { persona: true }
    })
    
    if (!session) return reply.status(404).send({ error: 'Session not found' })
    if (session.userId !== request.user.id) return reply.status(403).send({ error: 'Unauthorized' })

    // Save User Message
    await fastify.prisma.message.create({
      data: { sessionId, role: 'user', content: message }
    })

    // Get Chat History
    const history = await fastify.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20
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

    try {
      const stream = await openrouter.chat.completions.create({
        model: 'meta-llama/llama-3-8b-instruct:free',
        messages,
        stream: true,
      })

      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })

      let fullResponse = ''
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          reply.raw.write(`data: ${JSON.stringify({ content })}\n\n`)
        }
      }

      reply.raw.write(`data: [DONE]\n\n`)
      reply.raw.end()

      // Save AI Message
      await fastify.prisma.message.create({
        data: { sessionId, role: 'ai', content: fullResponse }
      })

    } catch (err) {
      fastify.log.error(err)
      if (!reply.raw.headersSent) {
        return reply.status(500).send({ error: 'Failed to generate response' })
      } else {
        reply.raw.end()
      }
    }
  })
}
