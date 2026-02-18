const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import Cookies from 'js-cookie';

export interface ReviewCreateInput {
    variant_id: string;
    rating: 1 | 2 | 3 | 4 | 5 | number;
    comment?: string;
    images?: string[];
}

export interface ReviewUpdateInput {
    rating: 1 | 2 | 3 | 4 | 5 | number;
    comment?: string;
    images?: string[];
}


export interface ReviewResponse {
    id: string;
    order_id: string;
    variant_id: string;
    rating: number;
    comment: string | null;
    images: string[] | null;
    created_at: string;
}

export interface ReviewFromListForProduct {
    product_name: string;
    review_id: string;
    user_id: string;
    rating: number;                    // 1-5
    comment: string | null;
    images: string[];                  // luôn là mảng (có thể rỗng [])
    created_at: string;                // ISO string
}

export interface GetReviewsByProductResponse {
    success: boolean;
    product_id: string;
    reviews: ReviewFromListForProduct[];
    total: number;
    page: number;
    limit: number;
}

const ReviewService = {
    // 1. POST /orders/:orderId/reviews – Thêm đánh giá
    async addReviews(orderId: string, reviews: ReviewCreateInput[]) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/orders/${orderId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reviews }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Network error' }));
            throw new Error(error.message || error.error || 'Thêm đánh giá thất bại');
        }

        return response.json(); // { message, inserted, reviews: [...] }
    },

    // 2. GET /reviews/:id – Lấy chi tiết 1 review
    async getReviewById(reviewId: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/reviews/${reviewId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Không tìm thấy đánh giá');
        }

        const result = await response.json();
        console.log('rs: ', result);
        return result.review as ReviewResponse & {
            user?: { name: string; avatar?: string };
            product?: { name: string; slug: string; thumbnail?: string };
        };
    },

    // 3. PATCH /reviews/:id – Sửa đánh giá
    async updateReview(
        reviewId: string,
        data: { rating?: 1 | 2 | 3 | 4 | 5 | number; comment?: string; images?: string[] }
    ) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/reviews/${reviewId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Cập nhật thất bại' }));
            throw new Error(error.message || 'Cập nhật đánh giá thất bại');
        }

        return response.json(); // { message, review }
    },

    // 4. DELETE /reviews/:id – Xóa đánh giá
    async deleteReview(reviewId: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Xóa đánh giá thất bại');
        }

        return response.json(); // { message, deleted_id }
    },

    // router.get('/reviews/:productId', publicController.listReviewsByProductId);
    async getReviewByProdID(productId: string, option?: { page?: number; limit?: number }) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/public/reviews/${encodeURI(productId)}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Lấy đánh giá thất bại');
        }
        const data = await response.json();
        return data;
    },

    // router.get('/reviews/check', requireUser, orderController.checkReviewed);
    async checkUserReviewed(variantId: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/reviews/check?variantId=${encodeURI(variantId)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Kiểm tra trạng thái đánh giá thất bại');
        }
        const data = await response.json();
        return data;
    }
};

export default ReviewService;