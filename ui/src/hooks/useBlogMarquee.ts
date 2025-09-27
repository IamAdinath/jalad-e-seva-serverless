import { useState, useEffect, useCallback, useRef } from 'react';
import { getRecentBlogs } from '../components/utils/apis';
import type { BlogPost } from '../components/utils/types';

interface UseBlogMarqueeReturn {
  blogs: BlogPost[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

const CACHE_KEY = 'recent-blogs-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  blogs: BlogPost[];
  timestamp: number;
  daysThreshold: number;
  maxItems: number;
}

export const useBlogMarquee = (
  daysThreshold: number = 2,
  maxItems: number = 7
): UseBlogMarqueeReturn => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestInProgressRef = useRef(false);

  // Get cached data
  const getCachedData = useCallback((): BlogPost[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cachedData: CachedData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid and matches current parameters
      if (
        now - cachedData.timestamp < CACHE_DURATION &&
        cachedData.daysThreshold === daysThreshold &&
        cachedData.maxItems === maxItems
      ) {
        console.log('Using cached blog data');
        return cachedData.blogs;
      }
      
      // Cache is expired or parameters changed
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, [daysThreshold, maxItems]);

  // Set cached data
  const setCachedData = useCallback((blogData: BlogPost[]) => {
    try {
      const cacheData: CachedData = {
        blogs: blogData,
        timestamp: Date.now(),
        daysThreshold,
        maxItems
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }, [daysThreshold, maxItems]);

  // Debounced fetch blogs function
  const fetchBlogs = useCallback(async (useCache: boolean = true, debounceMs: number = 500) => {
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
          console.log(`Fetching recent blogs: ${daysThreshold} days, ${maxItems} items`);
          
          const result = await getRecentBlogs(daysThreshold, maxItems);
          
          if ('error' in result) {
            throw new Error(result.error);
          }

          setBlogs(result);
          setCachedData(result);
          setLastUpdated(new Date());
          console.log(`Successfully fetched ${result.length} recent blogs`);
          
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent blogs';
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
  }, [daysThreshold, maxItems, getCachedData, setCachedData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchBlogs(false, 0); // Skip cache and debounce on manual refresh
  }, [fetchBlogs]);

  // Initial fetch on mount or parameter change
  useEffect(() => {
    fetchBlogs(true, 100); // Short debounce for initial load
  }, [fetchBlogs]);

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