import type { FastifyInstance } from "fastify";
import OpenAI from "openai";
import { buildSystemPrompt } from "../utils/promptBuilder.js";

const activeConnections = new Map<string, any>();

export default async function websocketRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/conversation/:sessionId",
    { websocket: true },
    (connection, req) => {
      const sessionId = (req.params as any).sessionId;

      // Ensure single active connection
      if (activeConnections.has(sessionId)) {
        try {
          activeConnections.get(sessionId).close();
        } catch {}
      }
      activeConnections.set(sessionId, connection);

      connection.on("close", () => {
        activeConnections.delete(sessionId);
      });

      connection.on("message", async (message: any, isBinary: boolean) => {
        if (isBinary) return;

        try {
          const data = JSON.parse(message.toString());

          if (data.event === "stt_result") {
            const userText = data.text;

            // Fetch session + persona
            const session = await fastify.prisma.session.findUnique({
              where: { id: sessionId },
              include: { persona: true },
            });

            if (!session) {
              return connection.send(
                JSON.stringify({ error: "Session not found" }),
              );
            }

            // Save user message
            await fastify.prisma.message.create({
              data: { sessionId, role: "user", content: userText },
            });

            // Fetch last messages
            const history = await fastify.prisma.message.findMany({
              where: { sessionId },
              orderBy: { createdAt: "asc" },
              take: 10,
            });

            const openrouter = new OpenAI({
              baseURL: "https://openrouter.ai/api/v1",
              apiKey: process.env.OPENROUTER_API_KEY,
            });

            const systemPrompt =
              buildSystemPrompt(session.persona) +
              `
- Keep responses short (1–2 sentences)
- Speak naturally like a human
- Do not use symbols like # or repeated characters
`;

            const messages: any[] = [{ role: "system", content: systemPrompt }];

            history.forEach((msg: any) => {
              messages.push({
                role: msg.role === "ai" ? "assistant" : "user",
                content: msg.content,
              });
            });

            let aiStream;

            try {
              aiStream = await openrouter.chat.completions.create({
                model: "openrouter/auto",
                messages,
                stream: true,
                max_tokens: 150,
                temperature: 0.7,
              });
            } catch (err) {
              fastify.log.error("AI request failed");
              return connection.send(JSON.stringify({ error: "AI failed" }));
            }

            let fullResponse = "";
            let chunkCount = 0;
            const MAX_CHUNKS = 50;

            try {
              for await (const chunk of aiStream as any) {
                const content = chunk.choices?.[0]?.delta?.content || "";

                if (content) {
                  fullResponse += content;
                  chunkCount++;

                  connection.send(
                    JSON.stringify({
                      event: "ai_text_chunk",
                      text: content,
                    }),
                  );

                  if (chunkCount > MAX_CHUNKS) break;
                }
              }
            } catch (err) {
              fastify.log.error("Streaming error");
              fullResponse = "I'm having trouble responding right now.";
            }

            // Clean response for TTS
            const cleanText = fullResponse.replace(/[#*`]/g, "").slice(0, 300);

            connection.send(
              JSON.stringify({
                event: "ai_text_done",
                text: cleanText,
              }),
            );

            // Save AI response
            await fastify.prisma.message.create({
              data: { sessionId, role: "ai", content: cleanText },
            });

            connection.send(JSON.stringify({ event: "tts_done" }));
          }
        } catch (err: any) {
          fastify.log.error(err);
          connection.send(JSON.stringify({ error: err.message }));
        }
      });
    },
  );
}
