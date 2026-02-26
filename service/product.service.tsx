const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import { TypeVariantPayload } from "@/service/variant.service"
import Cookies from 'js-cookie';

import { TypeFetchVariantPayload, TypeVariant } from './variant.service';

export interface TypeProductPayload {
    name: string;
    description: string;
    category_id: string;
    supplier_id: string;
    price: number;
    sale_percent: number; //Mặc định là 0
    is_flash_sale: boolean; //Mặc định là false
    images?: string[];
    variants: TypeVariantPayload[];
    product_images?: { url: string }[];
    product_images_files?: Map<number, File>;
}

export interface TypeProduct extends TypeProductPayload {
    id: string;
    final_price: number;
    variants: TypeVariant[];
    category_name: string;
    supplier_name: string;
    status?: string;
    image: string;
}

export interface productImage {
    url: string;
}

export interface TypeSearchProduct {
    search_key?: string,
    category_id?: string,
    supplier_id?: string,
}

export interface AdminSearchProductParams {
    limit?: number,
    cursor?: string,
    order?: 'asc' | 'desc' | string,
    search_key?: string,
    category_id?: string,
    supplier_id?: string,
    min_price?: number,
    max_price?: number,
    flash_sale?: boolean,
    status?: 'active' | 'inactive' | string,
}

export async function getProducts(
    {
        limit,
        cursor,
        order = 'asc',
        search_key = '',
        category_id = '',
        supplier_id = '',
        min_price,
        max_price,
        flash_sale,
        status,
    }: {
        limit?: number,
        cursor?: string,
        order?: 'asc' | 'desc' | string,
        search_key?: string,
        category_id?: string,
        supplier_id?: string,
        min_price?: number,
        max_price?: number,
        flash_sale?: boolean,
        status?: 'active' | 'inactive' | string,
    }
): Promise<{ hasMore: boolean, products: TypeProduct[], nextCursor: string | null }> {

    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (order) params.append('order', order);
    if (search_key) params.append('search_key', search_key);
    if (category_id) params.append('category_id', category_id);
    if (supplier_id) params.append('supplier_id', supplier_id);
    if (min_price !== undefined) params.append('min_price', min_price.toString());
    if (max_price !== undefined) params.append('max_price', max_price.toString());
    if (flash_sale !== undefined) params.append('flash_sale', flash_sale.toString());
    if (status) params.append('status', status);

    const url = `${API_URL}/admin/products?${params.toString()}`;
    // console.log('fetching: ', url);

    const token = Cookies.get('accessToken');
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`,
            }
        })
        const result = await res.json();
        console.log('data ', result);
        const data = result?.products || [];
        return data;
    } catch (error) {
        throw error;
    }

}

export async function getProduct(id: string): Promise<TypeProduct> {
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/products/${encodeURI(id)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        const data = await response.json();
        const products1: TypeProduct = { ...data, images: data.product_images.map((item: { url: string }) => { return item.url }) };

        const products2: TypeProduct = {
            ...products1,
            variants: data.variants.map((variant: TypeFetchVariantPayload) => {
                return {
                    ...variant, images: variant.images.map((item: { url: string }) => {
                        return item.url;
                    })
                }
            })
        }
        // console.table(products2);
        return products2;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

export async function createProduct(payload: TypeProductPayload) {
    // console.log
    try {
        const token = Cookies.get('accessToken');
        console.log(payload);
        const body = JSON.stringify({
            name: payload.name,
            description: payload.description,
            category_id: payload.category_id,
            supplier_id: payload.supplier_id,
            price: payload.price,
            sale_percent: payload.sale_percent, //Mặc định là 0
            is_flash_sale: payload.is_flash_sale, //Mặc định là false
            images: payload.images,
            variants: payload.variants,
        });
        console.log('data prod gửi đi: ', payload);
        const response = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body,
        })
        if (!response.ok) {
            // throw new Error(`Failed to create product : ${response.statusText}`);
            return `Lỗi: ${response.statusText}`;
        }
        const data = await response.json();
        console.log("data nhận lại: ", data);
        return "Thêm sản phẩm thành công";
    } catch (error) {
        console.error('Error create product:', error);
        return `Lỗi: ${error}`;
    }
}

export async function updateProduct(id: string, payload: TypeProductPayload) {
    const token = Cookies.get('accessToken');
    const body = JSON.stringify({
        name: payload.name,
        description: payload.description,
        category_id: payload.category_id,
        supplier_id: payload.supplier_id,
        price: payload.price,
        sale_percent: payload.sale_percent,
        is_flash_sale: payload.is_flash_sale,
        images: payload.images,
        variants: payload.variants,
    })
    // console.log("body");
    // console.log(body);
    // console.log(`${API_URL}/admin/products/${encodeURIComponent(id)}`);
    const response = await fetch(`${API_URL}/admin/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body,
    })
    console.log(response)
    if (!response.ok) {
        // throw new Error(`Failed to create product : ${response.statusText}`);
        return `Lỗi: ${response.statusText}`;
    }
    return "Cập nhật sản phẩm thành công";
}

export async function removeProduct(id: string) {
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/products/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${errorText}`)
        }
        // const data = await response.json();
        // console.log(data);
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Lỗi không xác định');
    }
}

// router.patch('/products/:id/status', requireAdmin, adminProductController.updateProductStatus);
export async function updateProductStatus(id: string, status: 'active' | 'inactive') {
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/products/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        })
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${errorText}`)
        }
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Lỗi không xác định');
    }
}

export async function updateSaleOffStatus(id: string, sale_percent: number, is_flash_sale: boolean) {
    try {
        if (sale_percent == 0) return (`Vui lòng nhập % khuyến mãi`);
        const body = {
            sale_percent,
            is_flash_sale
        }
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/products/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })
        if (response.ok) {
            return (`Cập nhật khuyến mãi thành công!`);

        } else {
            const errorText = await response.text();
            return (`Lỗi: ${response.status} - ${errorText}`)
        }

    } catch (error) {
        console.error('Lỗi trong lúc cập nhật khuyến mãi:', error);
        return (`Lỗi trong lúc cập nhật khuyến mãi: ${error}`);
    }
}

export async function searchProducts(inputParams: TypeSearchProduct): Promise<TypeProduct[]> {

    const params = new URLSearchParams();
    if (inputParams.search_key) params.append('search_key', inputParams.search_key);
    if (inputParams.category_id) params.append('category_id', inputParams.category_id);
    if (inputParams.supplier_id) params.append('supplier_id', inputParams.supplier_id);
    const endPoint = `${API_URL}/admin/promotions/products?${params.toString()}`;

    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${endPoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        console.log(`${endPoint}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: 'Search failed'
            }))
            throw new Error(errorData.error || `Lỗi tìm kiếm: ${response.statusText}`);
        }
        const res = await response.json();
        return res.products;
    } catch (err) {
        throw err;
    }
}

export const productService = {
    user: {
        async getProducts() {

        },
        async getHomeProducts() {

        },
        async getProduct(id: string) {
            try {
                const response = await fetch(`${API_URL}/public/products/${encodeURI(id)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                if (!response.ok) { throw new Error(`Failed to fetch product : ${response.statusText}`); }
                const data = await response.json();
                const products1: TypeProduct = { ...data, images: data.product_images.map((item: { url: string }) => { return item.url }) };

                const products2: TypeProduct = {
                    ...products1,
                    variants: data.variants.map((variant: any) => {
                        return {
                            ...variant, images: variant.images.map((item: { url: string }) => {
                                return item.url;
                            })
                        }
                    })
                }
                // console.log('fetchedproduct:');
                // console.table(products2);
                // console.table(products2.variants);
                return products2;
            } catch (error) {
                console.error('Error fetching products:', error);
                throw error;
            }
        },
        async getProductFromVariant(variantId: string) {
            try {
                const response = await fetch(`${API_URL}/user/products/detail/${encodeURI(variantId)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                if (!response.ok) { throw new Error(`${response.statusText}`); }
                const data = await response.json();
                // console.log(data);
                return data;
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
                throw error;
            }
        }
    }
}