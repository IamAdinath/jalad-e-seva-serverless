import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BlogPost } from './utils/types';

// 1. CRITICAL: Import the dedicated CSS file for the reader
import './BlogReader.css';

// 2. Props are now for a SINGLE blog post, not an array
interface BlogReaderProps {
  blog: BlogPost | undefined | null;
  loading?: boolean;
}

const BlogReader: React.FC<BlogReaderProps> = ({ blog, loading = false }) => {
  const { t } = useTranslation();

  // --- Loading State ---
  // Display a loading message while the blog is being fetched.
  if (loading) {
    return (
      <div className="reader-status-container">
        <p>{t('Loading')}...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="reader-status-container">
        <h2>{t('BlogNotFoundTitle')}</h2>
        <p>{t('BlogNotFoundDescription')}</p>
      </div>
    );
  }

  // --- Success State: Render the Blog Post ---
  return (
    <article className="blog-reader-container">
      {/* Article Header: Contains Title and Metadata */}
      <header className="blog-header">
        <h1 className="blog-title">{blog.title}</h1>
        <div className="blog-meta">
          <span>{t('Category')}: {blog.category}</span>
          <span className="separator">·</span>
          <span>{t('PublishedOn')}: {blog.startDate}</span>
        </div>
      </header>

      {blog.image && (
        <figure className="featured-image">
          <img src={blog.image} alt={blog.title} />
        </figure>
      )}

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.htmlContent }}
      />
    </article>
  );
};

export default BlogReader;