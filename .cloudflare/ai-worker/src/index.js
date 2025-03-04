import { Hono } from "hono";
import { cors } from "hono/cors";

import { smoothStream, streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { stream } from "hono/streaming";

const app = new Hono();

/**
 * Estimates token count from text length (rough approximation)
 * @param {string} text - Input text to estimate
 * @returns {number} - Estimated token count
 */
const estimateTokens = (text) => Math.ceil(text.length / 4);

app.use(
  "/*",
  cors({
    origin: ["https://learn-the-web.vercel.app"],
    allowMethods: ["POST", "OPTIONS"],
    maxAge: 600,
  }),
);

/**
 * AI Assistant API endpoint that processes web development related questions
 *
 * @route POST /api/assistant
 * @param {object} c - Hono context object containing request/response data
 * @returns {Stream} - Text stream containing the AI-generated response
 */
app.post("/api/assistant", async (c) => {
  const { messages } = await c.req.json();

  if (!messages) {
    return c.json({ error: "Missing messages" }, 400);
  }

  const totalTokens = messages.reduce(
    (sum, message) => sum + estimateTokens(message.content || ""),
    0,
  );

  if (totalTokens > 2560) {
    return c.json({ error: "Chat exceeds maximum token limit of 2560" }, 400);
  }

  const ipAddress = c.req.header("cf-connecting-ip");
  const { success } = await c.env.RATE_LIMITER.limit({ key: ipAddress });

  if (!success) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const workersai = createWorkersAI({
    binding: c.env.AI,
    gateway: {
      id: "learn-the-web",
      skipCache: false,
      cacheTtl: 3360,
    },
  });
  const model = workersai("@cf/meta/llama-3.1-8b-instruct-fp8-fast");

  const result = streamText({
    model,
    system: `You are a helpful web development assistant.
      Provide clear, concise answers about HTML, CSS, JavaScript, and other web technologies including data structures, algorithms, and databases.
      Ensure your answers are accurate and up-to-date.
      Include code examples when relevant.
      Keep your answers focused on web development topics.
      Respond in a friendly and helpful manner.
      Remember to be concise and to the point.`,
    messages,
    maxTokens: 1024, // Maximum tokens to generate
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "line",
    }),
  });

  c.header("Content-Type", "text/x-unknown");
  c.header("content-encoding", "identity");
  c.header("transfer-encoding", "chunked");

  return stream(c, (stream) => stream.pipe(result.toDataStream()));
});

export default app;
