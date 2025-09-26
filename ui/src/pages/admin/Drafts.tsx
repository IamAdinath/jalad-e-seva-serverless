import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import Footer from "../../components/Footer";
import type { BlogPost } from "../../components/utils/types";
import { getBlogs } from "../../components/utils/apis";
import { useToast } from "../../components/Toast";
import './Dashboard.css'; // Reuse the same styles

const Drafts: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastKey, setLastKey] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const { showError, showSuccess } = useToast();

  const fetchBlogs = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const currentLastKey = isLoadMore ? lastKey : undefined;
      const data = await getBlogs(10, currentLastKey, "draft");
      
      if ('error' in data) {
        showError(data.error);
        return;
      }

      if (isLoadMore) {
        setBlogs(prevBlogs => [...prevBlogs, ...data.blogs]);
        showSuccess(`Loaded ${data.blogs.length} more drafts`);
      } else {
        setBlogs(data.blogs);
        if (data.blogs.length === 0) {
          showSuccess("No draft blogs found");
        } else {
          showSuccess(`Loaded ${data.blogs.length} draft blogs`);
        }
      }
      
      setHasMore(data.has_more);
      setLastKey(data.last_evaluated_key);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      showError("Failed to fetch draft blogs");
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <AdminHeader />
      <div className="admin-dashboard">
        <div className="container">
          <div className="dashboard-header">
            <h1>Draft Blogs</h1>
            <p>Manage your draft blog posts</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Loading drafts...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <h3>No Draft Blogs</h3>
              <p>You don't have any draft blogs at the moment.</p>
            </div>
          ) : (
            <>
              <div className="blogs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog) => (
                      <tr key={blog.id}>
                        <td>
                          <div className="blog-title">
                            {blog.image && (
                              <img 
                                src={blog.image} 
                                alt={blog.title}
                                className="blog-thumbnail"
                              />
                            )}
                            <div>
                              <h4>{blog.title}</h4>
                              <p>{blog.summary}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">
                            {blog.category || 'General'}
                          </span>
                        </td>
                        <td>{formatDate(blog.startDate || '')}</td>
                        <td>
                          <span className="status-badge draft">
                            Draft
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-edit">Edit</button>
                            <button className="btn-view">Publish</button>
                            <button className="btn-delete">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hasMore && (
                <div className="load-more-section">
                  <button 
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="load-more-button"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Drafts'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Drafts;