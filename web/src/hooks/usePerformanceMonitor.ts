'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  lastUpdate: number;
  renderCount: number;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = ({
  componentName,
  enabled = process.env.NODE_ENV === 'development',
  onMetricsUpdate
}: UsePerformanceMonitorOptions) => {
  const metricsRef = useRef<PerformanceMetrics>({
    componentName,
    renderTime: 0,
    mountTime: 0,
    lastUpdate: Date.now(),
    renderCount: 0
  });
  
  const renderStartRef = useRef<number>(0);
  const mountStartRef = useRef<number>(Date.now());

  // Start render timing
  useEffect(() => {
    if (!enabled) return;
    renderStartRef.current = performance.now();
  });

  // End render timing and update metrics
  useEffect(() => {
    if (!enabled) return;
    
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStartRef.current;
    
    metricsRef.current = {
      ...metricsRef.current,
      renderTime,
      lastUpdate: Date.now(),
      renderCount: metricsRef.current.renderCount + 1
    };

    onMetricsUpdate?.(metricsRef.current);
  });

  // Track mount time
  useEffect(() => {
    if (!enabled) return;
    
    const mountTime = performance.now() - mountStartRef.current;
    metricsRef.current.mountTime = mountTime;
  }, [enabled]);

  const logMetrics = useCallback(() => {
    if (!enabled) return;
    
    console.group(`🔍 Performance Metrics: ${componentName}`);
    console.log('Mount Time:', `${metricsRef.current.mountTime.toFixed(2)}ms`);
    console.log('Last Render Time:', `${metricsRef.current.renderTime.toFixed(2)}ms`);
    console.log('Total Renders:', metricsRef.current.renderCount);
    console.log('Last Update:', new Date(metricsRef.current.lastUpdate).toLocaleTimeString());
    console.groupEnd();
  }, [componentName, enabled]);

  const getMetrics = useCallback(() => metricsRef.current, []);

  return {
    logMetrics,
    getMetrics,
    metrics: metricsRef.current
  };
};

// Memory usage monitoring
export const useMemoryMonitor = (componentName: string, enabled = process.env.NODE_ENV === 'development') => {
  const logMemoryUsage = useCallback(() => {
    if (!enabled || !(performance as any).memory) return;
    
    const memory = (performance as any).memory;
    console.group(`💾 Memory Usage: ${componentName}`);
    console.log('Used JS Heap Size:', `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
    console.log('Total JS Heap Size:', `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`);
    console.log('JS Heap Size Limit:', `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
    console.groupEnd();
  }, [componentName, enabled]);

  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(logMemoryUsage, 10000); // Log every 10 seconds
    return () => clearInterval(interval);
  }, [logMemoryUsage, enabled]);

  return { logMemoryUsage };
};

// Network monitoring for API calls
export const useNetworkMonitor = () => {
  const trackAPICall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`🌐 API Call: ${endpoint} - ${duration.toFixed(2)}ms - Success`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`🌐 API Call: ${endpoint} - ${duration.toFixed(2)}ms - Failed`, error);
      throw error;
    }
  }, []);

  return { trackAPICall };
};

// Overall performance summary
export const usePerformanceSummary = () => {
  const generateReport = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.group('📊 Performance Summary');
    
    // Navigation timing
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('Page Load Time:', `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`);
        console.log('DOM Content Loaded:', `${(navigation.domContentLoadedEventEnd - navigation.fetchStart).toFixed(2)}ms`);
        console.log('First Paint:', `${(navigation.responseStart - navigation.fetchStart).toFixed(2)}ms`);
      }
    }
    
    // Core Web Vitals (if available)
    if ('web-vitals' in window) {
      console.log('Core Web Vitals data available (use web-vitals library for detailed metrics)');
    }
    
    console.groupEnd();
  }, []);

  return { generateReport };
};
