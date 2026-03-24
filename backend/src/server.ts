import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import dotenv from 'dotenv'
import prismaPlugin from './plugins/prisma.js'
import authPlugin from './plugins/auth.js'
import authRoutes from './routes/auth.js'
import avatarRoutes from './routes/avatar.js'
import personaRoutes from './routes/persona.js'
import voiceRoutes from './routes/voice.js'
import chatRoutes from './routes/chat.js'
import ttsRoutes from './routes/tts.js'
import websocketRoutes from './routes/websocket.js'
import userRoutes from './routes/user.js'
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
fastify.register(userRoutes, { prefix: '/api/user' })

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
