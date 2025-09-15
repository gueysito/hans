// Performance monitoring and optimization utilities for Hans Oracle

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordPageLoad(entry as PerformanceNavigationTiming);
          }
        });
      });
      
      navObserver.observe({ type: 'navigation', buffered: true });
      this.observers.push(navObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('🎯 LCP:', entry.startTime, 'ms');
        });
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('⚡ FID:', entry.processingStart - entry.startTime, 'ms');
        });
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);
    }
  }

  private recordPageLoad(entry: PerformanceNavigationTiming) {
    const metrics: PerformanceMetrics = {
      pageLoadTime: entry.loadEventEnd - entry.fetchStart,
      apiResponseTime: 0, // Will be updated by API calls
      renderTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      memoryUsage: this.getMemoryUsage()
    };
    
    this.metrics.push(metrics);
    console.log('📊 Performance Metrics:', metrics);
  }

  private getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  // Track API response times
  trackApiCall<T>(promise: Promise<T>, endpoint: string): Promise<T> {
    const startTime = performance.now();
    
    return promise
      .then((result) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        console.log(`🚀 API ${endpoint}: ${responseTime.toFixed(2)}ms`);
        
        // Update latest metrics
        if (this.metrics.length > 0) {
          this.metrics[this.metrics.length - 1].apiResponseTime = responseTime;
        }
        
        return result;
      })
      .catch((error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        console.error(`❌ API ${endpoint} failed after ${responseTime.toFixed(2)}ms:`, error);
        throw error;
      });
  }

  // Get performance report
  getPerformanceReport() {
    if (this.metrics.length === 0) return null;

    const latest = this.metrics[this.metrics.length - 1];
    const average = this.metrics.reduce((acc, metric) => ({
      pageLoadTime: acc.pageLoadTime + metric.pageLoadTime,
      apiResponseTime: acc.apiResponseTime + metric.apiResponseTime,
      renderTime: acc.renderTime + metric.renderTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
    }), { pageLoadTime: 0, apiResponseTime: 0, renderTime: 0, memoryUsage: 0 });

    Object.keys(average).forEach(key => {
      (average as any)[key] = (average as any)[key] / this.metrics.length;
    });

    return {
      latest,
      average,
      samples: this.metrics.length,
      recommendations: this.generateRecommendations(latest)
    };
  }

  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.pageLoadTime > 3000) {
      recommendations.push('Consider implementing lazy loading for components');
    }
    
    if (metrics.apiResponseTime > 1000) {
      recommendations.push('API responses are slow - consider caching or optimization');
    }
    
    if (metrics.memoryUsage > 50) {
      recommendations.push('High memory usage detected - check for memory leaks');
    }
    
    if (metrics.renderTime > 100) {
      recommendations.push('DOM rendering is slow - optimize component structure');
    }

    return recommendations;
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    trackApiCall: monitor.trackApiCall.bind(monitor),
    getReport: monitor.getPerformanceReport.bind(monitor),
  };
}

// Utility for measuring component render time
export function withPerformanceTracking<P extends {}>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        console.log(`🎨 ${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`);
      };
    });

    return React.createElement(Component, props);
  };
}

// Cache management utilities
export class CacheManager {
  private static readonly CACHE_PREFIX = 'hans_oracle_';
  private static readonly MAX_CACHE_SIZE = 50; // Maximum number of cached items
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static set(key: string, data: any, ttl: number = CacheManager.DEFAULT_TTL) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      localStorage.setItem(
        CacheManager.CACHE_PREFIX + key,
        JSON.stringify(cacheItem)
      );
      
      // Clean up old cache entries
      CacheManager.cleanup();
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(CacheManager.CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      const now = Date.now();

      // Check if expired
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        localStorage.removeItem(CacheManager.CACHE_PREFIX + key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  }

  static has(key: string): boolean {
    return CacheManager.get(key) !== null;
  }

  static remove(key: string) {
    localStorage.removeItem(CacheManager.CACHE_PREFIX + key);
  }

  static clear() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(CacheManager.CACHE_PREFIX)
    );
    
    keys.forEach(key => localStorage.removeItem(key));
  }

  private static cleanup() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(CacheManager.CACHE_PREFIX)
    );

    if (keys.length <= CacheManager.MAX_CACHE_SIZE) return;

    // Sort by timestamp and remove oldest entries
    const cacheItems = keys.map(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        return { key, timestamp: item.timestamp || 0 };
      } catch {
        return { key, timestamp: 0 };
      }
    });

    cacheItems
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, keys.length - CacheManager.MAX_CACHE_SIZE)
      .forEach(({ key }) => localStorage.removeItem(key));
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React import for TypeScript
import React from 'react';