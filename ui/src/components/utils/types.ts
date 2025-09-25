
export interface CreateBlogPost {
    title: string;
    htmlContent: string;
    contentSummary: string;
    imageType: string; 
    startDate: string;
    endDate: string;
    category?: string;
    status?: string;
    publishDate?: string;
    }

export interface CreateBlogPostSuccessResponse {
    status: string;
    message: string;
    id: string;
}

export interface APIErrorResponse {
    status: 'error';
    code: number;
    error: string;
    message?: string;
}

export interface APISuccessResponse<T> {
    status: 'success';
    data: T;
    message?: string;
}
export interface BlogPost {
    id: string;
    title: string;
    summary: string;
    image: string;
    htmlContent?: string; 
    textContent?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
}

export interface DefaultResponse {
    status: string;
    message: string;
}

export interface UploadToS3Response extends DefaultResponse {
    file_url: string;
    filename: string;
}

export interface GetBlogsResponse {
    blogs: BlogPost[];
    count: number;
    has_more: boolean;
    last_evaluated_key?: string;
}