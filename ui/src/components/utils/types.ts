
export interface CreateBlogPost {
    title: string;
    htmlContent: string;
    contentSummary: string;
    image: File | string; // File or URL
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

