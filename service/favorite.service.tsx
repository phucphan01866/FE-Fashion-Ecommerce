const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import track from '@/utils/track';
import Cookies from 'js-cookie';

export interface AddFavoriteResponse {
    message: string; // "Product added to favorites successfully"
    favorite: {
        id: string;
        user_id: string;
        product_id: string;
        created_at: string; // ISO date
    };
}

export interface FavoriteItem {
    seq: number;
    product_id: string;
    name: string;
    description: string | null;
    price: number;
    sale_percent: number;
    is_flash_sale: boolean;
    final_price: number | null;
    supplier_id: string | null;
    supplier_name: string | null;
    images: Array<{ url: string }>;
}

interface SupplierGroup {
    supplier_name: string;        // "Others" nếu null
    supplier_id: string | null;
    items: FavoriteItem[];
}

export interface FavoriteProductsLists {
    success: true;
    // grouped: SupplierGroup[];
    items: FavoriteItem[];
    nextCursor: number | null;
}

export const favoriteService = {
    async addFavorite(productId: string): Promise<AddFavoriteResponse> {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });
        if (!response.ok) {
            throw new Error('Thêm sản phẩm yêu thích thất bại');
        }
        track('add_to_favorites', { productId });
        const data: AddFavoriteResponse = await response.json();
        return data;
    },
    async removeFavorite(productId: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/favorites/${encodeURI(productId)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });
        if (!response.ok) {
            throw new Error('Xóa sản phẩm yêu thích thất bại');
        }
        track('remove_from_favorites', { productId });
        const data = await response.json();
        return data.success; //true false = done or fail
    },
    async getListIdsFavorite() {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/favorites/productIds`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Lấy danh sách id sản phẩm yêu thích thất bại');
        }
        const data = await response.json();
        return data.product_ids;
    },
    async getListFavorite(cursor: number = 0, page: number = 1, limit: number = 20): Promise<FavoriteProductsLists> {
        const token = Cookies.get('accessToken');
        const url = new URL(`${API_URL}/user/favorites/list`);
        if (cursor !== 0) {
            url.searchParams.append('cursor', cursor.toString());
        }
        url.searchParams.append('page', page.toString());
        url.searchParams.append('limit', limit.toString());
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Lấy danh sách id sản phẩm yêu thích thất bại');
        }
        const data = await response.json();
        // console.log("raw data: ", data)
        return data;
    }
}