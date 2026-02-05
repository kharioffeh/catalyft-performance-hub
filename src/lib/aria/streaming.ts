
import { supabase } from '@/integrations/supabase/client';
import type { AriaChatMessage, AriaChatOptions } from './types';

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
