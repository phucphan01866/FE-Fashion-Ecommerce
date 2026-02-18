'use client'

import { createContext, useContext, useState } from "react";
import { TypeCategory } from "@/service/category.service";
import { useAdminCategoryContext } from "./AdminCategoryContext";
import { TypeSupplier } from "@/service/supplier.service";
import { useAdminSupplierContext } from "./AdminSupplierContext";
import { TypeProductPayload, createProduct } from "@/service/product.service";
import { TypeVariantPayload } from "@/service/variant.service";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import { useNotificateArea } from "../NotificateAreaContext";

interface AdminCreateProductContextType {
    categoryList: TypeCategory[];
    supplierList: TypeSupplier[];
    submit: (data: TypeProductPayload) => void,
    isUploading: boolean,
    setIsUploading: (input: boolean) => void,
    variantsIndex: number[],
    addVariantsIndex: () => void,
    removeVariantsIndex: (indexToRemove: number) => void,
}

const AdminCreateProductContext = createContext<AdminCreateProductContextType | undefined>(undefined);

export function AdminCreateProductProvider({ children }: { children: React.ReactNode }) {
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const { setNotification } = useNotificateArea();
    const categoryList = useAdminCategoryContext().categoryList;
    const supplierList = useAdminSupplierContext().supplierList;

    const [variantsIndex, setVariantsIndex] = useState<number[]>([0]);

    function addVariantsIndex() {
        setVariantsIndex(prev => [...prev, variantsIndex[variantsIndex.length - 1] + 1]);
        setNotification("Thêm chủng loại hoàn tất");
    }
    function removeVariantsIndex(indexToRemove: number) {
        if (variantsIndex.length === 1) {
            setNotification("Số chủng loại không được thấp hơn 1!");
            return;
        }
        setVariantsIndex(variantsIndex.filter(index => index !== indexToRemove));
        setNotification("Xóa chủng loại hoàn tất");
    }

    async function submit(data: TypeProductPayload) {
        // setIsUploading(true);
        setNotification(await createProduct(data));
        setIsUploading(false);
        window.history.back();
    }

    return (
        <AdminCreateProductContext.Provider value={{
            categoryList,
            supplierList,
            submit,
            variantsIndex,
            addVariantsIndex,
            removeVariantsIndex,
            isUploading,
            setIsUploading,
        }}>
            {children}
        </AdminCreateProductContext.Provider>
    );
}

export const useAdminCreateProductContext = () => {
    const context = useContext(AdminCreateProductContext);
    if (!context) {
        throw new Error('useAdminCreateProductContext must be used within AdminCreateProductProvider');
    }
    return context;
};