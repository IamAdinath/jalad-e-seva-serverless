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
    if (!category) return;

    setLoading(true);
    getBlogsbyCategory(category)
      .then((data) => {
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          console.error("Error fetching blogs:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category]); // dependency array to re-run on category change

  return (
    <>
      <Header />
      <BlogList blogs={blogs} loading={loading} />
      <Footer />
    </>
  );
};

export default CategoryBlogs;
