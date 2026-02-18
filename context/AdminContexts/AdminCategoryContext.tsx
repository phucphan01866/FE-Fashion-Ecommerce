'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { TypeCategory, getCategories } from "@/service/category.service";

interface AdminCategoryContextType {
    categoryList: TypeCategory[];
    fetchCategories: () => void;
}

const AdminCategoryContext = createContext<AdminCategoryContextType | undefined>(undefined);

export function AdminCategoryProvider({ children }: { children: React.ReactNode }) {
    const [categoryList, setCategoryList] = useState<TypeCategory[]>([]);
    async function fetchCategories() {
        try {
            const res = await getCategories();
            setCategoryList(res);
        } catch (error: any) {
            console.error(`Không thể fetch categories, lỗi : ${error.message}`);
        }
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            await fetchCategories();
            // console.log("Được gọi từ admincategorycontext!");
        })();
        return () => { mounted = false };
    }, [])
    return (<AdminCategoryContext.Provider value={{ categoryList, fetchCategories }}>
        {children}
    </AdminCategoryContext.Provider>);
}

export const useAdminCategoryContext = () => {
    const context = useContext(AdminCategoryContext);
    if (!context) {
        throw new Error('useAdminCategoryContext must be used within AdminCategoryProvider');
    }
    return context;
};