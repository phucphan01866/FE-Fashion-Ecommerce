'use client';

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import publicService, { FetchProductsResponse } from "@/service/public.service";
import { TypeProduct } from "@/service/product.service";
import { useNotificateArea } from "./NotificateAreaContext";

interface HomeProductPageContextType {
    items: TypeProduct[];
    firstLoad: boolean;
    loading: boolean;
    hasMore: boolean;
    nextCursor: number | null;
    loadMore: () => Promise<void>;
    refetch: () => Promise<void>; // dùng khi muốn reload lại từ đầu (ví dụ đổi filter)
    updateFilter: (filterName: string, filterValue: string | null) => void;
    q: string;
    category_id: string;
    supplier_id: string;
    min_price?: number;
    max_price?: number;
    is_flash_sale: boolean;
    order: 'asc' | 'desc' | string;
}

const HomeProductPageContext = createContext<HomeProductPageContextType | undefined>(undefined);

export function HomeProductPageProvider({ children }: { children: React.ReactNode }) {
    const { setNotification } = useNotificateArea();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [items, setItems] = useState<TypeProduct[]>([]);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [nextCursor, setNextCursor] = useState<number | null>(null);

    // Đọc query params từ URL
    const q = searchParams.get('q') || '';
    const category_id = searchParams.get('category_id') || '';
    const supplier_id = searchParams.get('supplier_id') || '';
    const min_price = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
    const max_price = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
    const is_flash_sale = searchParams.get('is_flash_sale') === 'true';
    const limit = 20; // Số item mỗi lần fetch
    const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc';
    // Cursor chỉ dùng khi load more, lần đầu không lấy từ URL (để backend tự xử lý max/min)
    // const urlCursor = searchParams.get('cursor') ? Number(searchParams.get('cursor')) : null;

    const fetchProducts = useCallback(async (isLoadMore = false) => {
        setLoading(true);
        try {
            const response: FetchProductsResponse = await publicService.fetchProducts({
                filter: {
                    q: q || undefined,
                    category_id: category_id || undefined,
                    supplier_id: supplier_id || undefined,
                    min_price,
                    max_price,
                    is_flash_sale: is_flash_sale ? true : undefined,
                },
                cursor: isLoadMore ? nextCursor : null, // lần đầu là null, lần sau truyền vào cursor lấy về từ lần đầu
                limit,
                order,
            });

            if (isLoadMore) {
                setItems(prev => [...prev, ...response.items]);
            } else {
                setItems(response.items);
            }
            setNextCursor(response.nextCursor);
            setHasMore(response.hasMore);
        } catch (error) {
            console.error("Fetch products error:", error);
            setNotification(
                error instanceof Error ? error.message : "Không thể tải sản phẩm. Vui lòng thử lại!"
            );
            setHasMore(false);
        } finally {
            setFirstLoad(false);
            setLoading(false);
        }
    }, [
        q, category_id, supplier_id, min_price, max_price, is_flash_sale,
        limit, order, nextCursor, loading, router, searchParams, setNotification
    ]);



    const loadMore = useCallback(async () => {
        if (!hasMore || loading) return;
        await fetchProducts(true);
    }, [hasMore, loading, fetchProducts]);


    // update filter và cập nhật URL
    const updateFilter = useCallback((
        filterName: string, filterValue: string | null
    ) => {
        const newParams = new URLSearchParams(searchParams.toString());

        if (filterName === 'order') {
            const [sort_by, order] = [filterValue?.split('_')[0] || 'date', filterValue?.split('_')[1] || 'desc'];
            newParams.set('sort_by', sort_by);
            newParams.set('order', order);

        } else if (filterValue === null) {
            newParams.delete(filterName);
        } else {
            newParams.set(filterName, filterValue);
        }

        router.replace(`?${newParams.toString()}`, { scroll: false });
    }, [searchParams, router]);

    // Khi filter thay đổi, reset danh sách và fetch lại
    useEffect(() => {
        setItems([]);
        setNextCursor(null);
        setHasMore(true);
        fetchProducts(false);
    }, [
        q, category_id, supplier_id, min_price, max_price, is_flash_sale, limit, order
    ]);


    // Hàm reload lại từ đầu (dùng khi cần)
    const refetch = useCallback(async () => {
        setItems([]);
        setNextCursor(null);
        setHasMore(true);
        await fetchProducts(false);
    }, [fetchProducts]);

    const value = {
        items,
        loading,
        hasMore,
        nextCursor,
        loadMore,
        refetch,
        updateFilter,
        q,
        category_id,
        supplier_id,
        min_price,
        max_price,
        is_flash_sale,
        order,
        firstLoad,
    };

    return (
        <HomeProductPageContext.Provider value={value}>
            {children}
        </HomeProductPageContext.Provider>
    );
}

export const useHomeProductPage = () => {
    const context = useContext(HomeProductPageContext);
    if (!context) {
        throw new Error('useHomeProductPage must be used within HomeProductPageProvider');
    }
    return context;
};