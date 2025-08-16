
export const baseUrl = import.meta.env.VITE_API_URL; 
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
  getPostById: (id: string) => `${baseUrl}/posts/${id}`,
  createPost: `${baseUrl}/create-blog`,
  updatePost: (id: string) => `${baseUrl}/posts/${id}`,
  deletePost: (id: string) => `${baseUrl}/posts/${id}`,
  uploadToS3: `${baseUrl}/upload-to-s3`,
  getCategories: `${baseUrl}/categories`,
  getCategoryById: (id: string) => `${baseUrl}/categories/${id}`,
  createCategory: `${baseUrl}/create-category`,
  updateCategory: (id: string) => `${baseUrl}/categories/${id}`,
  deleteCategory: (id: string) => `${baseUrl}/categories/${id}`,
  getBlogsbyStatus: (status: string) => `${baseUrl}/blogs?status=${status}`,
  getBlogsbyCategory: (category: string) => `${baseUrl}/get-blogs-by-category?category=${category}`,
};