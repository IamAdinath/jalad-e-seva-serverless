import { useState, useEffect, useCallback, useRef } from 'react';
import { getBlogsbyCategory } from '../components/utils/apis';
import type { BlogPost } from '../components/utils/types';

interface UseCategoryBlogMarqueeReturn {
  blogs: BlogPost[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  blogs: BlogPost[];
  timestamp: number;
  category: string;
  daysThreshold: number;
  maxItems: number;
}

export const useCategoryBlogMarquee = (
  category: string,
  daysThreshold: number = 2,
  maxItems: number = 7
): UseCategoryBlogMarqueeReturn => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestInProgressRef = useRef(false);

  // Generate cache key based on category and parameters
  const getCacheKey = useCallback(() => {
    return `category-blogs-cache-${category}-${daysThreshold}-${maxItems}`;
  }, [category, daysThreshold, maxItems]);

  // Get cached data
  const getCachedData = useCallback((): BlogPost[] | null => {
    if (!category) return null;
    
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const cachedData: CachedData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid and matches current parameters
      if (
        now - cachedData.timestamp < CACHE_DURATION &&
        cachedData.category === category &&
        cachedData.daysThreshold === daysThreshold &&
        cachedData.maxItems === maxItems
      ) {
        console.log(`Using cached blog data for category: ${category}`);
        return cachedData.blogs;
      }
      
      // Cache is expired or parameters changed
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      const cacheKey = getCacheKey();
      localStorage.removeItem(cacheKey);
      return null;
    }
  }, [category, daysThreshold, maxItems, getCacheKey]);

  // Set cached data
  const setCachedData = useCallback((blogData: BlogPost[]) => {
    if (!category) return;
    
    try {
      const cacheData: CachedData = {
        blogs: blogData,
        timestamp: Date.now(),
        category,
        daysThreshold,
        maxItems
      };
      const cacheKey = getCacheKey();
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }, [category, daysThreshold, maxItems, getCacheKey]);

  // Filter recent blogs by date
  const filterRecentBlogs = useCallback((allBlogs: BlogPost[]): BlogPost[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    return allBlogs
      .filter(blog => {
        // Use publishedAt, startDate, or endDate for date comparison
        const blogDate = new Date(blog.publishedAt || blog.startDate || blog.endDate || '');
        return !isNaN(blogDate.getTime()) && blogDate >= cutoffDate;
      })
      .sort((a, b) => {
        // Sort by newest first
        const dateA = new Date(a.publishedAt || a.startDate || a.endDate || '');
        const dateB = new Date(b.publishedAt || b.startDate || b.endDate || '');
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, maxItems);
  }, [daysThreshold, maxItems]);

  // Debounced fetch blogs function
  const fetchBlogs = useCallback(async (useCache: boolean = true, debounceMs: number = 500) => {
    if (!category) {
      setLoading(false);
      return;
    }

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Prevent multiple simultaneous requests
    if (isRequestInProgressRef.current && debounceMs > 0) {
      console.log('Request already in progress, skipping');
      return;
    }

    return new Promise<void>((resolve) => {
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          isRequestInProgressRef.current = true;
          setError(null);
          
          // Try cache first if enabled
          if (useCache) {
            const cachedBlogs = getCachedData();
            if (cachedBlogs) {
              setBlogs(cachedBlogs);
              setLoading(false);
              setLastUpdated(new Date());
              resolve();
              return;
            }
          }

          setLoading(true);
          console.log(`Fetching recent blogs for category: ${category}, ${daysThreshold} days, ${maxItems} items`);
          
          const result = await getBlogsbyCategory(category);
          
          if ('error' in result) {
            throw new Error(result.error);
          }

          // Filter for recent blogs
          const recentBlogs = filterRecentBlogs(result);
          
          setBlogs(recentBlogs);
          setCachedData(recentBlogs);
          setLastUpdated(new Date());
          console.log(`Successfully fetched ${recentBlogs.length} recent blogs for category: ${category}`);
          
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : `Failed to fetch recent blogs for ${category}`;
          console.error('Error in fetchBlogs:', errorMessage);
          setError(errorMessage);
          
          // Try to use cached data as fallback even if expired
          const cachedBlogs = getCachedData();
          if (cachedBlogs && cachedBlogs.length > 0) {
            console.log('Using expired cache as fallback');
            setBlogs(cachedBlogs);
          }
        } finally {
          setLoading(false);
          isRequestInProgressRef.current = false;
          resolve();
        }
      }, debounceMs);
    });
  }, [category, daysThreshold, maxItems, getCachedData, setCachedData, filterRecentBlogs]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchBlogs(false, 0); // Skip cache and debounce on manual refresh
  }, [fetchBlogs]);

  // Initial fetch on mount or parameter change
  useEffect(() => {
    if (category) {
      fetchBlogs(true, 100); // Short debounce for initial load
    }
  }, [fetchBlogs, category]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    blogs,
    loading,
    error,
    refresh,
    lastUpdated
  };
};