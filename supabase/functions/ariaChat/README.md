# ariaChat Function

A Supabase Edge Function that provides streaming AI chat capabilities with persistent context memory.

## Features

- **Streaming Responses**: Real-time token streaming via Server-Sent Events (SSE)
- **Context Memory**: Rolling context window that maintains conversation history
- **Thread Management**: Automatic thread creation and management
- **Database Integration**: All messages logged to `aria_messages` with streaming metadata
- **Authentication**: JWT token verification for secure access
- **Error Handling**: Comprehensive error handling for OpenAI API and database operations

## API Endpoint

```
POST /functions/v1/ariaChat
```

## Request Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Request Body

```json
{
  "thread_id": "optional-existing-thread-id",
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ],
  "context_window_size": 20
}
```

### Parameters

- `thread_id` (optional): Existing conversation thread ID. If not provided, a new thread will be created.
- `messages`: Array of message objects with `role` and `content`
- `context_window_size` (optional): Number of previous messages to include for context (default: 20)

## Response

The function returns a streaming response with `Content-Type: text/event-stream`.

### SSE Event Format

```
data: {"thread_id": "uuid", "content": "partial text"}\n\n
data: {"content": "more text"}\n\n
data: {"thread_id": "uuid", "done": true}\n\n
```

## Database Schema

### aria_threads
```sql
id           uuid PRIMARY KEY
user_id      uuid REFERENCES auth.users
title        text NOT NULL DEFAULT 'New Chat'
created_at   timestamptz DEFAULT now()
updated_at   timestamptz DEFAULT now()
```

### aria_messages
```sql
id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY
thread_id   uuid REFERENCES aria_threads
role        aria_role NOT NULL ('user' | 'assistant' | 'system')
content     text NOT NULL
is_streamed boolean DEFAULT true
created_at  timestamptz DEFAULT now()
```

## Environment Variables

Required environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `OPENAI_ARIA_KEY`: OpenAI API key
- `ARIA_MODEL`: OpenAI model to use (default: 'gpt-4o-mini')

## Usage Example

### JavaScript/TypeScript Client

```typescript
const response = await fetch('/functions/v1/ariaChat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    thread_id: 'existing-thread-id', // optional
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    context_window_size: 15
  }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.content) {
        console.log('Received token:', data.content);
      }
      if (data.done) {
        console.log('Stream complete, thread:', data.thread_id);
      }
    }
  }
}
```

### cURL Example

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/ariaChat' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }' \
  --no-buffer
```

## Development

### Local Testing

1. Install Supabase CLI:
   ```bash
   npm install -g @supabase/cli
   ```

2. Serve the function locally:
   ```bash
   supabase functions serve ariaChat
   ```

3. Test with curl or your client application

### Running Tests

```bash
npm test tests/ariaChat.test.ts
```

## Error Handling

The function handles various error scenarios:

- **401 Unauthorized**: Invalid or missing JWT token
- **405 Method Not Allowed**: Non-POST requests
- **500 Internal Server Error**: OpenAI API errors, database errors, or other server issues

Error responses are returned as JSON:

```json
{
  "error": "Error description"
}
```