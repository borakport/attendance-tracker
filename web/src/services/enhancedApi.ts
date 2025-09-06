import { API_CONFIG, APP_CONFIG } from '@/constants';

// Enhanced configuration
const ENHANCED_API_CONFIG = {
  BASE_URL: API_CONFIG.BASE_URL,
  TIMEOUT: API_CONFIG.TIMEOUT,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Request interceptor type
export interface RequestInterceptor {
  onRequest?: (config: RequestInit) => RequestInit | Promise<RequestInit>;
  onResponse?: (response: Response) => Response | Promise<Response>;
  onError?: (error: Error) => Error | Promise<Error>;
}

// Response cache
const responseCache = new Map<string, { data: any; timestamp: number }>();

// Request interceptors
const requestInterceptors: RequestInterceptor[] = [];

export const addRequestInterceptor = (interceptor: RequestInterceptor) => {
  requestInterceptors.push(interceptor);
};

// Enhanced error class
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Retry logic with exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retry = async <T>(
  fn: () => Promise<T>,
  attempts: number = ENHANCED_API_CONFIG.RETRY_ATTEMPTS,
  delay: number = ENHANCED_API_CONFIG.RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    
    // Don't retry on client errors (4xx) except 408, 429
    if (error instanceof APIError && error.status) {
      const shouldRetry = error.status >= 500 || error.status === 408 || error.status === 429;
      if (!shouldRetry) throw error;
    }
    
    await sleep(delay);
    return retry(fn, attempts - 1, delay * 2); // Exponential backoff
  }
};

// Enhanced API client
class EnhancedAPIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
  }

  private getCacheKey(url: string, options: RequestInit): string {
    return `${url}:${JSON.stringify(options)}`;
  }

  private async applyInterceptors(
    config: RequestInit,
    response?: Response,
    error?: Error
  ): Promise<{ config?: RequestInit; response?: Response; error?: Error }> {
    let result = { config, response, error };

    for (const interceptor of requestInterceptors) {
      try {
        if (result.config && interceptor.onRequest) {
          result.config = await interceptor.onRequest(result.config);
        }
        if (result.response && interceptor.onResponse) {
          result.response = await interceptor.onResponse(result.response);
        }
        if (result.error && interceptor.onError) {
          result.error = await interceptor.onError(result.error);
        }
      } catch (interceptorError) {
        console.error('Interceptor error:', interceptorError);
      }
    }

    return result;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options);

    // Check cache for GET requests
    if (useCache && (options.method === 'GET' || !options.method)) {
      const cached = responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < ENHANCED_API_CONFIG.CACHE_DURATION) {
        return cached.data;
      }
    }

    let config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Apply request interceptors
    const intercepted = await this.applyInterceptors(config);
    config = intercepted.config || config;

    return retry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ENHANCED_API_CONFIG.TIMEOUT);

      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Apply response interceptors
        const responseIntercepted = await this.applyInterceptors(config, response);
        const finalResponse = responseIntercepted.response || response;

        if (!finalResponse.ok) {
          let errorMessage = `HTTP ${finalResponse.status}`;
          let errorDetails: any;

          try {
            const errorData = await finalResponse.clone().json();
            errorMessage = errorData.message || errorMessage;
            errorDetails = errorData;
          } catch {
            errorMessage = finalResponse.statusText || errorMessage;
          }

          throw new APIError(
            errorMessage,
            finalResponse.status,
            errorDetails?.code,
            errorDetails
          );
        }

        const data = await finalResponse.json();

        // Cache successful GET requests
        if (useCache && (options.method === 'GET' || !options.method)) {
          responseCache.set(cacheKey, { data, timestamp: Date.now() });
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new APIError('Request timeout', 408, 'TIMEOUT');
        }
        
        if (error instanceof APIError) {
          throw error;
        }
        
        throw new APIError(
          error instanceof Error ? error.message : 'Network error',
          0,
          'NETWORK_ERROR'
        );
      }
    });
  }

  // HTTP methods with enhanced features
  async get<T>(endpoint: string, useCache: boolean = false): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, useCache);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // File upload with progress
  async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          reject(new APIError(`Upload failed: ${xhr.statusText}`, xhr.status));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new APIError('Upload failed: Network error'));
      });

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  // Clear cache
  clearCache(pattern?: string): void {
    if (!pattern) {
      responseCache.clear();
      return;
    }

    const keys = Array.from(responseCache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        responseCache.delete(key);
      }
    }
  }

  // Batch requests
  async batch<T>(requests: Array<() => Promise<any>>): Promise<T[]> {
    const results = await Promise.allSettled(requests.map(req => req()));
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Batch request ${index} failed:`, result.reason);
        throw result.reason;
      }
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    try {
      const response = await this.get<{ status: string }>('/health', false);
      return { ...response, timestamp: Date.now() };
    } catch {
      return { status: 'error', timestamp: Date.now() };
    }
  }
}

// Create enhanced API client instance
export const enhancedApiClient = new EnhancedAPIClient(ENHANCED_API_CONFIG.BASE_URL);

// Add default interceptors
addRequestInterceptor({
  onRequest: async (config) => {
    // Add request ID for tracking
    const requestId = Math.random().toString(36).substring(2, 9);
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-Request-ID': requestId,
      },
    };
  },
  onResponse: async (response) => {
    // Log response for debugging in development
    if (process.env.NODE_ENV === 'development') {
      const requestId = response.headers.get('X-Request-ID');
      console.log(`API Response [${requestId}]:`, response.status, response.url);
    }
    return response;
  },
  onError: async (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    return error;
  },
});
