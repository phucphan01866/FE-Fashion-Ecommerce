const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import Cookies from 'js-cookie';

export interface TypeCategory {
    id: string;
    name: string;
    parent_id: string | null;
    image: string | null;
}

export async function getCategories(): Promise<TypeCategory[]> {
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error(`Failed to fetch categories : ${response.statusText}`);
        }
        const data = await response.json();
        return data.categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}

export interface TypeCategoryPayload {
    name: string;
    parent_id: string | null;
    image: string | null;
}

export async function createCategory(payload: TypeCategoryPayload){
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: payload.name,
                parent_id: payload.parent_id,
                image: payload.image
            }),
        })
        if (!response.ok) {
            throw new Error(`Failed to create category : ${response.statusText}`);
        }
        const data = await response.json();
        return data?.category ?? data;
    } catch (error) {
        console.error('Error create categories:', error);
        throw error;
    }
}

export async function updateCategory(id: string, payload: TypeCategoryPayload): Promise<TypeCategory> {
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: payload.name,
                parent_id: payload.parent_id,
                image: payload.image
            }),
        })
        if (!response.ok) {
            throw new Error(`Failed to update category : ${response.statusText}`);
        }
        const data = await response.json();
        return data?.category ?? data;
    } catch (error) {
        console.error('Error update categories:', error);
        throw error;
    }
}

export async function deleteCategory(id: string, cascade: boolean): Promise<TypeCategory | null> {
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/categories/${encodeURIComponent(id)}${cascade ? '?cascade=true' : ''}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        const res = await response.json();

        if (res.status === 400) throw new Error("Phân loại bạn muốn xóa vẫn còn phân loại con");
        return res.message;
    } catch (error) {
        console.error('Error delete categories:', error);
        throw error;
    }
}
