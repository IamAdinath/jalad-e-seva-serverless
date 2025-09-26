
// export const baseUrl = import.meta.env.VITE_API_URL;
export const baseUrl = 'https://mt1vak2utb.execute-api.ap-south-1.amazonaws.com/dev'; 
export const baseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const authHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
};

export const apiEndpoints = {
  getPosts: `${baseUrl}/posts`,
  getBlogs: (limit?: number, lastKey?: string, status?: string) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (lastKey) params.append('last_evaluated_key', lastKey);
    if (status) params.append('status', status);
    return `${baseUrl}/get-blogs${params.toString() ? '?' + params.toString() : ''}`;
  },
  getPostById: (id: string) => `${baseUrl}/get-blog-by-id?id=${id}`,
  createPost: `${baseUrl}/create-blog`,
  updatePost: (id: string) => `${baseUrl}/posts/${id}`,
  deletePost: (id: string) => `${baseUrl}/posts/${id}`,
  uploadToS3: `${baseUrl}/upload-to-s3`,
  getBlogsbyStatus: (status: string) => `${baseUrl}/blogs?status=${status}`,
  getBlogsbyCategory: (category: string) => `${baseUrl}/get-blogs-by-category?category=${category}`,
};