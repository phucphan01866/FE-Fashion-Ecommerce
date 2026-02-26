const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import { get } from 'http';
import Cookies from 'js-cookie';
import { TypeProduct } from './product.service';

export interface FetchProductsResponse {
    items: any[];
    nextCursor: number | null;
    hasMore: boolean;
    perPage: number;
}

const HomeService = {
    async fetchHomeProducts() {
        const response1 = await fetch(`${API_URL}/public/home-products`, {
            method: 'GET',
        })
        const result1 = await response1.json();

        // const response2 = await fetch(`${API_URL}/public/products`, {
        //     method: 'GET',
        // })
        // const result2 = await response2.json();

        const response3 = await fetch(`${API_URL}/public/categories-with-products`, {
            method: 'GET',
        })
        const result3 = await response3.json();
        // const processedCategories = result3.categories.map((category: any) => ({
        //     ...category,
        //     children: category.children.map((child: any) => ({
        //         ...child,
        //         products: child.products.map((product: any) => ({
        //             ...product,
        //             product_images: product.product_images.map((img: { url: string }) => img.url),
        //             variants: product.variants.map((variant: any) => ({
        //                 ...variant,
        //                 product_images: variant.images.map((img: { url: string }) => img.url),
        //             })),
        //         })),
        //     })),
        // }));
        // console.log("r1 ", result1);
        // console.log("pre-r3:, " ,result3);
        // console.log("r3 ", processedCategories);
        const result = { flashSales: result1.flashSales, newest: result1.newest, categories: result3.categories };
        // console.log("resule :", result);
        return result;

    },
    async fetchTopBrands() {
        const response = await fetch(`${API_URL}/public/top-brands`, {
            method: 'GET',
        })
        if (!response.ok) {
            throw new Error('Lỗi khi lấy top brands');
        }
        const result = await response.json();
        console.log("tops: ",result);
        return result;
    },
    async fetchMetaData() {
        const response = await fetch(`${API_URL}/public/home-meta`, {
            method: 'GET',
        })
        if (!response.ok) {
            throw new Error('Lỗi khi lấy metadata trang chủ');
        }
        const result = await response.json();
        // console.log("Meta data:");
        // console.table(result);
        return result;
    },

    // router.get('/products', publicController.getProductsSimple); // lấy sp hiển thị ở trang home
    async fetchProducts({
        filter = {},
        cursor = null,
        limit = 15,
        sort_by,
    }: {
        filter?: {
            q?: string;
            category_id?: string;
            supplier_id?: string;
            min_price?: number;
            max_price?: number;
            is_flash_sale?: boolean;
        };
        cursor?: number | null;
        sort_by?: string;
        limit?: number;
        order?: 'asc' | 'desc' | string | undefined;
    } = {}): Promise<FetchProductsResponse> {
        const params = new URLSearchParams();
        if (sort_by) params.append('sort_by', sort_by);

        if (cursor !== null) {
            params.append('cursor', cursor.toString());
        }

        if (filter.q) params.append('q', filter.q);
        if (filter.category_id) params.append('category_id', filter.category_id);
        if (filter.supplier_id) params.append('supplier_id', filter.supplier_id);
        if (filter.min_price !== undefined) params.append('min_price', filter.min_price.toString());
        if (filter.max_price !== undefined) params.append('max_price', filter.max_price.toString());
        if (filter.is_flash_sale !== undefined) {
            params.append('is_flash_sale', filter.is_flash_sale ? 'true' : 'false');
        }
        if (limit) {
            params.append('limit', limit.toString());
        }

        // const response = await fetch(`https://your-domain.com/public/products?${params.toString()}`);
        // console.log(`URL called: ${API_URL}/public/products?${params.toString()}`)
        const response = await fetch(`${API_URL}/public/products?${params.toString()}`, {
            method: 'GET',
        })
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        const data = await response.json();
        return {
            items: data.items || [],
            nextCursor: data.nextCursor ?? null,
            hasMore: data.hasMore ?? false,
            perPage: data.perPage,
        };
    },
    // products/detail/:variantId
    async getProductByVariantId(variantId: string): Promise<TypeProduct> {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/products/${encodeURI(variantId)}`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch product by variant ID');
        }
        const data = await response.json();
        return data as TypeProduct;
    }
}
export default HomeService;