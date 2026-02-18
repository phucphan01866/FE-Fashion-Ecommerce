'use client'

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { TypeCategory, getCategories } from "@/service/category.service";
import { AdminCategoryProvider, useAdminCategoryContext } from "./AdminCategoryContext";
import { TypeSupplier, getSuppliers } from "@/service/supplier.service";
import { AdminSupplierProvider, useAdminSupplierContext } from "./AdminSupplierContext";
import { TypeProduct, getProducts, AdminSearchProductParams, getProductsNew } from "@/service/product.service";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface AdminProductContextType {
    categoryList: TypeCategory[];
    supplierList: TypeSupplier[];
    productList: TypeProduct[];
    fetchProducts: () => void;
    nextPage: number;
    setNextPage: (page: number) => void;
}

const AdminProductContext = createContext<AdminProductContextType | undefined>(undefined);

export function AdminProductProvider({ children }: { children: React.ReactNode }) {
    const categoryList = useAdminCategoryContext().categoryList;
    const supplierList = useAdminSupplierContext().supplierList;
    const [productList, setProductList] = useState<TypeProduct[]>([]);
    const [nextPage, setNextPage] = useState<number>(1);
    // async function fetchProducts() {
    //     try {
    //         console.log("currentpage: ", nextPage);
    //         if (nextPage === -1) return; // nếu đã hết sản phẩm thì không fetch nữa
    //         const res = await getProducts(nextPage);
    //         const hasMoreProd = res.hasMore;
    //         const list = res.products;
    //         const newList = [...productList, ...list];
    //         setProductList(newList);
    //         if (hasMoreProd) {
    //             setNextPage(nextPage + 1);
    //         } else {
    //             setNextPage(-1); // nếu hết sản phẩm thì đặt trang hiện tại là -1
    //         }
    //     } catch (error: any) {
    //         console.error(`Không thể fetch products, lỗi : ${error.message}`);
    //     }
    // }

    async function fetchProducts() {
        try {
            console.log("currentpage: ", nextPage);
            if (nextPage === -1) return; // nếu đã hết sản phẩm thì không fetch nữa
            const res = await getProducts(nextPage);
            const res2 = await getProductsNew({ limit: 10 });
            const hasMoreProd = res.hasMore;
            const list = res.products;
            const newList = [...productList, ...list];
            setProductList(newList);
            if (hasMoreProd) {
                setNextPage(nextPage + 1);
            } else {
                setNextPage(-1); // nếu hết sản phẩm thì đặt trang hiện tại là -1
            }
        } catch (error: any) {
            console.error(`Không thể fetch products, lỗi : ${error.message}`);
        }
    }

    useEffect(() => {
        let isMounted = true;
        fetchProducts();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AdminProductContext.Provider value={{
            categoryList,
            supplierList,
            productList,
            fetchProducts,
            nextPage,
            setNextPage,
        }}>
            {children}
        </AdminProductContext.Provider>
    );
}

export const useAdminProductContext = () => {
    const context = useContext(AdminProductContext);
    if (!context) {
        throw new Error('useAdminProductContext must be used within AdminProductProvider');
    }
    return context;
};