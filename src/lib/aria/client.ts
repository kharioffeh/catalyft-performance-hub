
import { supabase } from '@/integrations/supabase/client';
import type { AriaChatMessage, AriaChatOptions, AriaChatResponse } from './types';

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
