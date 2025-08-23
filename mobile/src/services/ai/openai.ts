import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../../config';

class AriaService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY || 'dummy-key-for-ci',
    });
  }

  async chat(message: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are ARIA, a friendly AI fitness coach.' },
          { role: 'user', content: message }
        ],
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('ARIA chat error:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  }
}

export const ariaService = new AriaService();
