
'use client'

import { Title } from "@/app/ui/user/general/general";
import ProductForm from "@/app/ui/user/admin/product/create/ProductForm";
import VariantForms from "@/app/ui/user/admin/product/create/VariantForms";
import { useRef } from "react";
import { useAdminCreateProductContext } from "@/context/AdminContexts/AdminCreateProductContext";

export default function Forms() {
    const formProductRef = useRef<HTMLFormElement>(null);
    const formVariantRef = useRef<HTMLFormElement[]>([]);
    const { handleSubmitProduct, isUploading } = useAdminCreateProductContext();
    function onSave() {
        const productFormData = new FormData(formProductRef.current!);
        const variantFormsData = formVariantRef.current
            .map((formRef) => {
                return new FormData(formRef)
            })
        handleSubmitProduct(productFormData, variantFormsData);
    }
    
    return (
        <>
            <Title additionalCSS="flex justify-between items-center sticky -top-2 block z-[9999]">
                <p>Tạo sản phẩm</p>
                <div className="flex gap-3">
                    <button onClick={() => window.history.back()} className="fontA4 px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Hủy</button>
                    <button disabled={isUploading} onClick={onSave} className="fontA4 px-3 py-2 rounded-md bg-orange-500 hover:bg-orange-400 text-white">{!isUploading ? "Lưu" : "Đang lưu..."}</button>
                </div>
            </Title>
            <div className={`AdminProductPage flex flex-col gap-3`}>
                <ProductForm ref={formProductRef} />
                <VariantForms formRefs={formVariantRef} />
            </div>
        </>
    )
}