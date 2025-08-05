import { config } from '../config';

interface AIInsight {
  id: string;
  title: string;
  content: string;
  type: 'recommendation' | 'warning' | 'achievement' | 'tip';
  icon: string;
  color: string;
}

interface UserMetrics {
  strain: number;
  recovery: number;
  sleep: number;
  hrv: number;
  recentWorkouts: any[];
  nutritionData?: any;
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = config.openai.apiKey;
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. AI features will use fallback data.');
    }
  }

  async generateHealthInsights(userMetrics: UserMetrics): Promise<AIInsight[]> {
    if (!this.apiKey) {
      return this.getFallbackInsights(userMetrics);
    }

    try {
      const prompt = this.buildInsightPrompt(userMetrics);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a fitness and health AI coach. Provide concise, actionable insights based on user health data. Return insights as JSON array with title, content, type, icon, and color fields.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        console.error('OpenAI API error:', response.status);
        return this.getFallbackInsights(userMetrics);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      if (aiResponse) {
        try {
          return JSON.parse(aiResponse);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          return this.parseAITextResponse(aiResponse, userMetrics);
        }
      }

      return this.getFallbackInsights(userMetrics);
    } catch (error) {
      console.error('OpenAI service error:', error);
      return this.getFallbackInsights(userMetrics);
    }
  }

  async generateWorkoutRecommendation(userMetrics: UserMetrics): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackWorkoutRecommendation(userMetrics);
    }

    try {
      const prompt = `Based on user metrics - Strain: ${userMetrics.strain}, Recovery: ${userMetrics.recovery}%, Sleep: ${userMetrics.sleep}h, HRV: ${userMetrics.hrv}ms - recommend today's workout type and intensity. Keep it under 50 words.`;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a fitness coach. Provide concise workout recommendations based on recovery metrics.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        return this.getFallbackWorkoutRecommendation(userMetrics);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.getFallbackWorkoutRecommendation(userMetrics);
    } catch (error) {
      console.error('OpenAI workout recommendation error:', error);
      return this.getFallbackWorkoutRecommendation(userMetrics);
    }
  }

  async generateNutritionInsight(nutritionData: any): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackNutritionInsight(nutritionData);
    }

    try {
      const prompt = `Analyze nutrition data: ${JSON.stringify(nutritionData)}. Provide a brief insight about macro balance and suggestions. Keep under 40 words.`;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition coach. Provide brief, actionable nutrition insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 80,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        return this.getFallbackNutritionInsight(nutritionData);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.getFallbackNutritionInsight(nutritionData);
    } catch (error) {
      console.error('OpenAI nutrition insight error:', error);
      return this.getFallbackNutritionInsight(nutritionData);
    }
  }

  private buildInsightPrompt(userMetrics: UserMetrics): string {
    return `Analyze this fitness data and provide 2-3 actionable insights:
    
Strain: ${userMetrics.strain}/20 (current training load)
Recovery: ${userMetrics.recovery}% (readiness for training) 
Sleep: ${userMetrics.sleep} hours last night
HRV: ${userMetrics.hrv}ms (heart rate variability)
Recent workouts: ${userMetrics.recentWorkouts.length} in past week

Provide insights as JSON array with format:
[{
  "title": "Insight title",
  "content": "Actionable advice (max 100 chars)",
  "type": "recommendation|warning|achievement",
  "icon": "bulb|alert-circle|trophy", 
  "color": "#F59E0B|#EF4444|#10B981"
}]`;
  }

  private parseAITextResponse(response: string, userMetrics: UserMetrics): AIInsight[] {
    // If JSON parsing fails, create insights from text response
    const insights: AIInsight[] = [];
    
    if (response.toLowerCase().includes('recovery') || response.toLowerCase().includes('rest')) {
      insights.push({
        id: '1',
        title: 'Recovery Focus',
        content: response.substring(0, 100),
        type: 'recommendation',
        icon: 'heart',
        color: '#10B981'
      });
    }
    
    if (response.toLowerCase().includes('sleep')) {
      insights.push({
        id: '2',
        title: 'Sleep Optimization',
        content: response.substring(0, 100),
        type: 'tip',
        icon: 'moon',
        color: '#8B5CF6'
      });
    }
    
    return insights.length > 0 ? insights : this.getFallbackInsights(userMetrics);
  }

  private getFallbackInsights(userMetrics: UserMetrics): AIInsight[] {
    const insights: AIInsight[] = [];

    // Strain-based insights
    if (userMetrics.strain > 15) {
      insights.push({
        id: '1',
        title: 'High Strain Alert',
        content: 'Your strain is very high. Consider active recovery or rest today.',
        type: 'warning',
        icon: 'alert-circle',
        color: '#EF4444'
      });
    } else if (userMetrics.strain > 10) {
      insights.push({
        id: '1',
        title: 'Moderate Training Load',
        content: 'Good training intensity. Monitor recovery for tomorrow.',
        type: 'recommendation',
        icon: 'activity',
        color: '#F59E0B'
      });
    }

    // Recovery-based insights
    if (userMetrics.recovery < 33) {
      insights.push({
        id: '2',
        title: 'Low Recovery',
        content: 'Focus on sleep and stress management. Consider light activity only.',
        type: 'warning',
        icon: 'alert-triangle',
        color: '#EF4444'
      });
    } else if (userMetrics.recovery > 67) {
      insights.push({
        id: '2',
        title: 'Great Recovery',
        content: 'You\'re ready for intense training. Consider a challenging workout.',
        type: 'achievement',
        icon: 'trending-up',
        color: '#10B981'
      });
    }

    // Sleep-based insights
    if (userMetrics.sleep < 6) {
      insights.push({
        id: '3',
        title: 'Sleep Deficit',
        content: 'Aim for 7-9 hours tonight. Consider earlier bedtime.',
        type: 'tip',
        icon: 'moon',
        color: '#8B5CF6'
      });
    } else if (userMetrics.sleep > 8) {
      insights.push({
        id: '3',
        title: 'Excellent Sleep',
        content: 'Great sleep quality! Your body is well-recovered.',
        type: 'achievement',
        icon: 'check-circle',
        color: '#10B981'
      });
    }

    return insights.slice(0, 2); // Return max 2 insights
  }

  private getFallbackWorkoutRecommendation(userMetrics: UserMetrics): string {
    if (userMetrics.recovery < 33) {
      return 'Based on low recovery, consider active recovery like light walking or stretching.';
    } else if (userMetrics.recovery > 67 && userMetrics.strain < 10) {
      return 'Your recovery is excellent! Perfect day for high-intensity training or strength work.';
    } else if (userMetrics.sleep < 6) {
      return 'Limited sleep detected. Light cardio or yoga would be ideal today.';
    } else {
      return 'Moderate training recommended. Consider a balanced workout with cardio and strength.';
    }
  }

  private getFallbackNutritionInsight(nutritionData: any): string {
    const { calories = 0, protein = 0, carbs = 0, fat = 0 } = nutritionData || {};
    
    if (protein < 100) {
      return 'Consider increasing protein intake to support muscle recovery and growth.';
    } else if (calories < 1500) {
      return 'Calorie intake seems low. Ensure adequate fuel for your training.';
    } else {
      return 'Good macro balance! Stay consistent with your nutrition goals.';
    }
  }

  // Method to test API connection
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      console.log('No OpenAI API key provided');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

export const openaiService = new OpenAIService();
export default openaiService;