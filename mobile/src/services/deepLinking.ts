import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedAnalyticsService from './analytics.enhanced';
import { NavigationContainerRef } from '@react-navigation/native';

// Deep link URL schemes
const URL_SCHEMES = {
  production: 'catalyft://',
  development: 'catalyft-dev://',
  universal: 'https://app.catalyft.com/',
};

// Deep link routes
export const DEEP_LINK_ROUTES = {
  // Onboarding routes
  ONBOARDING_WELCOME: 'onboarding/welcome',
  ONBOARDING_GOALS: 'onboarding/goals',
  ONBOARDING_ASSESSMENT: 'onboarding/assessment',
  ONBOARDING_PERSONALIZATION: 'onboarding/personalization',
  ONBOARDING_PLAN: 'onboarding/plan',
  ONBOARDING_RESUME: 'onboarding/resume',
  
  // App routes
  WORKOUT: 'workout/:workoutId?',
  PROFILE: 'profile/:userId?',
  CHALLENGE: 'challenge/:challengeId',
  SUBSCRIPTION: 'subscription/:plan?',
  REFERRAL: 'referral/:code',
  
  // Special routes
  RESET_PASSWORD: 'auth/reset-password',
  VERIFY_EMAIL: 'auth/verify-email',
  PROMO: 'promo/:code',
};

interface DeepLinkData {
  route: string;
  params?: Record<string, any>;
  source?: string;
  campaign?: string;
  timestamp: number;
}

class DeepLinkingService {
  private static instance: DeepLinkingService;
  private navigationRef: NavigationContainerRef<any> | null = null;
  private pendingDeepLink: DeepLinkData | null = null;
  private deepLinkHistory: DeepLinkData[] = [];
  private initialized: boolean = false;
  
  private constructor() {}
  
  static getInstance(): DeepLinkingService {
    if (!DeepLinkingService.instance) {
      DeepLinkingService.instance = new DeepLinkingService();
    }
    return DeepLinkingService.instance;
  }
  
  async initialize(navigationRef: NavigationContainerRef<any>): Promise<void> {
    if (this.initialized) return;
    
    this.navigationRef = navigationRef;
    
    // Load deep link history
    await this.loadHistory();
    
    // Set up deep link handlers
    this.setupDeepLinkHandlers();
    
    // Check for initial deep link
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      await this.handleDeepLink(initialUrl, 'initial');
    }
    
    this.initialized = true;
    console.log('Deep linking service initialized');
  }
  
  private setupDeepLinkHandlers(): void {
    // Handle deep links when app is running
    Linking.addEventListener('url', this.handleUrlEvent);
  }
  
  private handleUrlEvent = (event: { url: string }) => {
    this.handleDeepLink(event.url, 'foreground');
  };
  
  async handleDeepLink(url: string, source: string = 'unknown'): Promise<void> {
    console.log(`Handling deep link: ${url} from ${source}`);
    
    const linkData = this.parseDeepLink(url);
    if (!linkData) {
      console.warn(`Invalid deep link: ${url}`);
      return;
    }
    
    linkData.source = source;
    
    // Track deep link
    EnhancedAnalyticsService.track('deep_link_opened', {
      url,
      route: linkData.route,
      params: linkData.params,
      source,
      campaign: linkData.campaign,
    });
    
    // Store in history
    this.addToHistory(linkData);
    
    // Navigate or store for later
    if (this.navigationRef?.isReady()) {
      await this.navigateToRoute(linkData);
    } else {
      // Store for navigation after app is ready
      this.pendingDeepLink = linkData;
    }
  }
  
  private parseDeepLink(url: string): DeepLinkData | null {
    try {
      // Remove scheme
      const scheme = this.getScheme();
      let path = url.replace(scheme, '');
      path = path.replace('https://app.catalyft.com/', '');
      
      // Parse query parameters
      const [route, queryString] = path.split('?');
      const params: Record<string, any> = {};
      
      if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
      }
      
      // Extract campaign parameters
      const campaign = params.utm_campaign || params.campaign;
      delete params.utm_campaign;
      delete params.campaign;
      
      return {
        route,
        params: Object.keys(params).length > 0 ? params : undefined,
        campaign,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to parse deep link:', error);
      return null;
    }
  }
  
  private getScheme(): string {
    return __DEV__ ? URL_SCHEMES.development : URL_SCHEMES.production;
  }
  
  private async navigateToRoute(linkData: DeepLinkData): Promise<void> {
    if (!this.navigationRef) return;
    
    const { route, params } = linkData;
    
    // Handle onboarding deep links
    if (route.startsWith('onboarding/')) {
      await this.handleOnboardingDeepLink(route, params);
      return;
    }
    
    // Handle other routes
    switch (route) {
      case 'workout':
        this.navigationRef.navigate('Workout', params);
        break;
        
      case 'profile':
        this.navigationRef.navigate('Profile', params);
        break;
        
      case 'challenge':
        this.navigationRef.navigate('Challenge', params);
        break;
        
      case 'subscription':
        this.navigationRef.navigate('Subscription', params);
        break;
        
      case 'referral':
        await this.handleReferral(params?.code);
        break;
        
      case 'auth/reset-password':
        this.navigationRef.navigate('ResetPassword', params);
        break;
        
      case 'auth/verify-email':
        this.navigationRef.navigate('VerifyEmail', params);
        break;
        
      case 'promo':
        await this.handlePromoCode(params?.code);
        break;
        
      default:
        console.warn(`Unknown deep link route: ${route}`);
    }
  }
  
  private async handleOnboardingDeepLink(route: string, params?: Record<string, any>): Promise<void> {
    const onboardingStep = route.replace('onboarding/', '');
    
    // Check if user has already completed onboarding
    const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
    if (onboardingCompleted === 'true' && onboardingStep !== 'resume') {
      console.log('User has already completed onboarding');
      this.navigationRef?.navigate('MainTabs');
      return;
    }
    
    // Save onboarding state for resume
    if (onboardingStep === 'resume') {
      const savedState = await this.getOnboardingState();
      if (savedState) {
        this.resumeOnboarding(savedState);
      } else {
        this.navigationRef?.navigate('Welcome');
      }
      return;
    }
    
    // Navigate to specific onboarding step
    switch (onboardingStep) {
      case 'welcome':
        this.navigationRef?.navigate('Welcome');
        break;
        
      case 'goals':
        this.navigationRef?.navigate('GoalSelection', params);
        break;
        
      case 'assessment':
        this.navigationRef?.navigate('FitnessAssessment', params);
        break;
        
      case 'personalization':
        this.navigationRef?.navigate('Personalization', params);
        break;
        
      case 'plan':
        this.navigationRef?.navigate('PlanSelection', params);
        break;
        
      default:
        this.navigationRef?.navigate('Welcome');
    }
    
    // Track onboarding deep link
    EnhancedAnalyticsService.track('onboarding_deep_link', {
      step: onboardingStep,
      params,
    });
  }
  
  async saveOnboardingState(step: string, data: Record<string, any>): Promise<void> {
    const state = {
      currentStep: step,
      data,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem('onboarding_state', JSON.stringify(state));
    
    // Generate resume link
    const resumeLink = this.generateDeepLink('onboarding/resume', {
      step,
      saved: 'true',
    });
    
    console.log(`Onboarding state saved. Resume link: ${resumeLink}`);
  }
  
  private async getOnboardingState(): Promise<any> {
    try {
      const state = await AsyncStorage.getItem('onboarding_state');
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.error('Failed to get onboarding state:', error);
      return null;
    }
  }
  
  private async resumeOnboarding(state: any): Promise<void> {
    const { currentStep, data } = state;
    
    // Track resume
    EnhancedAnalyticsService.track('onboarding_resumed', {
      step: currentStep,
      time_elapsed: Date.now() - state.timestamp,
    });
    
    // Navigate to the saved step with saved data
    this.handleOnboardingDeepLink(`onboarding/${currentStep}`, data);
  }
  
  private async handleReferral(code?: string): Promise<void> {
    if (!code) return;
    
    // Save referral code
    await AsyncStorage.setItem('referral_code', code);
    
    // Track referral
    EnhancedAnalyticsService.track('referral_link_opened', {
      code,
    });
    
    // Navigate to signup with referral
    this.navigationRef?.navigate('SignUp', { referralCode: code });
  }
  
  private async handlePromoCode(code?: string): Promise<void> {
    if (!code) return;
    
    // Save promo code
    await AsyncStorage.setItem('promo_code', code);
    
    // Track promo
    EnhancedAnalyticsService.track('promo_link_opened', {
      code,
    });
    
    // Navigate to subscription with promo
    this.navigationRef?.navigate('Subscription', { promoCode: code });
  }
  
  // Generate deep links
  generateDeepLink(route: string, params?: Record<string, any>): string {
    const scheme = this.getScheme();
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    
    return `${scheme}${route}${queryString}`;
  }
  
  generateUniversalLink(route: string, params?: Record<string, any>): string {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    
    return `${URL_SCHEMES.universal}${route}${queryString}`;
  }
  
  // Generate share links
  generateShareLink(type: 'workout' | 'challenge' | 'referral', id?: string): string {
    const userId = 'current_user_id'; // TODO: Get from auth service
    
    switch (type) {
      case 'workout':
        return this.generateUniversalLink(`workout/${id}`, {
          shared_by: userId,
          utm_source: 'share',
          utm_medium: 'social',
        });
        
      case 'challenge':
        return this.generateUniversalLink(`challenge/${id}`, {
          invited_by: userId,
          utm_source: 'share',
          utm_medium: 'social',
        });
        
      case 'referral':
        return this.generateUniversalLink('referral', {
          code: userId, // Use user ID as referral code
          utm_source: 'referral',
          utm_medium: 'user',
        });
        
      default:
        return '';
    }
  }
  
  // Process pending deep link
  async processPendingDeepLink(): Promise<void> {
    if (this.pendingDeepLink && this.navigationRef?.isReady()) {
      await this.navigateToRoute(this.pendingDeepLink);
      this.pendingDeepLink = null;
    }
  }
  
  // History management
  private async addToHistory(linkData: DeepLinkData): Promise<void> {
    this.deepLinkHistory.push(linkData);
    
    // Keep only last 50 links
    if (this.deepLinkHistory.length > 50) {
      this.deepLinkHistory.shift();
    }
    
    await this.saveHistory();
  }
  
  private async saveHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'deep_link_history',
        JSON.stringify(this.deepLinkHistory)
      );
    } catch (error) {
      console.error('Failed to save deep link history:', error);
    }
  }
  
  private async loadHistory(): Promise<void> {
    try {
      const history = await AsyncStorage.getItem('deep_link_history');
      if (history) {
        this.deepLinkHistory = JSON.parse(history);
      }
    } catch (error) {
      console.error('Failed to load deep link history:', error);
    }
  }
  
  getHistory(): DeepLinkData[] {
    return this.deepLinkHistory;
  }
  
  // Cleanup
  cleanup(): void {
    Linking.removeAllListeners('url');
    this.navigationRef = null;
    this.initialized = false;
  }
}

export default DeepLinkingService.getInstance();