import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BlogList from "../components/BlogList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CategoryBlogsMarquee from "../components/CategoryBlogsMarquee";
import type { BlogPost } from "../components/utils/types";
import { getBlogsbyCategory } from "../components/utils/apis";
import { useToast } from "../components/Toast";

const CategoryBlogs: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess, showInfo } = useToast();

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
          if (data.length === 0) {
            showInfo(`No blogs found in ${category} category`);
          } else {
            showSuccess(`Found ${data.length} blogs in ${category} category`);
          }
        } else {
          console.error("Error fetching blogs - not an array:", data);
          setBlogs([]);
          showError(data.error || `Failed to fetch blogs for ${category} category`);
        }
      })
      .catch((error) => {
        console.error("Error fetching blogs - catch block:", error);
        setBlogs([]);
        showError(`Failed to fetch blogs for ${category} category`);
      })
      .finally(() => {
        console.log("Setting loading to false");
        setLoading(false);
      });
  }, [category]); // dependency array to re-run on category change

  return (
    <>
      <Header />
      {category && (
        <CategoryBlogsMarquee 
          category={category}
          maxItems={7}
          daysThreshold={2}
          fallbackMessage={t('marqueeStayTuned', { category: t(`ctg${category.charAt(0).toUpperCase() + category.slice(1)}`) || category })}
          enableAutoRefresh={true}
          refreshInterval={5 * 60 * 1000} // 5 minutes
        />
      )}
      <BlogList blogs={blogs} loading={loading} />
      <Footer />
    </>
  );
};

export default CategoryBlogs;
