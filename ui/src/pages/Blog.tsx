import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import BlogList from "../components/BlogList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { BlogPost } from "../components/utils/types";
import { getBlogbyId } from "../components/utils/apis";

const Blog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getBlogbyId(id)
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
  }, [id]); // dependency array to re-run on category change

  return (
    <>
      <Header />
      <BlogList blogs={blogs} loading={loading} />
      <Footer />
    </>
  );
};

export default Blog;
