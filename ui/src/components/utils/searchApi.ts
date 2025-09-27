import { apiEndpoints } from './constants';
import type { BlogPost, APIErrorResponse } from './types';

export async function searchBlogs(
  query: string,
  limit: number = 20
): Promise<BlogPost[] | APIErrorResponse> {
  try {
    if (!query.trim()) {
      return [];
    }

    // Validate query length
    if (query.trim().length < 2) {
      return { error: "Search query must be at least 2 characters long", status: 'error' } as APIErrorResponse;
    }

    const url = apiEndpoints.searchBlogs(query.trim(), limit);
    console.log("Searching blogs with URL:", url);
    
    const res = await fetch(url, { 
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log("Search response status:", res.status);
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Search endpoint not found. Please check if the search API is deployed.");
      } else if (res.status >= 500) {
        throw new Error("Server error occurred while searching. Please try again later.");
      } else {
        throw new Error(`Search failed with status ${res.status}`);
      }
    }
    
    const data = await res.json();
    console.log("Search response data:", data);

    if (data && Array.isArray(data.blogs)) {
      return data.blogs as BlogPost[];
    } else if (data && Array.isArray(data)) {
      // Handle case where API returns array directly
      return data as BlogPost[];
    } else if (data && data.message && data.blogs === undefined) {
      // Handle case where no results found but API returns success
      return [];
    } else {
      console.error("Invalid search response format:", data);
      throw new Error("Invalid response format from search API");
    }
  } catch (error) {
    console.error("Error searching blogs:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to search blogs";
    return { error: errorMessage, status: 'error' } as APIErrorResponse;
  }
}

// Fallback search function that searches through existing blogs client-side
// This can be used if the backend search API is not available yet
export async function fallbackSearchBlogs(
  query: string,
  limit: number = 20
): Promise<BlogPost[] | APIErrorResponse> {
  try {
    if (!query.trim()) {
      return [];
    }

    // Import the getBlogs function dynamically to avoid circular imports
    const { getBlogs } = await import('./apis');
    
    // Fetch all published blogs
    const response = await getBlogs(100, undefined, "published");
    
    if ('error' in response) {
      return response;
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Search through titles, summaries, and content
    const matchingBlogs = response.blogs
      .filter(blog => {
        const title = (blog.title || "").toLowerCase();
        const summary = (blog.summary || "").toLowerCase();
        const textContent = (blog.textContent || "").toLowerCase();
        const htmlContent = (blog.htmlContent || "").toLowerCase();
        
        return title.includes(searchTerm) || 
               summary.includes(searchTerm) || 
               textContent.includes(searchTerm) ||
               htmlContent.includes(searchTerm);
      })
      .sort((a, b) => {
        // Prioritize title matches over summary/content matches
        const aTitleMatch = a.title?.toLowerCase().includes(searchTerm) ? 1 : 0;
        const bTitleMatch = b.title?.toLowerCase().includes(searchTerm) ? 1 : 0;
        
        if (aTitleMatch !== bTitleMatch) {
          return bTitleMatch - aTitleMatch;
        }
        
        // Then sort by date (newest first)
        const dateA = new Date(a.publishedAt || a.startDate || a.endDate || '');
        const dateB = new Date(b.publishedAt || b.startDate || b.endDate || '');
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);

    console.log(`Found ${matchingBlogs.length} blogs matching "${query}"`);
    return matchingBlogs;

  } catch (error) {
    console.error("Error in fallback search:", error);
    return { error: "Failed to search blogs", status: 'error' } as APIErrorResponse;
  }
}