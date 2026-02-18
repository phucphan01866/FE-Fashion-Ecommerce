'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useAdminCategoryContext } from "./AdminCategoryContext";
import { TypeCategory, getCategories } from "@/service/category.service";

interface AdminEditCategoryContextType {
    selectedCategory: TypeCategory,
    setSelectedCategory: (category: TypeCategory) => void,
    isEditing: boolean,
    setIsEditing: (input: boolean) => void,
}

const AdminEditCategoryContext = createContext<AdminEditCategoryContextType | undefined>(undefined);
export function AdminEditCategoryProvider({ children }: { children: React.ReactNode }) {
    const { categoryList } = useAdminCategoryContext();
    const [selectedCategory, setSelectedCategory] = useState<TypeCategory>(categoryList[0]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    return (<AdminEditCategoryContext.Provider value={{ selectedCategory, setSelectedCategory, isEditing, setIsEditing }}>
        {children}
    </AdminEditCategoryContext.Provider>);
}

export const useAdminEditCategoryContext = () => {
    const context = useContext(AdminEditCategoryContext);
    if (!context) {
        throw new Error('useAdminEditCategoryContext must be used within AdminEditCategoryProvider');
    }
    return context;
};