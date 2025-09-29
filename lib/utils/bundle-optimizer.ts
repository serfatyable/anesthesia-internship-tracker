/**
 * Bundle optimization utilities and code splitting helpers
 */

import React from 'react';

// Dynamic imports for code splitting
export const lazyLoadComponent = <T extends React.ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

// Route-based code splitting
export const createLazyRoute = (
  importFunc: () => Promise<{ default: React.ComponentType<unknown> }>
) => {
  return lazyLoadComponent(importFunc);
};

// Component-based code splitting
// export const LazyDashboard = lazyLoadComponent(() => import('@/components/site/dashboard/InternDashboard'));
// export const LazyCaseReview = lazyLoadComponent(() => import('@/components/site/case-review/CasesList'));
// export const LazyVerificationQueue = lazyLoadComponent(() => import('@/components/site/dashboard/PendingVerifications'));

// Heavy component lazy loading
// export const LazyChart = lazyLoadComponent(() => import('@/components/ui/Chart'));
// export const LazyDataTable = lazyLoadComponent(() => import('@/components/ui/DataTable'));

// Utility for conditional loading
export const ConditionalLoader = ({
  condition,
  children,
  fallback,
}: {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  if (!condition) {
    return fallback || null;
  }

  return React.createElement(React.Fragment, null, children);
};

// Preloading utilities
export const preloadComponent = (importFunc: () => Promise<unknown>) => {
  if (typeof window !== 'undefined') {
    // Preload on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFunc());
    } else {
      setTimeout(() => importFunc(), 0);
    }
  }
};

export const preloadRoute = (route: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }
};

// Bundle analysis utilities
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (!navigation) return null;
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    const jsResources = resources.filter((r: PerformanceResourceTiming) =>
      r.name.endsWith('.js')
    );
    const cssResources = resources.filter((r: PerformanceResourceTiming) =>
      r.name.endsWith('.css')
    );

    const totalJSSize = jsResources.reduce(
      (sum, r) => sum + (r.transferSize || 0),
      0
    );
    const totalCSSSize = cssResources.reduce(
      (sum, r) => sum + (r.transferSize || 0),
      0
    );

    return {
      totalSize: totalJSSize + totalCSSSize,
      jsSize: totalJSSize,
      cssSize: totalCSSSize,
      jsCount: jsResources.length,
      cssCount: cssResources.length,
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    };
  }

  return null;
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (
      performance as {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }
    ).memory;
    if (!memory) return null;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};

// Image optimization utilities
export const optimizeImage = (src: string) => {
  // In a real application, you would use a service like Cloudinary or ImageKit
  // For now, we'll return the original src
  return src;
};

// Lazy loading hook
export const useLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Virtual scrolling utilities
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
};

// Debounced search hook
export const useDebouncedSearch = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized component wrapper
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, areEqual);
};

// Performance-optimized list component
export const OptimizedList = <T extends { id: string }>({
  items,
  renderItem,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}) => {
  const { visibleItems, totalHeight, offsetY, setScrollTop } =
    useVirtualScrolling(items, itemHeight, containerHeight, overscan);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return React.createElement(
    'div',
    {
      style: { height: containerHeight, overflow: 'auto' },
      onScroll: handleScroll,
    },
    React.createElement(
      'div',
      {
        style: { height: totalHeight, position: 'relative' },
      },
      React.createElement(
        'div',
        {
          style: { transform: `translateY(${offsetY}px)` },
        },
        visibleItems.map((item, index) =>
          React.createElement(
            'div',
            {
              key: item.id,
              style: { height: itemHeight },
            },
            renderItem(item, index)
          )
        )
      )
    )
  );
};

// Bundle splitting configuration
export const bundleConfig = {
  // Split vendor libraries
  vendor: ['react', 'react-dom', 'next'],

  // Split UI components
  ui: ['@/components/ui'],

  // Split dashboard components
  dashboard: ['@/components/site/dashboard'],

  // Split case review components
  caseReview: ['@/components/site/case-review'],
};

// Webpack bundle analyzer configuration
export const webpackConfig = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};

// Export everything
// const _bundleOptimizer = {
//   lazyLoadComponent,
//   createLazyRoute,
//   preloadComponent,
//   preloadRoute,
//   analyzeBundleSize,
//   monitorMemoryUsage,
//   optimizeImage,
//   useLazyLoading,
//   useVirtualScrolling,
//   useDebouncedSearch,
//   withMemo,
//   OptimizedList,
//   bundleConfig,
//   webpackConfig,
// };
