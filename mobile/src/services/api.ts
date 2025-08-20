/**
 * Base API client with interceptors and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { MMKV } from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

// Initialize MMKV for token storage
const storage = new MMKV({
  id: 'api-storage',
  encryptionKey: 'catalyft-api-encryption-key', // In production, use a secure key
});

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.catalyft.com';
const API_TIMEOUT = 30000; // 30 seconds

// Token management
export class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static TOKEN_EXPIRY_KEY = 'token_expiry';

  static getAccessToken(): string | null {
    return storage.getString(this.ACCESS_TOKEN_KEY) || null;
  }

  static getRefreshToken(): string | null {
    return storage.getString(this.REFRESH_TOKEN_KEY) || null;
  }

  static setTokens(accessToken: string, refreshToken?: string, expiresIn?: number) {
    storage.set(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      storage.set(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000;
      storage.set(this.TOKEN_EXPIRY_KEY, expiryTime);
    }
  }

  static clearTokens() {
    storage.delete(this.ACCESS_TOKEN_KEY);
    storage.delete(this.REFRESH_TOKEN_KEY);
    storage.delete(this.TOKEN_EXPIRY_KEY);
  }

  static isTokenExpired(): boolean {
    const expiry = storage.getNumber(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() >= expiry;
  }
}

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request/Response interceptor types
export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  offlineQueue?: boolean;
}

export interface ApiResponse<T = any> {
  config: AxiosRequestConfig;
}

// Offline queue for syncing
export class OfflineQueue {
  private static QUEUE_KEY = 'offline_queue';

  static async addToQueue(request: ApiRequestConfig) {
    const queue = this.getQueue();
    queue.push({
      id: Date.now().toString(),
      request,
      timestamp: Date.now(),
      retryCount: 0,
    });
    storage.set(this.QUEUE_KEY, JSON.stringify(queue));
  }

  static getQueue(): any[] {
    const queueStr = storage.getString(this.QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  }

  static clearQueue() {
    storage.delete(this.QUEUE_KEY);
  }

  static removeFromQueue(id: string) {
    const queue = this.getQueue();
    const filtered = queue.filter(item => item.id !== id);
    storage.set(this.QUEUE_KEY, JSON.stringify(filtered));
  }
}

// Create API client instance
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': Platform.OS,
        'X-Platform-Version': Platform.Version,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: any) => {
        // Check network connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected && config.offlineQueue !== false) {
          // Add to offline queue if enabled
          await OfflineQueue.addToQueue(config);
          throw new ApiError(0, 'No internet connection', null, true);
        }

        // Add auth token if not skipped
        if (!config.skipAuth) {
          const token = TokenManager.getAccessToken();
          if (token) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            };
          }
        }

        // Add request timestamp for tracking
        config.headers = {
          ...config.headers,
          'X-Request-Time': Date.now().toString(),
        };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: any) => {
        // Track response time
        const requestTime = parseInt(response.config.headers?.['X-Request-Time'] as string || '0');
        if (requestTime) {
          const responseTime = Date.now() - requestTime;
          console.log(`API Response Time: ${responseTime}ms for ${response.config.url}`);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as ApiRequestConfig;

        // Handle network errors
        if (!error.response) {
          if (originalRequest?.offlineQueue !== false) {
            await OfflineQueue.addToQueue(originalRequest);
          }
          return Promise.reject(new ApiError(0, 'Network error', null, true));
        }

        // Handle 401 Unauthorized - Token refresh
        if (error.response.status === 401 && !originalRequest.skipAuth) {
          if (!originalRequest.retry) {
            originalRequest.retry = true;

            if (!this.isRefreshing) {
              this.isRefreshing = true;
              
              try {
                const newToken = await this.refreshAccessToken();
                this.isRefreshing = false;
                this.onRefreshed(newToken);
                this.refreshSubscribers = [];
                
                // Retry original request with new token
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${newToken}`,
                };
                return this.client(originalRequest);
              } catch (refreshError) {
                this.isRefreshing = false;
                this.refreshSubscribers = [];
                TokenManager.clearTokens();
                // Redirect to login
                return Promise.reject(new ApiError(401, 'Session expired', null));
              }
            }

            // Wait for token refresh
            return new Promise((resolve) => {
              this.subscribeTokenRefresh((token: string) => {
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${token}`,
                };
                resolve(this.client(originalRequest));
              });
            });
          }
        }

        // Handle rate limiting
        if (error.response.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
          
          if (originalRequest.maxRetries && originalRequest.maxRetries > 0) {
            originalRequest.maxRetries--;
            await this.delay(delay);
            return this.client(originalRequest);
          }
        }

        // Handle other errors
        const apiError = new ApiError(
          error.response.status,
          (error.response.data as any)?.message || error.message,
          error.response.data
        );

        return Promise.reject(apiError);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', {
      refreshToken,
    }, {
      skipAuth: true,
    } as ApiRequestConfig);

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
    TokenManager.setTokens(accessToken, newRefreshToken, expiresIn);
    
    return accessToken;
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  async get<T = any>(url: string, config?: ApiRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: ApiRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload
  async uploadFile(url: string, file: any, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const config: ApiRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    return this.post(url, formData, config);
  }

  // Batch requests
  async batch(requests: Array<{ method: string; url: string; data?: any }>): Promise<any[]> {
    const batchData = requests.map(req => ({
      method: req.method,
      url: req.url,
      body: req.data,
    }));

    return this.post('/batch', { requests: batchData });
  }

  // Process offline queue
  async processOfflineQueue() {
    const queue = OfflineQueue.getQueue();
    const results = [];

    for (const item of queue) {
      try {
        const response = await this.client(item.request);
        results.push({ success: true, id: item.id, response });
        OfflineQueue.removeFromQueue(item.id);
      } catch (error) {
        results.push({ success: false, id: item.id, error });
        // Increment retry count or remove if max retries reached
        if (item.retryCount >= 3) {
          OfflineQueue.removeFromQueue(item.id);
        }
      }
    }

    return results;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export commonly used API functions
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  uploadFile: apiClient.uploadFile.bind(apiClient),
  batch: apiClient.batch.bind(apiClient),
  processOfflineQueue: apiClient.processOfflineQueue.bind(apiClient),
};

// Network state listener
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    // Process offline queue when connection is restored
    apiClient.processOfflineQueue().catch(console.error);
  }
});