import React from 'react';

// Import the dedicated CSS file for our blog list
import './BlogList.css';
import { useTranslation } from 'react-i18next';

// Define the type for a single blog post object
interface BlogPost {
  id: string;
  title: string;
  summary: string; // The 15-20 word summary we created
  thumbnailUrl: string;
  authorName: string;
  authorAvatarUrl: string;
  LastDate: string;
  readTime: number; // Estimated read time in minutes
}

// --- SAMPLE DATA ---
// In a real application, this data would come from your API
const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'Unlocking New Opportunities: A Guide to Government Schemes',
    summary: 'Discover the latest government schemes designed to support students, farmers, and small business owners. Our comprehensive guide breaks it all down...',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1000&auto=format&fit=crop',
    authorName: 'Priya Sharma',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    LastDate: 'Aug 2, 2025',
    readTime: 5,
  },
  {
    id: '2',
    title: 'The Future of Farming: Tech and Sustainability',
    summary: 'From drone technology to sustainable irrigation, explore how modern advancements are transforming the agricultural sector for a brighter, more productive future...',
    thumbnailUrl: 'https://images.unsplash.com/photo-1599591439249-f5546d141972?q=80&w=1000&auto=format&fit=crop',
    authorName: 'Rohan Joshi',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    LastDate: 'Jul 28, 2025',
    readTime: 7,
  },
  {
    id: '3',
    title: 'Navigating Your Career: Top Government Jobs This Month',
    summary: 'Looking for a stable and rewarding career? We have compiled a list of the top government job openings across various sectors this month...',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000&auto=format&fit=crop',
    authorName: 'Anjali Desai',
    authorAvatarUrl: 'https://randomuser.me/api/portraits/women/17.jpg',
    LastDate: 'Jul 25, 2025',
    readTime: 4,
  },
];


const BlogList: React.FC = () => {
    const { t } = useTranslation();
  return (
    <section className="blog-list-section">
      <div className="container">
        <div className="section-heading">
          <h2>{t('BloglistTitle')}</h2>
          <p>{t('BloglistDescription')}</p>
        </div>

        <div className="blog-grid">
          {samplePosts.map((post) => (
            <a href={`/blog/${post.id}`} className="blog-card" key={post.id}>
              <div className="card-thumbnail">
                <img src={post.thumbnailUrl} alt={post.title} />
              </div>
              <div className="card-content">
                <h3 className="card-title">{post.title}</h3>
                {/* HERE is where we use the blog summary */}
                <p className="card-summary">{post.summary}</p>
                <div className="card-footer">
                  {/* <div className="author-info">
                    <img src={post.authorAvatarUrl} alt={post.authorName} className="author-avatar" />
                    <span className="author-name">{post.authorName}</span>
                  </div> */}
                  <div className="post-meta">
                    <span>{t('BlogLastDate')}: </span>
                    <span>{post.LastDate}</span>
                    <span className="separator">·</span>
                    <span>
                        <a href={post.id}>{t('BloglistReadMore')}</a>
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogList;