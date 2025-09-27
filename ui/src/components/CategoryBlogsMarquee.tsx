import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCategoryBlogMarquee } from '../hooks/useCategoryBlogMarquee';
import type { BlogPost } from './utils/types';

// Import the existing CSS files for consistent styling
import './UpdatesMarquee.css';
import './BlogsMarquee.css';

interface CategoryBlogsMarqueeProps {
  category: string;
  maxItems?: number;
  daysThreshold?: number;
  fallbackMessage?: string;
  enableRetry?: boolean;
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
}

interface MarqueeItem {
  id: string;
  text: string;
  publishedAt?: Date;
}

const CategoryBlogsMarquee: React.FC<CategoryBlogsMarqueeProps> = React.memo(({ 
  category,
  maxItems = 7, 
  daysThreshold = 2,
  fallbackMessage,
  enableRetry = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes default
  enableAutoRefresh = true
}) => {
  const { blogs, loading, error, refresh, lastUpdated } = useCategoryBlogMarquee(category, daysThreshold, maxItems);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized transformation of blogs to marquee items
  const transformBlogsToMarqueeItems = useCallback((blogPosts: BlogPost[]): MarqueeItem[] => {
    return blogPosts.map(blog => ({
      id: blog.id,
      text: blog.title,
      publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : undefined
    }));
  }, []);

  // Handle retry mechanism
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      refresh();
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!enableAutoRefresh || refreshInterval <= 0 || !category) {
      return;
    }

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval
    refreshIntervalRef.current = setInterval(() => {
      console.log(`Auto-refreshing category blog marquee data for: ${category}`);
      refresh();
    }, refreshInterval);

    // Cleanup on unmount or dependency change
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [enableAutoRefresh, refreshInterval, refresh, category]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    setRetryCount(0); // Reset retry count on manual refresh
    refresh();
  };

  // Keyboard event handler for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Resume animation
      const marqueeContent = event.currentTarget.querySelector('.marquee-content') as HTMLElement;
      if (marqueeContent) {
        marqueeContent.style.animationPlayState = 'running';
      }
    } else if (event.key === 'Tab') {
      // Pause animation when tabbing through
      const marqueeContent = event.currentTarget.querySelector('.marquee-content') as HTMLElement;
      if (marqueeContent) {
        marqueeContent.style.animationPlayState = 'paused';
      }
    }
  }, []);

  // Memoized display items calculation
  const displayItems = useMemo((): MarqueeItem[] => {
    if (loading && blogs.length === 0) {
      return [{ 
        id: 'loading', 
        text: retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : `Loading latest ${category} updates...` 
      }];
    }

    if (error) {
      // If we have cached blogs, show them with error indicator
      if (blogs.length > 0) {
        const blogItems = transformBlogsToMarqueeItems(blogs);
        blogItems.unshift({ 
          id: 'error-indicator', 
          text: '⚠️ Using cached updates (connection issue)' 
        });
        return blogItems;
      }

      // No cached data available
      if (enableRetry && retryCount < maxRetries) {
        setTimeout(handleRetry, 2000); // Auto-retry after 2 seconds
        return [{ 
          id: 'error-retry', 
          text: `Connection failed. Retrying... (${retryCount + 1}/${maxRetries})` 
        }];
      }

      // Max retries reached, use fallback
      if (fallbackMessage) {
        return [{ id: 'fallback', text: fallbackMessage }];
      }

      return [{ 
        id: 'error-final', 
        text: `Unable to load ${category} updates. Please check your connection.` 
      }];
    }

    if (blogs.length === 0) {
      // No recent blogs found
      if (fallbackMessage) {
        return [{ id: 'fallback', text: fallbackMessage }];
      }
      return [{ id: 'no-updates', text: `No recent ${category} updates available` }];
    }

    // Reset retry count on successful load
    if (retryCount > 0) {
      setRetryCount(0);
    }

    return transformBlogsToMarqueeItems(blogs);
  }, [blogs, loading, error, retryCount, fallbackMessage, enableRetry, maxRetries, transformBlogsToMarqueeItems, handleRetry, category]);

  // Memoized marquee content for seamless loop
  const marqueeContent = useMemo(() => {
    return [...displayItems, ...displayItems];
  }, [displayItems]);

  // Memoized container classes
  const containerClasses = useMemo(() => [
    'updates-marquee-container',
    loading ? 'marquee-loading' : '',
    error ? 'marquee-error' : ''
  ].filter(Boolean).join(' '), [loading, error]);

  // Don't render if no category is provided
  if (!category) {
    return null;
  }

  return (
    <div 
      className={containerClasses}
      role="banner"
      aria-label={`Latest ${category} updates and announcements`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading ? `Loading ${category} updates` : 
         error ? `Error loading ${category} updates, showing cached or fallback content` :
         `${blogs.length} recent ${category} updates available`}
      </div>
      
      <div className="updates-label">
        <div>{category.toUpperCase()}</div>
        {lastUpdated && (
          <div className="last-updated" aria-label={`Last updated at ${lastUpdated.toLocaleString()}`}>
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      
      <div className="marquee-wrapper">
        <div 
          className="marquee-content"
          role="marquee"
          aria-label={`Scrolling ${category} updates`}
        >
          {marqueeContent.map((item, index) => (
            <span 
              className="update-item" 
              key={`${item.id}-${index}`}
              role="text"
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
      
      {/* Manual refresh button for development and accessibility */}
      {(process.env.NODE_ENV === 'development' || error) && (
        <button 
          className="refresh-button"
          onClick={handleManualRefresh}
          disabled={loading}
          aria-label={`Refresh ${category} updates manually`}
          title={`Click to refresh ${category} updates`}
        >
          {loading ? '⟳' : '↻'}
        </button>
      )}
      
      {/* Keyboard instructions for screen readers */}
      <div className="sr-only">
        Press Tab to pause scrolling, Escape to resume
      </div>
    </div>
  );
});

CategoryBlogsMarquee.displayName = 'CategoryBlogsMarquee';

export default CategoryBlogsMarquee;