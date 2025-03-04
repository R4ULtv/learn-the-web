A Cloudflare Worker that provides a helpful web development assistant powered by Cloudflare Workers AI and Meta's Llama 3.1 model.

## Features

- Built with Hono.js framework
- Uses Cloudflare Workers AI with Llama 3.1 (8B parameters)
- Streams AI responses for better user experience
- Includes rate limiting to prevent abuse
- CORS-enabled for cross-origin requests
- Specialized in web development topics (HTML, CSS, JavaScript, etc.)

## Quick Start

Install dependencies:

```
npm install
```

Run locally for development:

```
npm run dev
```

Deploy to Cloudflare Workers:

```
npm run deploy
```

## API Usage

Send a POST request to `/api/assistant` with a JSON body containing an array of messages:

```js
fetch('/api/assistant', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'How do I center a div with CSS?' }
    ]
  })
})
```

The response is streamed back as the AI generates content, providing a responsive user experience.

## Configuration

The worker uses the following environment bindings:
- `AI`: Cloudflare Workers AI binding
- `RATE_LIMITER`: Rate limiter for API requests

## Development

Make changes to `src/index.js` to customize the assistant's behavior or add new endpoints.
