import React, { useEffect, useState } from "react";
import BlogList from "../components/BlogList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { BlogPost } from "../components/utils/types";
import { getBlogs, debugScan } from "../components/utils/apis";

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

  const handleDebugScan = async () => {
    console.log("Running debug scan...");
    const result = await debugScan();
    console.log("Debug scan result:", result);
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
            cursor: 'pointer',
            marginRight: '1rem'
          }}>
            Try Again
          </button>
          <button onClick={handleDebugScan} style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Debug Scan
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
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