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

/**
 * Send a chat request to ARIA through the authenticated proxy
 * @param messages Array of chat messages
 * @param threadId Optional thread ID to continue existing conversation
 * @param options Optional configuration for the chat request
 * @returns Promise resolving to OpenAI chat completion response with thread_id
 */
export async function ariaChat(
  messages: AriaChatMessage[],
  threadId?: string,
  options: AriaChatOptions = {}
): Promise<AriaChatResponse> {
  try {
    console.log('Making ARIA chat request:', { messages: messages.length, threadId, options });
    
    const { data, error } = await supabase.functions.invoke('aria-chat-and-log', {
      body: {
        messages,
        thread_id: threadId,
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
 * Stream ARIA chat responses with real-time token delivery
 * @param messages Array of chat messages
 * @param threadId Optional thread ID to continue existing conversation
 * @param onToken Callback function called for each token received
 * @param options Optional configuration for the chat request
 * @returns Promise resolving with thread_id and final content
 */
export async function ariaStream(
  messages: AriaChatMessage[],
  threadId?: string,
  onToken?: (token: string) => void,
  options: AriaChatOptions = {}
): Promise<{ thread_id: string; content: string }> {
  try {
    console.log('Making ARIA stream request:', { messages: messages.length, threadId, options });
    
    const { data, error } = await supabase.functions.invoke('aria-chat-and-log-stream', {
      body: {
        messages,
        thread_id: threadId,
        model: options.model,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
      },
    });

    if (error) {
      console.error('ARIA stream error:', error);
      throw new Error(`ARIA stream failed: ${error.message}`);
    }

    return new Promise<{ thread_id: string; content: string }>((resolve, reject) => {
      try {
        const reader = (data as ReadableStream).getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let extractedThreadId = threadId;

        const processChunk = async () => {
          try {
            const { value, done } = await reader.read();
            
            if (done) {
              console.log('Stream completed');
              resolve({ 
                thread_id: extractedThreadId || '', 
                content: fullContent 
              });
              return;
            }

            const chunk = decoder.decode(value);
            buffer += chunk;

            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '');
                if (dataStr === '[DONE]') continue;
                
                try {
                  const data = JSON.parse(dataStr);
                  
                  // Extract thread_id from metadata
                  if (data.thread_id && !extractedThreadId) {
                    extractedThreadId = data.thread_id;
                  }
                  
                  // Extract content tokens
                  const delta = data.choices?.[0]?.delta;
                  if (delta?.content) {
                    const token = delta.content;
                    fullContent += token;
                    onToken?.(token);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }

            // Continue processing
            processChunk();
          } catch (error) {
            reject(error);
          }
        };

        processChunk();
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in ariaStream:', error);
    throw error;
  }
}

/**
 * Get all threads for the current user
 */
export async function getAriaThreads(): Promise<AriaThread[]> {
  try {
    const { data, error } = await supabase
      .from('v_aria_thread_last')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching threads:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAriaThreads:', error);
    throw error;
  }
}

/**
 * Get messages for a specific thread
 */
export async function getAriaMessages(threadId: string): Promise<AriaMessage[]> {
  try {
    const { data, error } = await supabase
      .from('aria_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAriaMessages:', error);
    throw error;
  }
}

/**
 * Update thread title
 */
export async function updateThreadTitle(threadId: string, title: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('aria_threads')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (error) {
      console.error('Error updating thread title:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateThreadTitle:', error);
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
 * Enhanced wrapper for ARIA chat patterns with thread support
 */
export class AriaChat {
  private messages: AriaChatMessage[] = [];
  private systemPrompt?: string;
  private threadId?: string;

  constructor(systemPrompt?: string, threadId?: string) {
    this.systemPrompt = systemPrompt;
    this.threadId = threadId;
    if (systemPrompt) {
      this.messages.push({ role: 'system', content: systemPrompt });
    }
  }

  /**
   * Load existing conversation from thread ID
   */
  async loadThread(threadId: string): Promise<void> {
    try {
      const messages = await getAriaMessages(threadId);
      this.threadId = threadId;
      this.messages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Re-add system prompt if it exists and isn't already there
      if (this.systemPrompt && (this.messages.length === 0 || this.messages[0].role !== 'system')) {
        this.messages.unshift({ role: 'system', content: this.systemPrompt });
      }
    } catch (error) {
      console.error('Error loading thread:', error);
      throw error;
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
    const response = await ariaChat(this.messages, this.threadId, options);
    const assistantMessage = response.choices[0]?.message?.content || '';
    
    // Update thread ID if this was a new conversation
    if (response.thread_id && !this.threadId) {
      this.threadId = response.thread_id;
    }
    
    return assistantMessage;
  }

  /**
   * Send the current conversation to ARIA with streaming and get progressive response
   */
  async sendStream(
    onToken?: (token: string) => void,
    options?: AriaChatOptions
  ): Promise<string> {
    const response = await ariaStream(this.messages, this.threadId, onToken, options);
    
    // Update thread ID if this was a new conversation
    if (response.thread_id && !this.threadId) {
      this.threadId = response.thread_id;
    }
    
    return response.content;
  }

  /**
   * Get the current thread ID
   */
  getThreadId(): string | undefined {
    return this.threadId;
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
    this.threadId = undefined;
  }
}
