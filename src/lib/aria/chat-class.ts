
import { ariaChat } from './client';
import { ariaStream } from './streaming';
import { getAriaMessages } from './threads';
import type { AriaChatMessage, AriaChatOptions } from './types';

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
