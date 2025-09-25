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
      setLoading(false);
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
          setBlogs([]); // Set empty array if no blogs found
        }
      })
      .catch((error) => {
        console.error("Error fetching blogs - catch block:", error);
        setBlogs([]); // Set empty array on error
      })
      .finally(() => {
        console.log("Setting loading to false");
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
