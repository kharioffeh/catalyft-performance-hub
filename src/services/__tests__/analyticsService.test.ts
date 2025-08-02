import { AnalyticsService } from '../analyticsService';

// Mock Amplitude
const mockAmplitude = {
  init: jest.fn(),
  setUserId: jest.fn(),
  identify: jest.fn(),
  track: jest.fn(),
  flush: jest.fn(),
  reset: jest.fn(),
  Identify: jest.fn().mockImplementation(() => ({
    set: jest.fn().mockReturnThis(),
  })),
};

jest.mock('@amplitude/analytics-browser', () => mockAmplitude);

// Mock environment variables
const originalEnv = process.env;

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set mock environment variable
    import.meta.env = {
      ...import.meta.env,
      VITE_AMPLITUDE_API_KEY: 'test-api-key',
    };
    analyticsService = new AnalyticsService();
  });

  afterEach(() => {
    import.meta.env = originalEnv;
  });

  describe('Initialization', () => {
    it('should initialize Amplitude with correct configuration', () => {
      analyticsService.init();

      expect(mockAmplitude.init).toHaveBeenCalledWith('test-api-key', {
        defaultTracking: {
          attribution: true,
          pageViews: true,
          sessions: true,
          formInteractions: true,
          fileDownloads: true,
        },
        autocapture: {
          attribution: true,
          pageViews: true,
          sessions: true,
          formInteractions: true,
          fileDownloads: true,
        },
      });
    });

    it('should not initialize if API key is missing', () => {
      import.meta.env.VITE_AMPLITUDE_API_KEY = '';
      const service = new AnalyticsService();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      service.init();

      expect(mockAmplitude.init).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Amplitude API key not found. Analytics tracking is disabled.'
      );

      consoleSpy.mockRestore();
    });

    it('should not initialize twice', () => {
      analyticsService.init();
      analyticsService.init();

      expect(mockAmplitude.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should set user ID', () => {
      analyticsService.setUserId('user123');

      expect(mockAmplitude.setUserId).toHaveBeenCalledWith('user123');
    });

    it('should set user properties', () => {
      const properties = {
        subscription_tier: 'premium' as const,
        user_type: 'athlete' as const,
        platform: 'web' as const,
      };

      analyticsService.setUserProperties(properties);

      expect(mockAmplitude.identify).toHaveBeenCalled();
    });

    it('should update user properties', () => {
      const properties = {
        subscription_tier: 'standard' as const,
      };

      analyticsService.updateUserProperties(properties);

      expect(mockAmplitude.identify).toHaveBeenCalled();
    });
  });

  describe('Authentication Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track user registration', () => {
      analyticsService.trackUserRegistration('email', 'athlete');

      expect(mockAmplitude.track).toHaveBeenCalledWith('User Registered', {
        registration_method: 'email',
        user_type: 'athlete',
        timestamp: expect.any(String),
      });
    });

    it('should track user login', () => {
      analyticsService.trackUserLogin('google');

      expect(mockAmplitude.track).toHaveBeenCalledWith('User Logged In', {
        login_method: 'google',
        timestamp: expect.any(String),
      });
    });

    it('should track user logout', () => {
      analyticsService.trackUserLogout();

      expect(mockAmplitude.track).toHaveBeenCalledWith('User Logged Out', {
        timestamp: expect.any(String),
      });
    });
  });

  describe('Navigation Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track navigation with default method', () => {
      analyticsService.trackNavigation('/dashboard', '/analytics');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Page Viewed', {
        page: '/analytics',
        from_page: '/dashboard',
        navigation_method: 'link',
      });
    });

    it('should track navigation with specific method', () => {
      analyticsService.trackNavigation('/dashboard', '/analytics', 'tab');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Page Viewed', {
        page: '/analytics',
        from_page: '/dashboard',
        navigation_method: 'tab',
      });
    });
  });

  describe('Workout Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track workout started', () => {
      const properties = {
        session_id: 'session123',
        workout_type: 'Push Day',
        sets_completed: 0,
      };

      analyticsService.trackWorkoutStarted(properties);

      expect(mockAmplitude.track).toHaveBeenCalledWith('Workout Started', {
        ...properties,
        timestamp: expect.any(String),
      });
    });

    it('should track workout completed', () => {
      const properties = {
        session_id: 'session123',
        workout_type: 'Push Day',
        session_duration_minutes: 45,
        sets_completed: 12,
        completion_rate: 85.7,
      };

      analyticsService.trackWorkoutCompleted(properties);

      expect(mockAmplitude.track).toHaveBeenCalledWith('Workout Completed', {
        ...properties,
        timestamp: expect.any(String),
      });
    });

    it('should track set logged', () => {
      analyticsService.trackSetLogged('session123', 'Bench Press', 3);

      expect(mockAmplitude.track).toHaveBeenCalledWith('Set Logged', {
        session_id: 'session123',
        exercise_type: 'Bench Press',
        set_number: 3,
        timestamp: expect.any(String),
      });
    });
  });

  describe('Feature Usage Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track feature usage', () => {
      const properties = {
        feature_name: 'wearable_connection',
        feature_category: 'integrations',
        success: true,
      };

      analyticsService.trackFeatureUsed(properties);

      expect(mockAmplitude.track).toHaveBeenCalledWith('Feature Used', {
        ...properties,
        timestamp: expect.any(String),
      });
    });
  });

  describe('Subscription Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track subscription started', () => {
      analyticsService.trackSubscriptionStarted('premium', 'stripe');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Subscription Started', {
        subscription_tier: 'premium',
        payment_method: 'stripe',
        timestamp: expect.any(String),
      });
    });

    it('should track subscription cancelled', () => {
      analyticsService.trackSubscriptionCancelled('standard', 'too expensive');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Subscription Cancelled', {
        subscription_tier: 'standard',
        cancellation_reason: 'too expensive',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Wearable Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track wearable connected', () => {
      analyticsService.trackWearableConnected('whoop');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Wearable Connected', {
        wearable_type: 'whoop',
        timestamp: expect.any(String),
      });
    });

    it('should track wearable disconnected', () => {
      analyticsService.trackWearableDisconnected('fitbit');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Wearable Disconnected', {
        wearable_type: 'fitbit',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Analytics Page Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track analytics page viewed', () => {
      analyticsService.trackAnalyticsPageViewed('readiness', '30d');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Analytics Page Viewed', {
        analytics_section: 'readiness',
        time_range: '30d',
        timestamp: expect.any(String),
      });
    });
  });

  describe('ARIA Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track ARIA interaction', () => {
      analyticsService.trackAriaInteraction('chat');

      expect(mockAmplitude.track).toHaveBeenCalledWith('ARIA Interaction', {
        interaction_type: 'chat',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Error Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track errors', () => {
      const context = { page: '/workout', action: 'save_set' };
      analyticsService.trackError('api_error', 'Failed to save workout set', context);

      expect(mockAmplitude.track).toHaveBeenCalledWith('Error Occurred', {
        error_type: 'api_error',
        error_message: 'Failed to save workout set',
        error_context: context,
        timestamp: expect.any(String),
      });
    });
  });

  describe('Social Events', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should track post created', () => {
      analyticsService.trackPostCreated('workout');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Post Created', {
        post_type: 'workout',
        timestamp: expect.any(String),
      });
    });

    it('should track post reaction', () => {
      analyticsService.trackPostReaction('like');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Post Reaction', {
        reaction_type: 'like',
        timestamp: expect.any(String),
      });
    });

    it('should track club joined', () => {
      analyticsService.trackClubJoined('club123');

      expect(mockAmplitude.track).toHaveBeenCalledWith('Club Joined', {
        club_id: 'club123',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should flush events', () => {
      analyticsService.flush();

      expect(mockAmplitude.flush).toHaveBeenCalled();
    });

    it('should reset user identity', () => {
      analyticsService.reset();

      expect(mockAmplitude.reset).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      analyticsService.init();
    });

    it('should handle tracking errors gracefully', () => {
      mockAmplitude.track.mockImplementation(() => {
        throw new Error('Amplitude error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      analyticsService.trackUserLogin('email');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to track event:',
        'User Logged In',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Uninitialized State', () => {
    it('should warn when tracking without initialization', () => {
      const service = new AnalyticsService();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      service.trackUserLogin('email');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Analytics not initialized. Would track: User Logged In',
        expect.any(Object)
      );
      expect(mockAmplitude.track).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should not execute methods when not initialized', () => {
      const service = new AnalyticsService();

      service.setUserId('user123');
      service.flush();
      service.reset();

      expect(mockAmplitude.setUserId).not.toHaveBeenCalled();
      expect(mockAmplitude.flush).not.toHaveBeenCalled();
      expect(mockAmplitude.reset).not.toHaveBeenCalled();
    });
  });
});