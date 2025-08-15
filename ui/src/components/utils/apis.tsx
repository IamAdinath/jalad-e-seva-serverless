

const baseUrl = 'https://d3enz4uo3rokqe.cloudfront.net/dev';
const baseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};
const apiEndpoints = {
  getPosts: `${baseUrl}/posts`,
  getPostById: (id: string) => `${baseUrl}/posts/${id}`,
  createPost: `${baseUrl}/create-post`,
  updatePost: (id: string) => `${baseUrl}/posts/${id}`,
  deletePost: (id: string) => `${baseUrl}/posts/${id}`,
  uploadToS3: `${baseUrl}/upload-to-s3`,
};

import { 
  type CreateBlogPost, 
  type APIErrorResponse, 
  type CreateBlogPostSuccessResponse 
} from './types';

export function uploadToS3(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file_name', file);
  return fetch(apiEndpoints.uploadToS3, {
    headers: baseHeaders,
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => data.url)
    .catch(error => {
      console.error('Error uploading thumbnail:', error);
      throw error;
    });
} 

export function createBlog(postData: CreateBlogPost): Promise<CreateBlogPostSuccessResponse | APIErrorResponse> {
  const hasFile = postData.image instanceof File;

  if (hasFile) {
    const formData = new FormData();
    Object.entries(postData).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    return fetch(apiEndpoints.createPost, {
      method: "POST",
      body: formData,
    })
      .then(response => response.json())
      .catch(error => {
        console.error("Error creating blog post:", error);
        throw error;
      });
  } else {
    return fetch(apiEndpoints.createPost, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(postData),
    })
      .then(response => response.json())
      .catch(error => {
        console.error("Error creating blog post:", error);
        throw error;
      });
  }
}