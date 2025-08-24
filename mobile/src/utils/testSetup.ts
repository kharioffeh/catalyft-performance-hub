/**
 * Test Setup Script for Social Features
 * Initializes test environment with mock data and configurations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockDataGenerators, privacyTestScenarios } from './socialTestUtils';
import { supabase } from '../services/supabase';

export class TestSetup {
  private static instance: TestSetup;
  private testUsers: any[] = [];
  private testPosts: any[] = [];
  private testChallenges: any[] = [];

  static getInstance(): TestSetup {
    if (!TestSetup.instance) {
      TestSetup.instance = new TestSetup();
    }
    return TestSetup.instance;
  }

  /**
   * Phase 1: Initialize test environment
   */
  async initializeTestEnvironment(): Promise<void> {
    console.log('🚀 Phase 1: Initializing test environment...');
    
    try {
      // Clear existing test data
      await this.clearTestData();
      
      // Create test users with different privacy settings
      await this.createTestUsers();
      
      // Seed mock data
      await this.seedMockData();
      
      // Set up test configurations
      await this.setupTestConfigurations();
      
      console.log('✅ Phase 1 Complete: Test environment initialized');
    } catch (error) {
      console.error('❌ Phase 1 Failed:', error);
      throw error;
    }
  }

  /**
   * Create test users with different privacy configurations
   */
  private async createTestUsers(): Promise<void> {
    console.log('Creating test users...');
    
    const testUserConfigs = [
      {
        username: 'public_user',
        fullName: 'Public Test User',
        privacySettings: privacyTestScenarios.publicProfile(),
      },
      {
        username: 'private_user',
        fullName: 'Private Test User',
        privacySettings: privacyTestScenarios.privateProfile(),
      },
      {
        username: 'followers_user',
        fullName: 'Followers Only User',
        privacySettings: privacyTestScenarios.followersOnlyProfile(),
      },
    ];

    for (const config of testUserConfigs) {
      const user = mockDataGenerators.createMockUserProfile({
        username: config.username,
        fullName: config.fullName,
        privacySettings: config.privacySettings,
      });
      
      this.testUsers.push(user);
      
      // Store in AsyncStorage for testing
      await AsyncStorage.setItem(
        `@test_user_${config.username}`,
        JSON.stringify(user)
      );
    }
    
    console.log(`✓ Created ${this.testUsers.length} test users`);
  }

  /**
   * Seed mock data for testing
   */
  private async seedMockData(): Promise<void> {
    console.log('Seeding mock data...');
    
    // Generate activity posts
    this.testPosts = mockDataGenerators.createMockActivityPosts(50);
    await AsyncStorage.setItem('@test_posts', JSON.stringify(this.testPosts));
    console.log(`✓ Generated ${this.testPosts.length} test posts`);
    
    // Generate challenges
    this.testChallenges = mockDataGenerators.createMockChallenges(10);
    await AsyncStorage.setItem('@test_challenges', JSON.stringify(this.testChallenges));
    console.log(`✓ Generated ${this.testChallenges.length} test challenges`);
    
    // Generate achievements
    const testAchievements = mockDataGenerators.createMockAchievements(15);
    await AsyncStorage.setItem('@test_achievements', JSON.stringify(testAchievements));
    console.log(`✓ Generated ${testAchievements.length} test achievements`);
  }

  /**
   * Set up test configurations
   */
  private async setupTestConfigurations(): Promise<void> {
    console.log('Setting up test configurations...');
    
    const testConfig = {
      enableMockData: true,
      enablePerformanceLogging: true,
      enableErrorSimulation: false,
      testMode: true,
      mockApiDelay: 500, // Simulate network delay
    };
    
    await AsyncStorage.setItem('@test_config', JSON.stringify(testConfig));
    console.log('✓ Test configurations set');
  }

  /**
   * Clear all test data
   */
  private async clearTestData(): Promise<void> {
    console.log('Clearing existing test data...');
    
    const testKeys = await AsyncStorage.getAllKeys();
    const testDataKeys = testKeys.filter(key => key.startsWith('@test_'));
    
    if (testDataKeys.length > 0) {
      await AsyncStorage.multiRemove(testDataKeys);
      console.log(`✓ Cleared ${testDataKeys.length} test data items`);
    }
  }

  /**
   * Get test data for verification
   */
  getTestData(): {
    users: any[];
    posts: any[];
    challenges: any[];
  } {
    return {
      users: this.testUsers,
      posts: this.testPosts,
      challenges: this.testChallenges,
    };
  }
}

// Export singleton instance
export const testSetup = TestSetup.getInstance();