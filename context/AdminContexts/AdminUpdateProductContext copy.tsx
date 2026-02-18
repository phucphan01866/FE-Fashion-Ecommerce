'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TypeCategory } from "@/service/category.service";
import { useAdminCategoryContext } from "./AdminCategoryContext";
import { TypeSupplier } from "@/service/supplier.service";
import { useAdminSupplierContext } from "./AdminSupplierContext";
import { TypeProduct, TypeProductPayload, getProduct, updateProduct } from "@/service/product.service";
import { TypeVariantPayload } from "@/service/variant.service";
import { useNotificateArea } from "../NotificateAreaContext";

export interface updateVariantIndex {
    index: number;
    usingOldVariant: boolean;
}

interface AdminUpdateProductContextType {
    categoryList: TypeCategory[];
    supplierList: TypeSupplier[];
    oldProductInputs: TypeProductPayload;
    oldVariantsInput: TypeVariantPayload[];
    submit: (data: TypeProductPayload) => Promise<void>;
    variantsIndex: updateVariantIndex[];
    addVariantsIndex: () => void;
    removeVariantsIndex: (indexToRemove: number) => void;
    isUploading: boolean;
}

const AdminUpdateProductContext = createContext<AdminUpdateProductContextType | undefined>(undefined);

export function AdminUpdateProductProvider({ children }: { children: React.ReactNode }) {
    const categoryList = useAdminCategoryContext().categoryList;
    const supplierList = useAdminSupplierContext().supplierList;
    const { setNotification } = useNotificateArea();

    const [oldProductInputs, setOldProductInputs] = useState<TypeProductPayload>(baseProductPayloadConstructor());
    const [oldVariantsInput, setOldVariantsInput] = useState<TypeVariantPayload[]>([]);
    const [variantsIndex, setVariantsIndex] = useState<updateVariantIndex[]>([{ index: 0, usingOldVariant: false }]);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const params = useParams();
    const id = params?.id as string;

    useEffect(() => {
        if (!id) {
            setNotification("ID không hợp lệ");
            return;
        }
        (async () => {
            try {
                const oldProduct = await getProduct(id);
                const oldVariants = oldProduct.variants;
                setOldProductInputs(oldProduct);
                setOldVariantsInput(oldVariants);
                setVariantsIndex(oldVariants.map((variant, index) => ({
                    index,
                    usingOldVariant: true
                })));
            } catch (err) {
                setNotification(`Xảy ra lỗi khi tải sản phẩm: ${err}`);
            }
        })();
    }, [id]);

    function addVariantsIndex() {
        const lastIndex = variantsIndex[variantsIndex.length - 1].index;
        setVariantsIndex(prev => [...prev, { index: lastIndex + 1, usingOldVariant: false }]);
        setNotification("Thêm chủng loại hoàn tất");
    }

    function removeVariantsIndex(indexToRemove: number) {
        if (variantsIndex.length === 1) {
            setNotification("Số chủng loại không được thấp hơn 1!");
            return;
        }
        setVariantsIndex(variantsIndex.filter(item => item.index !== indexToRemove));
        setNotification("Xóa chủng loại hoàn tất");
    }

    function baseProductPayloadConstructor(): TypeProductPayload {
        return {
            name: "",
            description: "",
            category_id: "",
            supplier_id: "",
            price: 0,
            sale_percent: 0,
            is_flash_sale: false,
            images: [],
            variants: [],
        };
    }

    // // Submit function - validation will be handled in Forms.tsx
    // async function handleSubmitProduct(prodFormData: FormData, varFormData: FormData[]) {
    //     try {
    //         setIsUploading(true);

    //         const productPayload: TypeProductPayload = {
    //             name: prodFormData.get("productName")?.toString() || oldProductInputs.name,
    //             description: prodFormData.get("productDescription")?.toString() || oldProductInputs.description,
    //             category_id: prodFormData.get("productCategory")?.toString() || oldProductInputs.category_id,
    //             supplier_id: prodFormData.get("productSupplier")?.toString() || oldProductInputs.supplier_id,
    //             price: Number(prodFormData.get("productPrice")) || oldProductInputs.price,
    //             sale_percent: oldProductInputs.sale_percent || 0,
    //             is_flash_sale: oldProductInputs.is_flash_sale || false,
    //             images: [],
    //             variants: [],
    //         };

    //         const result = await updateProduct(id, productPayload);
    //         setNotification(result);
    //         window.history.back();
    //     } catch (err) {
    //         setNotification(`Lỗi khi cập nhật sản phẩm: ${err}`);
    //         throw err;
    //     } finally {
    //         setIsUploading(false);
    //     }
    // }

    async function submit(data: TypeProductPayload) {
        // setIsUploading(true);
        const result = await updateProduct(id, data);
        setIsUploading(false);
        window.history.back();
    }

    return (
        <AdminUpdateProductContext.Provider value={{
            categoryList,
            supplierList,
            oldProductInputs,
            oldVariantsInput,
            submit,
            variantsIndex,
            addVariantsIndex,
            removeVariantsIndex,
            isUploading,
        }}>
            {children}
        </AdminUpdateProductContext.Provider>
    );
}

export const useAdminUpdateProductContext = () => {
    const context = useContext(AdminUpdateProductContext);
    if (!context) {
        throw new Error('useAdminUpdateProductContext must be used within AdminUpdateProductProvider');
    }
    return context;
};