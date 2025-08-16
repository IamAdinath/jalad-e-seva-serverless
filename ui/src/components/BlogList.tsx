import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { BlogPost } from "./utils/types";
import './BlogList.css'
interface BlogListProps {
  blogs: BlogPost[] | undefined | null;
  loading?: boolean;
}

const BlogList: React.FC<BlogListProps> = ({ blogs, loading = false }) => {
  const { t } = useTranslation();

  const blogArray = Array.isArray(blogs) ? blogs : [];

  return (
    <section className="blog-list-section">
      <div className="container">
        <div className="section-heading">
          <h2>{t("BloglistTitle")}</h2>
          <p>{t("BloglistDescription")}</p>
        </div>

        {loading ? (
          <p>{t("Loading")}...</p>
        ) : blogArray.length === 0 ? (
          <p>{t("NoBlogsFound")}</p>
        ) : (
          <div className="blog-grid">
            {blogArray.map((post) => (
              <Link to={`/blog/${post.id}`} className="blog-card" key={post.id}>
                <div className="card-thumbnail">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="card-content">
                  <h3 className="card-title">{post.title}</h3>
                  <p className="card-summary">{post.summary}</p>
                  <div className="card-footer">
                    <div className="post-meta">
                      <span>{t("BlogLastDate")}: </span>
                      <span>{post.endDate}</span>
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
