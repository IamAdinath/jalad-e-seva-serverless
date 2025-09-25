import React, { useEffect, useState } from "react";
import BlogList from "../components/BlogList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { BlogPost } from "../components/utils/types";
import { getBlogs } from "../components/utils/apis";

const AllBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastKey, setLastKey] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBlogs = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const currentLastKey = isLoadMore ? lastKey : undefined;
      const data = await getBlogs(10, currentLastKey, "published");
      
      if ('error' in data) {
        setError(data.error);
        return;
      }

      if (isLoadMore) {
        setBlogs(prevBlogs => [...prevBlogs, ...data.blogs]);
      } else {
        setBlogs(data.blogs);
      }
      
      setHasMore(data.has_more);
      setLastKey(data.last_evaluated_key);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError("Failed to fetch blogs");
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchBlogs(true);
    }
  };



  if (error) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Error Loading Blogs</h2>
          <p>{error}</p>
          <button onClick={() => fetchBlogs()} style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Try Again
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const testAllBlogsAPI = async () => {
    console.log("Testing all blogs API directly...");
    try {
      const url = `https://mt1vak2utb.execute-api.ap-south-1.amazonaws.com/dev/get-blogs?status=published&limit=10`;
      console.log("Testing URL:", url);
      
      const response = await fetch(url);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      const data = await response.json();
      console.log("Response data:", data);
    } catch (error) {
      console.error("Direct API test error:", error);
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <button 
          onClick={testAllBlogsAPI}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Test All Blogs API
        </button>
      </div>
      <BlogList blogs={blogs} loading={loading} />
      
      {/* Load More Button */}
      {!loading && hasMore && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loadingMore ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {loadingMore ? 'Loading...' : 'Load More Blogs'}
          </button>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default AllBlogs;