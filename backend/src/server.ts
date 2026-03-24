import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import dotenv from 'dotenv'
import prismaPlugin from './plugins/prisma'
import authPlugin from './plugins/auth'
import authRoutes from './routes/auth'
import avatarRoutes from './routes/avatar'
import personaRoutes from './routes/persona'
import voiceRoutes from './routes/voice'
import chatRoutes from './routes/chat'
import ttsRoutes from './routes/tts'
import websocketRoutes from './routes/websocket'
import multipart from '@fastify/multipart'

dotenv.config()

const fastify = Fastify({ logger: true })

fastify.register(cors, { origin: '*' })
fastify.register(websocket)
fastify.register(multipart)
fastify.register(prismaPlugin)
fastify.register(authPlugin)

fastify.register(authRoutes, { prefix: '/api/auth' })
fastify.register(avatarRoutes, { prefix: '/api/avatar' })
fastify.register(personaRoutes, { prefix: '/api/personas' })
fastify.register(voiceRoutes, { prefix: '/api/voice' })
fastify.register(chatRoutes, { prefix: '/api/chat' })
fastify.register(ttsRoutes, { prefix: '/api/tts' })
fastify.register(websocketRoutes, { prefix: '/api/ws' })

fastify.get('/ping', async (request, reply) => {
  return { status: 'ok', message: 'pong' }
})

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10)
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Server listening on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
