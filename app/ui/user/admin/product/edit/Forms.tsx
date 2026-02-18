'use client'

import { Title } from "@/app/ui/user/general/general";
import ProductForm from "@/app/ui/user/admin/product/edit/ProductForm";
import VariantForms from "@/app/ui/user/admin/product/edit/VariantForms";
import { useRef, useState } from "react";
import { useAdminUpdateProductContext } from "@/context/AdminContexts/AdminUpdateProductContext";
import { TypeProductPayload } from "@/service/product.service";
import { TypeVariantPayload } from "@/service/variant.service";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import { useNotificateArea } from "@/context/NotificateAreaContext";

export interface ProductFormErrors {
    productName?: string;
    productPrice?: string;
    productDescription?: string;
    productCategory?: string;
    productSupplier?: string;
    productImages?: {
        main?: string;
        sub1?: string;
        sub2?: string;
        sub3?: string;
    };
}

export interface VariantFormErrors {
    id: number;
    sizes?: string;
    stock?: string;
    colorName?: string;
    colorCode?: string;
    images?: {
        main?: string;
        sub1?: string;
        sub2?: string;
        sub3?: string;
    };
}

export default function Forms() {
    const { setNotification } = useNotificateArea();
    const { isUploading, onSave } = useAdminUpdateProductContext();
    const [productFormErrors, setProductFormErrors] = useState<ProductFormErrors>();
    const [variantsFormErrors, setVariantsFormErrors] = useState<VariantFormErrors[]>();

    return (
        <>
            <Title additionalCSS="flex justify-between items-center sticky -top-2 block z-[9999]">
                <p>Cập nhật sản phẩm</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="fontA4 px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                        disabled={isUploading}
                    >
                        Hủy
                    </button>
                    <button
                        disabled={isUploading}
                        onClick={onSave}
                        className="fontA4 px-3 py-2 rounded-md bg-orange-500 hover:bg-orange-400 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {!isUploading ? "Lưu" : "Đang lưu..."}
                    </button>
                </div>
            </Title>

            <fieldset
                disabled={isUploading}
                className={`AdminProductPage flex flex-col gap-3 ${isUploading ? 'opacity-60' : ''}`}
            >
                <ProductForm errors={productFormErrors} />
                <VariantForms errors={variantsFormErrors} />
            </fieldset>
        </>
    )
}