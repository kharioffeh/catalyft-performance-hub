
import { supabase } from '@/integrations/supabase/client';
import type { AriaThread, AriaMessage } from './types';

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
