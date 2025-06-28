
export interface AriaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AriaChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface AriaChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  thread_id?: string;
}

export interface AriaThread {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  message_count?: number;
}

export interface AriaMessage {
  id: number;
  thread_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}
