import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiEndpoints } from "./utils/constants";

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  thumbnailUrl: string;
  authorName: string;
  authorAvatarUrl: string;
  LastDate: string;
  readTime: number;
}

const BlogList: React.FC = () => {
  const { t } = useTranslation();
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    setLoading(true);

    fetch(`${apiEndpoints}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setLoading(false);
      });
  }, [category]);

  return (
    <section className="blog-list-section">
      <div className="container">
        <div className="section-heading">
          <h2>
            {t("BloglistTitle")} {t(`nav${category}`) ? `(${category})` : ""}
          </h2>
          <p>{t("BloglistDescription")}</p>
        </div>

        {loading ? (
          <p>{t("Loading")}...</p>
        ) : posts.length === 0 ? (
          <p>{t("NoBlogsFound")}</p>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <Link to={`/blog/${post.id}`} className="blog-card" key={post.id}>
                <div className="card-thumbnail">
                  <img src={post.thumbnailUrl} alt={post.title} />
                </div>
                <div className="card-content">
                  <h3 className="card-title">{post.title}</h3>
                  <p className="card-summary">{post.summary}</p>
                  <div className="card-footer">
                    <div className="post-meta">
                      <span>{t("BlogLastDate")}: </span>
                      <span>{post.LastDate}</span>
                      <span className="separator">·</span>
                      <span>
                        <Link to={`/blog/${post.id}`}>
                          {t("BloglistReadMore")}
                        </Link>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogList;
