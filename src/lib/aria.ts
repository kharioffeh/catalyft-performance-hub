
import { supabase } from '@/integrations/supabase/client';

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
}

/**
 * Send a chat request to ARIA through the authenticated proxy
 * @param messages Array of chat messages
 * @param options Optional configuration for the chat request
 * @returns Promise resolving to OpenAI chat completion response
 */
export async function ariaChat(
  messages: AriaChatMessage[],
  options: AriaChatOptions = {}
): Promise<AriaChatResponse> {
  try {
    console.log('Making ARIA chat request:', { messages, options });
    
    const { data, error } = await supabase.functions.invoke('aria-chat-proxy', {
      body: {
        messages,
        model: options.model,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        stream: options.stream || false,
      },
    });

    if (error) {
      console.error('ARIA chat error:', error);
      throw new Error(`ARIA chat failed: ${error.message}`);
    }

    console.log('ARIA chat response received');
    return data as AriaChatResponse;
  } catch (error) {
    console.error('Error in ariaChat:', error);
    throw error;
  }
}

/**
 * Check if the current user can access ARIA features
 * This is a client-side helper that checks authentication status
 */
export async function canCallAria(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    console.error('Error checking ARIA access:', error);
    return false;
  }
}

/**
 * Simple wrapper for common ARIA chat patterns
 */
export class AriaChat {
  private messages: AriaChatMessage[] = [];
  private systemPrompt?: string;

  constructor(systemPrompt?: string) {
    this.systemPrompt = systemPrompt;
    if (systemPrompt) {
      this.messages.push({ role: 'system', content: systemPrompt });
    }
  }

  /**
   * Add a user message to the conversation
   */
  addUserMessage(content: string): void {
    this.messages.push({ role: 'user', content });
  }

  /**
   * Add an assistant message to the conversation
   */
  addAssistantMessage(content: string): void {
    this.messages.push({ role: 'assistant', content });
  }

  /**
   * Send the current conversation to ARIA and get a response
   */
  async send(options?: AriaChatOptions): Promise<string> {
    const response = await ariaChat(this.messages, options);
    const assistantMessage = response.choices[0]?.message?.content || '';
    
    if (assistantMessage) {
      this.addAssistantMessage(assistantMessage);
    }
    
    return assistantMessage;
  }

  /**
   * Get the current conversation messages
   */
  getMessages(): AriaChatMessage[] {
    return [...this.messages];
  }

  /**
   * Clear the conversation (keeping system prompt if any)
   */
  clear(): void {
    this.messages = this.systemPrompt 
      ? [{ role: 'system', content: this.systemPrompt }]
      : [];
  }
}
