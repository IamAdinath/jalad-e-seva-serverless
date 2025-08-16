

import { baseHeaders, apiEndpoints } from './constants';

import { 
  type CreateBlogPost, 
  type APIErrorResponse, 
  type CreateBlogPostSuccessResponse,
  type BlogPost
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
      body: JSON.stringify(postData),
    })
      .then(response => response.json())
      .catch(error => {
        console.error("Error creating blog post:", error);
        throw error;
      });
  }
}


export function getBlogsbyCategory(
  category: string
): Promise<BlogPost[] | APIErrorResponse> {
  return fetch(apiEndpoints.getBlogsbyCategory(category), { method: "GET" })
    .then((res) => res.json())
    .then((data) => {
      if (data && Array.isArray(data.blogs)) {
        return data.blogs as BlogPost[];
      } else {
        throw new Error("Invalid response format: 'blogs' not found");
      }
    })
    .catch((error) => {
      console.error("Error fetching blogs by category:", error);
      return Promise.reject({ error: "Failed to fetch blogs by category" });
    });
}