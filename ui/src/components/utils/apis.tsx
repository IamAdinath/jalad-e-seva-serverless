

import { baseHeaders, apiEndpoints } from './constants';
import type { DefaultResponse } from './types';
import { fileToBase64} from './common';

import { 
  type CreateBlogPost, 
  type APIErrorResponse, 
  type CreateBlogPostSuccessResponse,
  type BlogPost
} from './types';

export async function uploadToS3(
  filename: string,
  file: File
): Promise<DefaultResponse | APIErrorResponse> {
  
  try {
    const base64Data = await fileToBase64(file, true);
    const payload = {
      file: base64Data,
      filename: filename,
      contentType: file.type,
    };

    const response = await fetch(apiEndpoints.uploadToS3, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Image upload failed with status ${response.status}`);
    }

    const successData: DefaultResponse = await response.json();
    return successData;

  } catch (error) {
    console.error("Error uploading image:", error);
    return {error: (error as Error).message, status: 'error'} as APIErrorResponse;
  }
}

export async function createBlog(
  postData: CreateBlogPost
): Promise<CreateBlogPostSuccessResponse | APIErrorResponse> {
  try {
    const response = await fetch(apiEndpoints.createPost, {
      method: "POST",
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const successData: CreateBlogPostSuccessResponse = await response.json();
    return successData;

  } catch (error) {
    console.error("Error creating blog post:", error);
    return {error: (error as Error).message, status: 'error'} as APIErrorResponse;
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

export function getBlogbyId(
  id: string
): Promise<BlogPost | APIErrorResponse> {
  return fetch(apiEndpoints.getPostById(id), { method: "GET"})
    .then((res) => res.json())
    .then((data) => {
      if (data && data.post) {
        return data.post as BlogPost;
      } else {
        throw new Error("Invalid response format: 'post' not found");
      }
    })
    .catch((error) => {
      console.error("Error fetching blog by ID:", error);
      return Promise.reject({ error: "Failed to fetch blog by ID" });
    });
}