export interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string;
    tags: string;
    image_alternate_text: string;
    product_category_id: number | null;
    product_category_name: string;
    author: string;
    publish_date: string;
    seo_title: string;
    seo_metadata: string;
}

export interface BlogsResponse {
    totalPages: number;
    data: Blog[];
    total_pages: number;
    current_page: number;
    page_size: number;
}


export interface BlogComment {
    name: string;
    email: string;
    website: string;
    comment: string;
    created_at: string; // e.g., "Wednesday, 16 April 2025, 03:47PM"
  }
  
  export interface BlogCommentsResponse {
    message: string;
    total_pages: number;
    current_page: number;
    page_size: number;
    total_comments: number;
    blog_comments: BlogComment[];
  }
  