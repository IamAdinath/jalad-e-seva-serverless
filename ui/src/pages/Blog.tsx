import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Assuming these are imported from your project files
import { getBlogbyId } from '../components/utils/apis';
import type { BlogPost } from '../components/utils/types';
import Header from '../components/Header';
import BlogReader from '../components/ReadBlog';
import Footer from '../components/Footer';
import { useToast } from '../components/Toast';
import "../assets/css/page-layouts-responsive.css";

const Blog = () => {
  const { id } = useParams<{ id: string }>();
  const { showError, showSuccess } = useToast();

  // State for the blog post
  const [blog, setBlog] = useState<BlogPost | undefined>(undefined);
  // NEW: State to hold any error messages
  const [error, setError] = useState<string | null>(null);
  // State for loading status
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        setLoading(false);
        setError("No blog ID provided.");
        return;
      }

      setLoading(true);
      setError(null); // Reset previous errors
      const fetchedBlog = await getBlogbyId(id); 
      
      // --- THIS IS THE CRITICAL FIX ---
      // We now check the shape of the response to see if it's an error.
      // This is called a "type guard".
      if ('error' in fetchedBlog) {
        // It's an APIErrorResponse
        setError(fetchedBlog.error);
        setBlog(undefined); // Ensure no old blog data is shown
        showError(fetchedBlog.error);
      } else {
        // It's a successful BlogPost
        setBlog(fetchedBlog);
        showSuccess('Blog loaded successfully');
      }
      
      setLoading(false);
    };

    fetchBlog();
  }, [id]);

  // --- NEW: Render an error message if one exists ---
  if (error) {
    return (
      <>
        <Header />
        <div className="blog-error-container">
            <h2>Error Fetching Blog</h2>
            <p>{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  // Your existing render logic for loading and success states
  return (
    <>
      <Header />
      {/* 
        The BlogReader component will now correctly show its own 
        loading/not-found message based on these props.
      */}
      <BlogReader blog={blog} loading={loading} />
      <Footer />
    </>
  );
};

export default Blog;