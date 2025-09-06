import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Debounced value hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Throttled callback hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [callback, delay]
  );
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll
  };
}

// Memoized component factory
export function createMemoComponent<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return React.memo(Component, areEqual);
}

// Custom hook for expensive calculations
export function useExpensiveCalculation<T, R>(
  data: T,
  calculator: (data: T) => R,
  dependencies: React.DependencyList = []
): R {
  return useMemo(() => calculator(data), [data, ...dependencies]);
}

// Image lazy loading hook
export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const { hasIntersected } = useIntersectionObserver(imageRef);

  useEffect(() => {
    if (hasIntersected && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setIsError(true);
      };
      img.src = src;
    }
  }, [hasIntersected, src]);

  return {
    ref: imageRef,
    src: imageSrc,
    isLoaded,
    isError
  };
}

// Local storage with caching
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// Optimized search hook
export function useOptimizedSearch<T>(
  items: T[],
  searchTerm: string,
  searchKeys: (keyof T)[],
  debounceMs: number = 300
) {
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm) return items;

    return items.filter(item =>
      searchKeys.some(key => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        }
        if (typeof value === 'number') {
          return value.toString().includes(debouncedSearchTerm);
        }
        return false;
      })
    );
  }, [items, debouncedSearchTerm, searchKeys]);

  return {
    filteredItems,
    isSearching: searchTerm !== debouncedSearchTerm
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>();

  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
      }
    };
  }, [name]);
}

// Bundle size optimization utilities
export const lazyComponents = {
  // Example lazy-loaded components
  AdminDashboard: React.lazy(() => import('@/app/dashboard/page')),
  InstructorDashboard: React.lazy(() => import('@/app/instructor-dashboard/page')),
  StudentDashboard: React.lazy(() => import('@/app/student-dashboard/page'))
};

// Error boundary for lazy components
export class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Failed to load component</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
