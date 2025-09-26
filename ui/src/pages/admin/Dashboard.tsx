import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import AdminHeader from "../../components/AdminHeader";
import Footer from "../../components/Footer";
import type { BlogPost } from "../../components/utils/types";
import { getBlogs } from "../../components/utils/apis";
import { useToast } from "../../components/Toast";
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
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
      const data = await getBlogs(10, currentLastKey, "published");
      
      if ('error' in data) {
        showError(data.error);
        return;
      }

      if (isLoadMore) {
        setBlogs(prevBlogs => [...prevBlogs, ...data.blogs]);
        showSuccess(t('adminDashboardLoadedMore', { count: data.blogs.length }));
      } else {
        setBlogs(data.blogs);
        if (data.blogs.length === 0) {
          showSuccess(t('adminDashboardNoBlogs'));
        } else {
          showSuccess(t('adminDashboardLoadedBlogs', { count: data.blogs.length }));
        }
      }
      
      setHasMore(data.has_more);
      setLastKey(data.last_evaluated_key);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      showError(t('adminErrorFetchBlogs'));
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
    if (!dateString) return t('adminTableNA');
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <AdminHeader />
      <div className="admin-dashboard">
        <div className="container">
          <div className="dashboard-header">
            <h1>{t('adminDashboardTitle')}</h1>
            <p>{t('adminDashboardSubtitle')}</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>{t('adminDashboardLoading')}</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <h3>{t('adminDashboardEmpty')}</h3>
              <p>{t('adminDashboardEmptyDesc')}</p>
            </div>
          ) : (
            <>
              <div className="blogs-table">
                <table>
                  <thead>
                    <tr>
                      <th>{t('adminTableTitle')}</th>
                      <th>{t('adminTableCategory')}</th>
                      <th>{t('adminTablePublishedDate')}</th>
                      <th>{t('adminTableStatus')}</th>
                      <th>{t('adminTableActions')}</th>
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
                            {blog.category ? t(blog.category) : t('adminTableGeneral')}
                          </span>
                        </td>
                        <td>{formatDate(blog.publishedAt || blog.endDate || '')}</td>
                        <td>
                          <span className="status-badge published">
                            {t('adminTablePublished')}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-view"
                              onClick={() => window.open(`/blog/${blog.id}`, '_blank')}
                            >
                              {t('adminTableView')}
                            </button>
                            <button className="btn-edit">{t('adminTableEdit')}</button>
                            <button className="btn-delete">{t('adminTableDelete')}</button>
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
                    {loadingMore ? t('adminDashboardLoading2') : t('adminDashboardLoadMore')}
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

export default Dashboard;