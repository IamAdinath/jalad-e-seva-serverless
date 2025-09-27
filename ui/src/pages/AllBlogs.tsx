import React, { useEffect, useState } from "react";
import BlogList from "../components/BlogList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { BlogPost } from "../components/utils/types";
import { getBlogs } from "../components/utils/apis";
import { useToast } from "../components/Toast";
import { useTranslation } from "react-i18next";
import "../assets/css/page-layouts-responsive.css";

const AllBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastKey, setLastKey] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const { showError, showSuccess, showInfo } = useToast();
  const { t } = useTranslation();

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
        showError(data.error);
        return;
      }

      if (isLoadMore) {
        setBlogs(prevBlogs => [...prevBlogs, ...data.blogs]);
        showSuccess(`Loaded ${data.blogs.length} more blogs`);
      } else {
        setBlogs(data.blogs);
        if (data.blogs.length === 0) {
          showInfo("No blogs found");
        } else {
          showSuccess(`Loaded ${data.blogs.length} blogs`);
        }
      }
      
      setHasMore(data.has_more);
      setLastKey(data.last_evaluated_key);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      const errorMessage = t('fetchBlogsError');
      setError(errorMessage);
      showError(errorMessage);
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
        <div className="all-blogs-error">
          <h2>Error Loading Blogs</h2>
          <p>{error}</p>
          <button onClick={() => fetchBlogs()}>
            Try Again
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
        <div className="load-more-section">
          <button 
            className="load-more-button"
            onClick={handleLoadMore}
            disabled={loadingMore}
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