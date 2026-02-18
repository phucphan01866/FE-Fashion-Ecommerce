'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { TypeCategory } from "@/service/category.service";
import { TypeSupplier } from "@/service/supplier.service";
import { TypeProduct, getProducts, AdminSearchProductParams, removeProduct, updateProductStatus } from "@/service/product.service";
import { useAdminCategoryContext } from "./AdminCategoryContext";
import { useAdminSupplierContext } from "./AdminSupplierContext";
import { useDebounce } from "@/hooks";
import { useNotificateArea } from "../NotificateAreaContext";


interface AdminProductContextType {
    categoryList: TypeCategory[];
    supplierList: TypeSupplier[];
    productList: TypeProduct[];
    isLoading: boolean;
    hasMore: boolean;
    filters: AdminSearchProductParams;
    loadMore: () => void;
    refresh: () => void;
    updateFilters: (filters: Partial<AdminSearchProductParams>) => void;
    resetFilters: () => void;
    deleteProduct: (id: string) => Promise<void>;
    restoreProduct: (id: string) => Promise<void>;
}

const AdminProductContext = createContext<AdminProductContextType | undefined>(undefined);

export function AdminProductProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { categoryList } = useAdminCategoryContext();
    const { supplierList } = useAdminSupplierContext();

    const [productList, setProductList] = useState<TypeProduct[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const setnoti = useNotificateArea().setNotification;

    // Đọc filter từ URL
    const getFiltersFromUrl = (): AdminSearchProductParams => {
        const params = searchParams;

        return {
            search_key: params.get("search_key") || undefined,
            category_id: params.get("category_id") || undefined,
            supplier_id: params.get("supplier_id") || undefined,
            min_price: params.get("min_price") ? Number(params.get("min_price")) : undefined,
            max_price: params.get("max_price") ? Number(params.get("max_price")) : undefined,
            flash_sale:
                params.get("flash_sale") === "true" ? true :
                    params.get("flash_sale") === "false" ? false : undefined,
            status: params.get("status") || undefined,
            order: (params.get("order") as "asc" | "desc") || undefined,
            // limit: Number(params.get("limit") || 15),
        };
    };

    const [filters, setFilters] = useState<AdminSearchProductParams>(getFiltersFromUrl());

    const updateUrl = (newFilters: AdminSearchProductParams) => {
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.set(key, String(value));
            }
        });
        params.delete("cursor");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const updateFilters = (newFilters: Partial<AdminSearchProductParams>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        updateUrl(updated);
    };

    // Không dùng nữa
    const resetFilters = () => {
        const defaultFilters: AdminSearchProductParams = {
            limit: 5,
            order: "asc",
        };
        setFilters(defaultFilters);
        router.replace(pathname, { scroll: false });
    };

    const loadProducts = async (loadCursor: string | null = null) => {
        if (isLoading) return; // chống gọi nhiều lần
        setIsLoading(true);

        try {
            const res = await getProducts({
                ...filters,
                cursor: loadCursor || undefined,
                limit: (filters.limit),
            });

            if (loadCursor === null) {
                setProductList(res.products);
            } else {
                setProductList(prev => [...prev, ...res.products]);
            }

            setCursor(res.nextCursor);
            setHasMore(res.hasMore);
        } catch (error: any) {
            console.error("Lỗi lấy danh sách sản phẩm:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = () => {
        if (!isLoading && hasMore && cursor) {
            loadProducts(cursor);
        }
    };

    // không dùng nữa
    const refresh = () => {
        setCursor(null);
        loadProducts(null);
    };

    const debouncedLoadProducts = useDebounce(loadProducts, 300);
    useEffect(() => {
        if (!searchParams || searchParams.size === 0) setFilters(getFiltersFromUrl());
        debouncedLoadProducts(null);
    }, [searchParams]);

    async function deleteProduct(id: string) {
        try {
            await removeProduct(id);
            setProductList(prev => prev.filter(product => product.id !== id));
            setnoti("Xóa sản phẩm thành công!");
        } catch (error) {
            if (error instanceof Error) {
                setnoti(error.message);
            }
        }
    }

    async function restoreProduct(id: string) {
        try {
            await updateProductStatus(id, 'active');
            setProductList(prev => prev.filter(product => product.id !== id));
            setnoti("Cập nhật sản phẩm thành công!");
        } catch (error) {
            if (error instanceof Error) {
                setnoti(error.message);
            }
        }
    }


    return (
        <AdminProductContext.Provider value={{
            categoryList,
            supplierList,
            productList,
            isLoading,
            hasMore,
            filters,
            loadMore,
            refresh,
            updateFilters,
            resetFilters,
            deleteProduct,
            restoreProduct,
        }}>
            {children}
        </AdminProductContext.Provider>
    );
}

export const useAdminProductContext = (): AdminProductContextType => {
    const context = useContext(AdminProductContext);
    if (!context) {
        throw new Error('useAdminProductContext must be used within AdminProductProvider');
    }
    return context;
};