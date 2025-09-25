import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import BlogList from "../components/BlogList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { BlogPost } from "../components/utils/types";
import { getBlogsbyCategory } from "../components/utils/apis";

const CategoryBlogs: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("CategoryBlogs useEffect triggered with category:", category);

    if (!category) {
      console.log("No category provided, returning early");
      return;
    }

    console.log("Fetching blogs for category:", category);
    setLoading(true);
    getBlogsbyCategory(category)
      .then((data) => {
        console.log("getBlogsbyCategory response:", data);
        if (Array.isArray(data)) {
          console.log("Setting blogs:", data.length, "items");
          setBlogs(data);
        } else {
          console.error("Error fetching blogs - not an array:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching blogs - catch block:", error);
      })
      .finally(() => {
        console.log("Setting loading to false");
        setLoading(false);
      });
  }, [category]); // dependency array to re-run on category change

  const testCategoryAPI = async () => {
    console.log("Testing category API directly...");
    try {
      const url = `https://mt1vak2utb.execute-api.ap-south-1.amazonaws.com/dev/get-blogs-by-category?category=${category}`;
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
        <h2>Category: {category}</h2>
        <button
          onClick={testCategoryAPI}
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
          Test Category API
        </button>
      </div>
      <BlogList blogs={blogs} loading={loading} />
      <Footer />
    </>
  );
};

export default CategoryBlogs;
