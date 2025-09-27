import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast } from '../components/Toast';
import { searchBlogs, fallbackSearchBlogs } from '../components/utils/searchApi';
import type { BlogPost } from '../components/utils/types';

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { showError, showInfo, showSuccess } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    setLoading(true);
    setBlogs([]);
    
    try {
      console.log(`Performing search for: "${query}"`);
      
      // Try the main search API first
      let results = await searchBlogs(query, 20);
      
      // If the main API fails, try fallback search
      if ('error' in results) {
        console.log('Main search API failed, trying fallback search...');
        showInfo('Using local search...');
        results = await fallbackSearchBlogs(query, 20);
      }
      
      if ('error' in results) {
        throw new Error(results.error);
      }
      
      setBlogs(results);
      
      if (results.length === 0) {
        showInfo(`No results found for "${query}"`);
      } else {
        showSuccess(`Found ${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      showError('Failed to perform search. Please try again.');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <>
      <Header />
      <div className="search-page" style={{ minHeight: '60vh', padding: '100px 20px 50px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="search-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '10px' }}>
              {t('searchResults', 'Search Results')}
            </h1>
            {searchQuery && (
              <p style={{ fontSize: '1.2rem', color: '#666' }}>
                {t('searchingFor', 'Searching for')}: "<strong>{searchQuery}</strong>"
              </p>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div style={{ 
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #00796b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '20px', color: '#666' }}>
                {t('searching', 'Searching...')}
              </p>
            </div>
          ) : (
            <div className="search-results">
              {blogs.length > 0 ? (
                <>
                  <div style={{ marginBottom: '20px', color: '#666' }}>
                    {t('searchResultsCount', `Found ${blogs.length} result${blogs.length === 1 ? '' : 's'}`)}
                  </div>
                  <div className="blogs-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
                  }}>
                    {blogs.map((blog) => (
                      <Link 
                        key={blog.id} 
                        to={`/blog/${blog.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="blog-card" style={{
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          padding: '20px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          transition: 'transform 0.3s ease',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer'
                        }}>
                          {blog.image && (
                            <img 
                              src={blog.image} 
                              alt={blog.title}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                marginBottom: '15px'
                              }}
                            />
                          )}
                          <h3 style={{ 
                            color: '#00796b', 
                            marginBottom: '10px',
                            fontSize: '1.3rem',
                            lineHeight: '1.4'
                          }}>
                            {blog.title}
                          </h3>
                          <p style={{ 
                            color: '#666', 
                            lineHeight: '1.6',
                            flex: 1,
                            marginBottom: '15px'
                          }}>
                            {blog.summary}
                          </p>
                          
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginTop: 'auto'
                          }}>
                            {blog.category && (
                              <span style={{
                                display: 'inline-block',
                                backgroundColor: '#ffc107',
                                color: '#333',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.9rem'
                              }}>
                                {t(`ctg${blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}`, blog.category)}
                              </span>
                            )}
                            
                            {(blog.publishedAt || blog.startDate) && (
                              <span style={{ 
                                fontSize: '0.9rem', 
                                color: '#999' 
                              }}>
                                {formatDate(blog.publishedAt || blog.startDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
                  <h3 style={{ color: '#666', marginBottom: '10px' }}>
                    {t('noResultsFound', 'No results found')}
                  </h3>
                  <p style={{ color: '#999', marginBottom: '20px' }}>
                    {t('searchTips', 'Try different keywords or browse our categories')}
                  </p>
                  <Link 
                    to="/" 
                    style={{
                      display: 'inline-block',
                      padding: '10px 20px',
                      backgroundColor: '#00796b',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '25px',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    {t('backToHome', 'Back to Home')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .blog-card:hover {
          transform: translateY(-5px);
        }
        
        @media (max-width: 768px) {
          .blogs-grid {
            grid-template-columns: 1fr !important;
          }
          
          .search-header h1 {
            font-size: 2rem !important;
          }
          
          .search-header p {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default Search;