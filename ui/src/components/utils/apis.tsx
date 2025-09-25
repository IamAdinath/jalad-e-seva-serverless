

import { apiEndpoints } from './constants';
import type { DefaultResponse, UploadToS3Response } from './types';

import { 
  type CreateBlogPost, 
  type APIErrorResponse, 
  type CreateBlogPostSuccessResponse,
  type BlogPost
} from './types';

export async function uploadToS3(
  filename: string,
  file: File
): Promise<UploadToS3Response | APIErrorResponse> {
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    formData.append('fileType', file.type);

    const response = await fetch(apiEndpoints.uploadToS3, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `File upload failed with status ${response.status}`);
    }

    const successData: UploadToS3Response = await response.json();
    return successData;

  } catch (error) {
    console.error("Error uploading file:", error);
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


export async function getBlogsbyCategory(
  category: string
): Promise<BlogPost[] | APIErrorResponse> {
  try {
    const res = await fetch(apiEndpoints.getBlogsbyCategory(category), { method: "GET" });
    const data = await res.json();
    
      if (data && Array.isArray(data.blogs)) {
        return data.blogs as BlogPost[];
      } else {
        throw new Error("Invalid response format: 'blogs' not found");
      }
  } catch (error) {
      console.error("Error fetching blogs by category:", error);
    return { error: "Failed to fetch blogs by category" } as APIErrorResponse;
  }
}

export async function getBlogbyId(
  id: string
): Promise<BlogPost | APIErrorResponse> {
  try {
    const res = await fetch(apiEndpoints.getPostById(id), { method: "GET" });
    const data = await res.json();
    
      if (data && data.post) {
        return data.post as BlogPost;
      } else {
        throw new Error("Invalid response format: 'post' not found");
      }
  } catch (error) {
      console.error("Error fetching blog by ID:", error);
    return { error: "Failed to fetch blog by ID" } as APIErrorResponse;
  }
}