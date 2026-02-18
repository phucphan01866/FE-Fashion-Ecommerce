const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import track from '@/utils/track';
import Cookies from 'js-cookie';

export interface CreateNewsRequest {
    title: string;                    // bắt buộc, tối đa ~255 ký tự (DB)
    content_blocks: Array<TextBlock | ImageBlock>;  // bắt buộc, phải là mảng lẻ
    image?: string | null;            // optional: URL ảnh bìa chính, nếu không có sẽ tự lấy ảnh đầu tiên
}

export type TextBlock = { type: 'text'; text: string };
export type ImageBlock = {
    type: 'image';
    urls: Array<string | { url: string; position?: number }>;
};

export interface NewsResponse {
    id: string;
    title: string;
    image: string | null;
    content_blocks: NormalizedContentBlock[];
    created_at: string;
    updated_at: string;
}
export type NormalizedContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image'; urls: Array<{ url: string; position: number }> };

export interface UpdateNewsRequest {
    title?: string;
    content_blocks?: Array<TextBlock | ImageBlock>;  // nếu gửi thì phải thỏa quy tắc như create
    image?: string | null;        // nếu để null sẽ xóa ảnh bìa
}

export interface NewsPreviewData {
    created_at: string;
    id: string;
    preview_text: string;
    preview_image: string;
    title: string;
}

export const newsService = {
    admin: {
        // Tạo news
        async createNews(payload: CreateNewsRequest): Promise<{ success: boolean, news: NewsResponse }> {
            const token = Cookies.get('accessToken');
            // console.log('Payload tạo news:', payload);
            const response = await fetch(`${API_URL}/admin/news`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error('Tạo tin tức thất bại');
            }
            const data: { success: boolean, news: NewsResponse } = await response.json();
            // console.log('Kết quả tạo news:', data);
            return data;
        },
        // Lấy về danh sách news (trang quản lý)
        async getNewsList(page?: number, limit?: number):
            Promise<{ success: boolean; items: NewsResponse[]; page: number, perPage: number }> {
            const token = Cookies.get('accessToken');
            const params = new URLSearchParams();
            if (page) params.append('page', page.toString());
            if (limit) params.append('limit', limit.toString());
            const response = await fetch(`${API_URL}/admin/news?${encodeURI(params.toString())}`, {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Lấy tin tức thất bại');
            }
            const data: { success: boolean; items: NewsResponse[]; page: number, perPage: number } = await response.json();
            console.log('Lấy danh sách news:', data);
            return data;
        },
        // Lấy về chi tiết news (update)
        async getNews(id: string):
            Promise<NewsResponse> {
            const token = Cookies.get('accessToken');
            const response = await fetch(`${API_URL}/admin/news/${encodeURI(id)}`, {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Lấy tin tức thất bại');
            }
            const data = await response.json();
            return data.news;
        },
        // Cập nhật news
        async updateNews(payload: UpdateNewsRequest, id: string):
            Promise<{ success: boolean; news: NewsResponse[]; }> {
            const token = Cookies.get('accessToken');
            const response = await fetch(`${API_URL}/admin/news/${encodeURI(id)}`, {
                method: 'PUT',
                headers: {
                    'authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error('Cập nhật tin tức thất bại');
            }
            const data: { success: boolean; news: NewsResponse[]; } = await response.json();
            return data;
        },
        // Xóa news
        async deleteNews(id: string):
            Promise<{ success: boolean; }> {
            const token = Cookies.get('accessToken');
            const response = await fetch(`${API_URL}/admin/news/${encodeURI(id)}`, {
                method: 'DELETE',
                headers: {
                    'authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Xóa tin tức thất bại');
            }
            const data: { success: boolean; } = await response.json();
            return data;
        }
    },
    user: {
        async getNewsList(page?: number, limit?: number, q?: string) {
            const response = await fetch(`${API_URL}/public/news`, {
                method: 'GET'
            });
            if (!response.ok) { 
                throw new Error('Lấy danh sách tin tức thất bại');
            }
            const data = await response.json();
            console.log('news ,', data);
            return data;
        },
        async getNewsById(newsId: string): Promise<NewsResponse> {
            const response = await fetch(`${API_URL}/public/news/${encodeURI(newsId)}`, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error('Đọc tin tức thất bại');
            }
            const data = await response.json();
            track('view_news_article', { newsId });
            // console.log('News detail data:', data);
            return data.news;
        }
    },
}