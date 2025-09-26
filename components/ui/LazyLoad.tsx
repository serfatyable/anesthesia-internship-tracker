'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  once?: boolean;
}

export function LazyLoad({
  children,
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  threshold = 0.1,
  rootMargin = '50px',
  className,
  once = true,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (once) {
            setHasLoaded(true);
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once]);

  const shouldShow = once ? hasLoaded : isVisible;

  return (
    <div ref={elementRef} className={cn('w-full', className)}>
      {shouldShow ? children : fallback}
    </div>
  );
}

/**
 * Lazy load images with placeholder
 */
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  onLoad,
  onError,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    onError?.();
  };

  return (
    <LazyLoad fallback={<div className={cn('animate-pulse bg-gray-200 rounded', className)} />}>
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className,
        )}
        onLoad={() => {
          setImageSrc(src);
          handleLoad();
        }}
        onError={handleError}
      />
    </LazyLoad>
  );
}

/**
 * Code splitting wrapper
 */
interface CodeSplitProps {
  load: () => Promise<{ default: React.ComponentType<unknown> }>;
  fallback?: ReactNode;
  props?: Record<string, unknown>;
}

export function CodeSplit({ load, fallback, props }: CodeSplitProps) {
  const [Component, setComponent] = useState<React.ComponentType<unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    load()
      .then((module) => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [load]);

  if (loading) {
    return <>{fallback || <div className="animate-pulse bg-gray-200 h-32 rounded" />}</>;
  }

  if (error) {
    return <div className="text-red-500">Failed to load component: {error.message}</div>;
  }

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
}
