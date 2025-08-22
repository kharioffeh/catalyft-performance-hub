import OpenAI from 'openai';
import { supabase } from '../supabase';
import { OPENAI_API_KEY, OPENAI_ARIA_KEY } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConversationContext,
  AriaMessage,
  WorkoutRequirements,
  WorkoutPlan,
  MealPreferences,
  MealPlan,
  FormAnalysis,
  MotivationTrigger,
  ProgressInsight,
  Workout,
  DailyNutrition,
  UserGoals,
  UserPreferences,
  ExerciseHistory,
  UserPsychProfile,
  StreamResponse
} from '../../types/ai';
import {
  buildSystemPrompt,
  generateWorkoutPrompt,
  generateMealPrompt,
  CONTEXT_BUILDERS,
  SPECIALIZED_PROMPTS,
  FORM_CHECK_VISION_PROMPT,
  ERROR_MESSAGES
} from '../../utils/prompts/ariaSystemPrompts';

export class AriaService {
  private openai: OpenAI;
  private conversationHistory: Map<string, AriaMessage[]> = new Map();
  private userContext: Map<string, ConversationContext> = new Map();
  private offlineMode: boolean = false;
  
  constructor() {
    // Use ARIA key if available, otherwise fall back to main OpenAI key
    const apiKey = OPENAI_ARIA_KEY || OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('ARIA: No OpenAI API key configured. Please add OPENAI_API_KEY to your .env file');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.initializeOfflineDetection();
  }

  private initializeOfflineDetection() {
    // Check network status and switch to offline mode if needed
    // This would integrate with React Native's NetInfo
  }
  
  // Advanced chat with streaming
  async chatStream(
    userId: string,
    message: string,
    onChunk: (chunk: string) => void,
    onComplete?: () => void
  ): Promise<void> {
    try {
      const context = await this.buildContext(userId);
      const messages = await this.buildMessages(userId, message, context);
      
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      let fullResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        onChunk(content);
      }
      
      // Save to conversation history
      await this.saveMessage(userId, message, 'user');
      await this.saveMessage(userId, fullResponse, 'aria');
      
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Chat stream error:', error);
      onChunk(ERROR_MESSAGES.apiError);
      if (onComplete) onComplete();
    }
  }
  
  // Regular chat without streaming
  async chat(userId: string, message: string): Promise<string> {
    try {
      const context = await this.buildContext(userId);
      const messages = await this.buildMessages(userId, message, context);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      const reply = response.choices[0]?.message?.content || '';
      
      // Save to conversation history
      await this.saveMessage(userId, message, 'user');
      await this.saveMessage(userId, reply, 'aria');
      
      return reply;
    } catch (error) {
      console.error('Chat error:', error);
      return ERROR_MESSAGES.apiError;
    }
  }
  
  // Form analysis using GPT-4 Vision
  async analyzeForm(videoFrames: string[], exercise: string): Promise<FormAnalysis> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: FORM_CHECK_VISION_PROMPT
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze my ${exercise} form` },
              ...videoFrames.map(frame => ({
                type: 'image_url' as const,
                image_url: { url: frame }
              }))
            ]
          }
        ],
        max_tokens: 500,
      });
      
      return this.parseFormAnalysis(response);
    } catch (error) {
      console.error('Form analysis error:', error);
      throw error;
    }
  }
  
  // Intelligent workout generation
  async generateWorkoutPlan(
    userId: string, 
    requirements: WorkoutRequirements
  ): Promise<WorkoutPlan> {
    try {
      const userHistory = await this.getUserWorkoutHistory(userId);
      const prompt = generateWorkoutPrompt(requirements, userHistory);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate a personalized workout plan based on my requirements and history.' }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });
      
      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Workout generation error:', error);
      throw error;
    }
  }
  
  // Smart meal planning
  async generateMealPlan(
    userId: string, 
    preferences: MealPreferences
  ): Promise<MealPlan> {
    try {
      const nutritionHistory = await this.getUserNutritionHistory(userId);
      const prompt = generateMealPrompt(preferences, nutritionHistory);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Create a personalized meal plan based on my preferences and goals.' }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
      
      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Meal planning error:', error);
      throw error;
    }
  }
  
  // Motivation based on user psychology
  async getMotivation(
    userId: string, 
    trigger: MotivationTrigger
  ): Promise<string> {
    try {
      const userProfile = await this.getUserPsychProfile(userId);
      const context = await this.buildContext(userId);
      
      const prompt = `
        User psychological profile: ${JSON.stringify(userProfile)}
        Trigger: ${trigger.type}
        Context: ${JSON.stringify(trigger.context)}
        
        Provide personalized motivation that resonates with this user's psychology.
        ${userProfile.motivationStyle === 'intrinsic' ? 
          'Focus on personal growth and mastery.' : 
          'Focus on achievements and comparisons.'}
      `;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: buildSystemPrompt(context.preferences!, context) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 200,
      });
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Motivation error:', error);
      return 'Keep pushing forward! Every rep counts towards your goals.';
    }
  }
  
  // Progress insights with predictions
  async analyzeProgress(userId: string): Promise<ProgressInsight[]> {
    try {
      const data = await this.getAllUserData(userId);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { 
            role: 'system', 
            content: 'Analyze fitness progress data and provide insights with predictions.' 
          },
          { 
            role: 'user', 
            content: SPECIALIZED_PROMPTS.progressAnalysis(data) 
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      });
      
      return JSON.parse(response.choices[0]?.message?.content || '[]');
    } catch (error) {
      console.error('Progress analysis error:', error);
      return [];
    }
  }
  
  // Plateau breaking advice
  async getPlateauAdvice(
    userId: string, 
    exercise: string
  ): Promise<string> {
    try {
      const history = await this.getExerciseHistory(userId, exercise);
      const context = await this.buildContext(userId);
      
      const prompt = CONTEXT_BUILDERS.plateauBreaking(exercise, history);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: buildSystemPrompt(context.preferences!, context) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
      });
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Plateau advice error:', error);
      return 'Try varying your rep ranges and adding intensity techniques.';
    }
  }
  
  // Build conversation context
  private async buildContext(userId: string): Promise<ConversationContext> {
    const cached = this.userContext.get(userId);
    if (cached && this.isContextFresh(cached)) {
      return cached;
    }
    
    const [currentWorkout, recentWorkouts, nutritionToday, goals, preferences] = 
      await Promise.all([
        this.getCurrentWorkout(userId),
        this.getRecentWorkouts(userId),
        this.getTodayNutrition(userId),
        this.getUserGoals(userId),
        this.getUserPreferences(userId)
      ]);
    
    const context: ConversationContext = {
      userId,
      sessionId: this.generateSessionId(),
      currentWorkout,
      recentWorkouts,
      nutritionToday,
      goals,
      preferences,
      timeOfDay: this.getTimeOfDay(),
      energyLevel: await this.estimateEnergyLevel(userId)
    };
    
    this.userContext.set(userId, context);
    return context;
  }
  
  // Build chat messages with history
  private async buildMessages(
    userId: string, 
    message: string, 
    context: ConversationContext
  ): Promise<any[]> {
    const history = this.conversationHistory.get(userId) || [];
    const recentHistory = history.slice(-10); // Keep last 10 messages for context
    
    const systemPrompt = buildSystemPrompt(context.preferences!, context);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];
    
    return messages;
  }
  
  // Helper methods for data retrieval
  private async getCurrentWorkout(userId: string): Promise<any> {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    return data;
  }
  
  private async getRecentWorkouts(userId: string): Promise<Workout[]> {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);
    return data || [];
  }
  
  private async getTodayNutrition(userId: string): Promise<DailyNutrition | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('nutrition')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    return data;
  }
  
  private async getUserGoals(userId: string): Promise<UserGoals | undefined> {
    const { data } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data;
  }
  
  private async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data;
  }
  
  private async getUserWorkoutHistory(userId: string): Promise<any> {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
    return data;
  }
  
  private async getUserNutritionHistory(userId: string): Promise<any> {
    const { data } = await supabase
      .from('nutrition')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7);
    return data;
  }
  
  private async getUserPsychProfile(userId: string): Promise<UserPsychProfile> {
    const { data } = await supabase
      .from('user_psych_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return data || {
      motivationStyle: 'mixed',
      responseToFailure: 'resilient',
      preferredFeedback: 'balanced',
      socialPreference: 'solo',
      competitiveness: 5,
      consistencyScore: 70,
      stressResponse: 'neutral'
    };
  }
  
  private async getExerciseHistory(
    userId: string, 
    exercise: string
  ): Promise<ExerciseHistory> {
    const { data } = await supabase
      .from('exercise_history')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_name', exercise)
      .order('date', { ascending: false })
      .limit(20);
    
    // Calculate progression metrics
    const history = data || [];
    const current = history[0] || {};
    const weeksSame = this.calculateWeeksSame(history);
    const progressionRate = this.calculateProgressionRate(history);
    
    return {
      exercise,
      currentWeight: current.weight || 0,
      currentReps: current.reps || 0,
      weeksSame,
      progressionRate,
      personalRecord: Math.max(...history.map((h: any) => h.weight || 0)),
      lastPR: new Date(history.find((h: any) => h.weight === Math.max(...history.map((h2: any) => h2.weight)))?.date || new Date()),
      volumeTrend: this.calculateVolumeTrend(history)
    };
  }
  
  private async getAllUserData(userId: string): Promise<any> {
    const [workouts, nutrition, goals, measurements] = await Promise.all([
      this.getUserWorkoutHistory(userId),
      this.getUserNutritionHistory(userId),
      this.getUserGoals(userId),
      this.getUserMeasurements(userId)
    ]);
    
    return { workouts, nutrition, goals, measurements };
  }
  
  private async getUserMeasurements(userId: string): Promise<any> {
    const { data } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
    return data;
  }
  
  // Utility methods
  private parseFormAnalysis(response: any): FormAnalysis {
    const content = response.choices[0]?.message?.content || '';
    // Parse the structured response into FormAnalysis object
    // This would need proper parsing logic based on the response format
    return {
      id: this.generateId(),
      exercise: '',
      date: new Date(),
      overallScore: 0,
      issues: [],
      improvements: [],
      goodPoints: [],
      recommendations: []
    };
  }
  
  private calculateWeeksSame(history: any[]): number {
    if (history.length < 2) return 0;
    
    const currentWeight = history[0].weight;
    let weeks = 0;
    
    for (let i = 1; i < history.length; i++) {
      if (history[i].weight === currentWeight) {
        weeks++;
      } else {
        break;
      }
    }
    
    return Math.floor(weeks / 2); // Assuming 2 workouts per week
  }
  
  private calculateProgressionRate(history: any[]): number {
    if (history.length < 4) return 0;
    
    const recentHistory = history.slice(0, 8);
    const totalIncrease = recentHistory[0].weight - recentHistory[recentHistory.length - 1].weight;
    const weeks = recentHistory.length / 2;
    
    return totalIncrease / weeks;
  }
  
  private calculateVolumeTrend(history: any[]): 'increasing' | 'stable' | 'decreasing' {
    if (history.length < 4) return 'stable';
    
    const recentVolume = history.slice(0, 4).reduce((sum: number, h: any) => 
      sum + (h.weight * h.reps * h.sets), 0);
    const previousVolume = history.slice(4, 8).reduce((sum: number, h: any) => 
      sum + (h.weight * h.reps * h.sets), 0);
    
    const change = ((recentVolume - previousVolume) / previousVolume) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }
  
  private async estimateEnergyLevel(userId: string): Promise<number> {
    // Estimate based on sleep, recent workouts, time of day
    const recentWorkouts = await this.getRecentWorkouts(userId);
    const today = new Date();
    const workoutToday = recentWorkouts.find(w => 
      new Date(w.date).toDateString() === today.toDateString()
    );
    
    if (workoutToday) return 6; // Post-workout fatigue
    
    const hour = today.getHours();
    if (hour >= 9 && hour <= 11) return 9; // Morning peak
    if (hour >= 14 && hour <= 16) return 5; // Afternoon slump
    if (hour >= 17 && hour <= 19) return 8; // Evening energy
    
    return 7; // Default
  }
  
  private isContextFresh(context: ConversationContext): boolean {
    // Check if context is less than 5 minutes old
    // In a real app, you'd check timestamp
    return true;
  }
  
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private async saveMessage(
    userId: string, 
    content: string, 
    sender: 'user' | 'aria'
  ): Promise<void> {
    const message: AriaMessage = {
      id: this.generateId(),
      type: 'text',
      content,
      sender,
      timestamp: new Date()
    };
    
    const history = this.conversationHistory.get(userId) || [];
    history.push(message);
    
    // Keep only last 50 messages in memory
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.conversationHistory.set(userId, history);
    
    // Also save to persistent storage
    await this.saveToStorage(userId, message);
  }
  
  private async saveToStorage(userId: string, message: AriaMessage): Promise<void> {
    try {
      const key = `aria_history_${userId}`;
      const stored = await AsyncStorage.getItem(key);
      const history = stored ? JSON.parse(stored) : [];
      
      history.push(message);
      
      // Keep only last 100 messages in storage
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save message to storage:', error);
    }
  }
  
  // Load conversation history from storage
  async loadConversationHistory(userId: string): Promise<void> {
    try {
      const key = `aria_history_${userId}`;
      const stored = await AsyncStorage.getItem(key);
      
      if (stored) {
        const history = JSON.parse(stored);
        this.conversationHistory.set(userId, history);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }
  
  // Clear conversation history
  async clearHistory(userId: string): Promise<void> {
    this.conversationHistory.delete(userId);
    this.userContext.delete(userId);
    
    try {
      const key = `aria_history_${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear history from storage:', error);
    }
  }
}

// Export singleton instance
export const ariaService = new AriaService();