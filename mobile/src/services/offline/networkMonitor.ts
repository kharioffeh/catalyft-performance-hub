import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'unknown' | 'none';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: ConnectionType;
  quality: ConnectionQuality;
  effectiveType?: '2g' | '3g' | '4g' | '5g' | 'unknown';
  details?: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: string;
    carrier?: string;
    ipAddress?: string;
    subnet?: string;
    frequency?: number;
    strength?: number;
    linkSpeed?: number;
  };
  lastChecked: number;
}

export interface NetworkConfig {
  checkInterval: number; // ms
  pingTimeout: number; // ms
  pingUrl: string;
  enableBackgroundCheck: boolean;
  wifiOnlySync: boolean;
  minQualityForSync: ConnectionQuality;
}

export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private netInfo = NetInfo;
  private eventListeners: Map<string, Set<(status: NetworkStatus) => void>> = new Map();
  private currentStatus: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    details: undefined,
    quality: 'good',
    effectiveType: '4g',
    lastChecked: Date.now()
  };
  private config: NetworkConfig;
  private checkInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Base delay in ms
  private speedTestResults: number[] = [];
  private subscription: NetInfoSubscription | null = null;

  constructor(config?: Partial<NetworkConfig>) {
    this.config = {
      checkInterval: 30000, // 30 seconds
      pingTimeout: 5000, // 5 seconds
      pingUrl: 'https://api.supabase.co/health', // Or your backend health endpoint
      enableBackgroundCheck: true,
      wifiOnlySync: false,
      minQualityForSync: 'fair',
      ...config
    };

    this.currentStatus = {
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
      quality: 'offline',
      lastChecked: Date.now()
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Configure NetInfo
    await NetInfo.configure({
      reachabilityUrl: this.config.pingUrl,
      reachabilityTest: async (response) => response.status === 200,
      reachabilityLongTimeout: this.config.pingTimeout,
      reachabilityShortTimeout: this.config.pingTimeout / 2,
      reachabilityRequestTimeout: this.config.pingTimeout,
      reachabilityShouldRun: () => true,
      shouldFetchWiFiSSID: true
    });

    // Get initial state
    const state = await NetInfo.fetch();
    this.updateStatus(state);

    // Subscribe to network changes
    this.startMonitoring();

    // Start periodic checks if enabled
    if (this.config.enableBackgroundCheck) {
      this.startPeriodicCheck();
    }
  }

  private startMonitoring(): void {
    this.subscription = NetInfo.addEventListener(state => {
      this.handleNetworkChange(state);
    });
  }

  private async handleNetworkChange(state: NetInfoState): Promise<void> {
    const previousStatus = { ...this.currentStatus };
    this.updateStatus(state);

    // Emit events based on changes
    if (!previousStatus.isConnected && this.currentStatus.isConnected) {
      this.emit('connected', this.currentStatus);
      this.handleReconnection();
    } else if (previousStatus.isConnected && !this.currentStatus.isConnected) {
      this.emit('disconnected', this.currentStatus);
      this.handleDisconnection();
    }

    if (previousStatus.quality !== this.currentStatus.quality) {
      this.emit('qualityChanged', this.currentStatus);
    }

    // Notify all listeners
    this.notifyListeners('status', this.currentStatus);
  }

  private updateStatus(state: NetInfoState): void {
    this.currentStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: this.mapConnectionType(state.type),
      quality: this.calculateQuality(state),
      effectiveType: this.getEffectiveType(state),
      details: this.extractDetails(state),
      lastChecked: Date.now()
    };
  }

  private mapConnectionType(type: string): ConnectionType {
    switch (type) {
      case 'wifi': return 'wifi';
      case 'cellular': return 'cellular';
      case 'ethernet': return 'ethernet';
      case 'bluetooth': return 'bluetooth';
      case 'none': return 'none';
      default: return 'unknown';
    }
  }

  private calculateQuality(state: NetInfoState): ConnectionQuality {
    if (!state.isConnected || !state.isInternetReachable) {
      return 'offline';
    }

    // Calculate based on connection type and details
    if (state.type === 'wifi') {
      const details = state.details as any;
      if (details?.strength) {
        if (details.strength > -50) return 'excellent';
        if (details.strength > -60) return 'good';
        if (details.strength > -70) return 'fair';
        return 'poor';
      }
      return 'good'; // Default for WiFi
    }

    if (state.type === 'cellular') {
      const details = state.details as any;
      const generation = details?.cellularGeneration;
      
      if (generation === '5g') return 'excellent';
      if (generation === '4g') return 'good';
      if (generation === '3g') return 'fair';
      return 'poor';
    }

    if (state.type === 'ethernet') {
      return 'excellent';
    }

    return 'fair';
  }

  private getEffectiveType(state: NetInfoState): '2g' | '3g' | '4g' | '5g' | 'unknown' {
    if (state.type === 'cellular') {
      const details = state.details as any;
      const generation = details?.cellularGeneration;
      
      switch (generation) {
        case '2g': return '2g';
        case '3g': return '3g';
        case '4g': return '4g';
        case '5g': return '5g';
        default: return 'unknown';
      }
    }
    
    if (state.type === 'wifi') return '4g'; // Assume WiFi is like 4G
    if (state.type === 'ethernet') return '5g'; // Assume ethernet is like 5G
    
    return 'unknown';
  }

  private extractDetails(state: NetInfoState): NetworkStatus['details'] {
    const details = state.details as any;
    
    return {
      isConnectionExpensive: details?.isConnectionExpensive,
      cellularGeneration: details?.cellularGeneration,
      carrier: details?.carrier,
      ipAddress: details?.ipAddress,
      subnet: details?.subnet,
      frequency: details?.frequency,
      strength: details?.strength,
      linkSpeed: details?.linkSpeed
    };
  }

  // Reconnection handling with exponential backoff
  private async handleReconnection(): Promise<void> {
    console.log('Network reconnected, initiating sync...');
    this.reconnectAttempts = 0;
    
    // Test connection quality
    await this.testConnectionSpeed();
    
    // Emit sync event if quality is sufficient
    if (this.canSync()) {
      this.emit('syncReady', this.currentStatus);
    }
  }

  private handleDisconnection(): void {
    console.log('Network disconnected');
    this.reconnectAttempts = 0;
  }

  // Periodic network check
  private startPeriodicCheck(): void {
    this.checkInterval = setInterval(async () => {
      await this.checkConnection();
    }, this.config.checkInterval);
  }

  private stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Manual connection check
  async checkConnection(): Promise<NetworkStatus> {
    try {
      const state = await NetInfo.fetch();
      this.updateStatus(state);
      
      // Perform additional reachability test
      if (state.isConnected) {
        const isReachable = await this.testReachability();
        this.currentStatus.isInternetReachable = isReachable;
      }
      
      return this.currentStatus;
    } catch (error) {
      console.error('Error checking connection:', error);
      return this.currentStatus;
    }
  }

  // Test actual internet reachability
  private async testReachability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.pingTimeout);
      
      const response = await fetch(this.config.pingUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Test connection speed
  async testConnectionSpeed(): Promise<number> {
    if (!this.currentStatus.isConnected) return 0;

    try {
      const testSize = 100000; // 100KB test
      const testData = new ArrayBuffer(testSize);
      const startTime = Date.now();
      
      // Simulate upload test (in real app, use actual endpoint)
      const response = await fetch(this.config.pingUrl, {
        method: 'POST',
        body: testData,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // seconds
      const speedMbps = (testSize * 8) / (duration * 1000000); // Mbps
      
      this.speedTestResults.push(speedMbps);
      if (this.speedTestResults.length > 10) {
        this.speedTestResults.shift();
      }
      
      return speedMbps;
    } catch (error) {
      console.error('Speed test failed:', error);
      return 0;
    }
  }

  // Get average connection speed
  getAverageSpeed(): number {
    if (this.speedTestResults.length === 0) return 0;
    
    const sum = this.speedTestResults.reduce((a, b) => a + b, 0);
    return sum / this.speedTestResults.length;
  }

  // Check if sync should proceed
  canSync(): boolean {
    if (!this.currentStatus.isConnected || !this.currentStatus.isInternetReachable) {
      return false;
    }

    // Check WiFi-only setting
    if (this.config.wifiOnlySync && this.currentStatus.type !== 'wifi') {
      return false;
    }

    // Check minimum quality requirement
    const qualityLevels: ConnectionQuality[] = ['offline', 'poor', 'fair', 'good', 'excellent'];
    const currentLevel = qualityLevels.indexOf(this.currentStatus.quality);
    const minLevel = qualityLevels.indexOf(this.config.minQualityForSync);
    
    return currentLevel >= minLevel;
  }

  // Check if connection is expensive (cellular data)
  isConnectionExpensive(): boolean {
    return this.currentStatus.details?.isConnectionExpensive ?? 
           this.currentStatus.type === 'cellular';
  }

  // Getters
  getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  isOnline(): boolean {
    return this.currentStatus.isConnected && this.currentStatus.isInternetReachable;
  }

  isOffline(): boolean {
    return !this.isOnline();
  }

  getConnectionType(): ConnectionType {
    return this.currentStatus.type;
  }

  getConnectionQuality(): ConnectionQuality {
    return this.currentStatus.quality;
  }

  // Event handling
  on(event: 'connected' | 'disconnected' | 'qualityChanged' | 'syncReady' | 'status',
     listener: (status: NetworkStatus) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(listener);
  }

  off(event: string, listener: (status: NetworkStatus) => void): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(event: string, status: NetworkStatus): void {
    this.eventListeners.get(event)?.forEach(listener => listener(status));
  }

  private notifyListeners(event: string, status: NetworkStatus): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(listener => listener(status));
    }
  }

  // Update configuration
  updateConfig(config: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart periodic check if interval changed
    if (config.checkInterval !== undefined) {
      this.stopPeriodicCheck();
      if (this.config.enableBackgroundCheck) {
        this.startPeriodicCheck();
      }
    }
  }

  // Cleanup
  destroy(): void {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
    
    this.stopPeriodicCheck();
    this.eventListeners.clear();
  }

  // Force refresh network status
  async refresh(): Promise<NetworkStatus> {
    return this.checkConnection();
  }

  // Retry with exponential backoff
  async retryConnection(): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return false;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const status = await this.checkConnection();
    if (status.isConnected && status.isInternetReachable) {
      this.reconnectAttempts = 0;
      return true;
    }
    
    return this.retryConnection();
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor();