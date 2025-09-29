'use client';

import React, { memo, useCallback, useState } from 'react';
import { cn } from '@/lib/ui/cn';

interface ResourcesCardProps {
  driveUrl?: string;
  className?: string;
  // For item-specific resources
  itemId?: string;
  itemType?: 'PROCEDURE' | 'KNOWLEDGE';
  itemName?: string;
  // Display mode
  mode?: 'main' | 'item'; // 'main' for dashboard, 'item' for individual items
}

// Default Google Drive URL - can be overridden via environment variable
const DEFAULT_DRIVE_URL =
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_URL ||
  'https://drive.google.com/drive/folders/your-folder-id-here';

export const ResourcesCard = memo(function ResourcesCard({
  driveUrl = DEFAULT_DRIVE_URL,
  className,
  itemId,
  itemType,
  itemName,
  mode = 'main',
}: ResourcesCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = useCallback(() => {
    try {
      // Validate URL before opening
      if (!driveUrl || driveUrl === DEFAULT_DRIVE_URL) {
        console.warn('ResourcesCard: Google Drive URL not configured');
        return;
      }

      // Determine the target URL based on mode
      let targetUrl = driveUrl;

      if (mode === 'item' && itemId && itemType) {
        // For item-specific resources, append the item ID and type to the URL
        // This assumes the Google Drive folder structure follows: /main-folder/procedures/item-id or /main-folder/knowledge/item-id
        const itemPath = `${itemType.toLowerCase()}s/${itemId}`;
        targetUrl = `${driveUrl}/${itemPath}`;
      }

      // Open in new tab with security attributes
      const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');

      // Check if popup was blocked
      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed === 'undefined'
      ) {
        console.error('ResourcesCard: Popup blocked or failed to open');
        // Fallback: try to navigate in current window
        window.location.href = targetUrl;
      }
    } catch (error) {
      console.error('ResourcesCard: Error opening Google Drive:', error);
    }
  }, [driveUrl, mode, itemId, itemType]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Check if URL is properly configured
  const isUrlConfigured = driveUrl && driveUrl !== DEFAULT_DRIVE_URL;

  // Determine display content based on mode
  const getDisplayContent = () => {
    if (mode === 'item' && itemName) {
      return {
        title: 'Resources',
        subtitle: `Materials for ${itemName}`,
        description: isUrlConfigured
          ? `Click to access resources for ${itemName}`
          : 'Resources will be available here once configured',
      };
    }

    return {
      title: 'Resources',
      subtitle: 'Shared learning materials',
      description: isUrlConfigured
        ? 'Click to access shared resources including study materials, videos, and documents'
        : 'Resources will be available here once configured',
    };
  };

  const displayContent = getDisplayContent();

  return (
    <div
      className={cn(
        // Base styles
        'rounded-lg border border-green-200 h-full cursor-pointer transition-all duration-200 hover:shadow-lg group',
        // Background gradient
        mode === 'main'
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 p-6 hover:scale-105'
          : 'bg-gradient-to-r from-green-50 to-emerald-50 p-4 hover:scale-105',
        // Disabled state
        !isUrlConfigured && 'opacity-75 cursor-not-allowed',
        className
      )}
      onClick={isUrlConfigured ? handleCardClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role='button'
      tabIndex={isUrlConfigured ? 0 : -1}
      onKeyDown={isUrlConfigured ? handleKeyDown : undefined}
      aria-label={
        isUrlConfigured
          ? mode === 'item'
            ? `Open resources for ${itemName} in Google Drive`
            : 'Open shared resources in Google Drive'
          : 'Resources card - URL not configured'
      }
      aria-disabled={!isUrlConfigured}
    >
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors'>
            <svg
              className='w-5 h-5 text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
              />
            </svg>
          </div>
          <div>
            <h3
              className={cn(
                'font-semibold text-gray-900 group-hover:text-green-700 transition-colors',
                mode === 'main' ? 'text-lg' : 'text-base'
              )}
            >
              {displayContent.title}
            </h3>
            <p
              className={cn(
                'text-gray-600',
                mode === 'main' ? 'text-sm' : 'text-xs'
              )}
            >
              {displayContent.subtitle}
            </p>
          </div>
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-gray-400 group-hover:text-green-600 transition-all duration-200',
            isHovered && 'translate-x-1'
          )}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
          />
        </svg>
      </div>

      <div className='space-y-3'>
        <div className='bg-white rounded-lg border border-gray-200 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <svg
                  className='w-4 h-4 text-blue-600'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' />
                </svg>
              </div>
              <div>
                <h4 className='font-medium text-gray-900'>Google Drive</h4>
                <p className='text-xs text-gray-500'>
                  Links, videos, documents
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='text-center'>
          {isUrlConfigured ? (
            <p
              className={cn(
                'text-gray-600',
                mode === 'main' ? 'text-sm' : 'text-xs'
              )}
            >
              {displayContent.description}
            </p>
          ) : (
            <div className='space-y-2'>
              <p
                className={cn(
                  'text-gray-600',
                  mode === 'main' ? 'text-sm' : 'text-xs'
                )}
              >
                Resources will be available here once configured
              </p>
              {mode === 'main' && (
                <p className='text-xs text-gray-500'>
                  Set NEXT_PUBLIC_GOOGLE_DRIVE_URL environment variable
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
