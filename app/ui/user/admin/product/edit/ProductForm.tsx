'use client'
import { Divider } from "@/app/ui/cart/General";
import { sectionCSS } from "../../../general/general";
import { TextArea, InputField, InputSelect, TypeInputSelect, ControllableInputSelect } from "@/app/ui/general/Input/Input";
import Image from "next/image";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { useState, forwardRef, useEffect } from "react";
import { useAdminUpdateProductContext } from "@/context/AdminContexts/AdminUpdateProductContext";
import { TypeProductPayload } from "@/service/product.service";
import BasicLoadingSkeleton from "@/app/ui/general/skeletons/LoadingSkeleton";
import { ProductFormErrors } from "./Forms";
import { useNotificateArea } from "@/context/NotificateAreaContext";

interface ProductFormProps {
    errors?: ProductFormErrors;
}

function ProductForm(
    { errors = {} }: ProductFormProps,
) {
    const { productPayload, updateProductPayload } = useAdminUpdateProductContext();

    return (
        <form className="grid grid-cols-[60%_1fr] gap-3">
            <LeftForm productPayload={productPayload} errors={errors} updateProductPayload={updateProductPayload} />
            <RightForm productPayload={productPayload} errors={errors} updateProductPayload={updateProductPayload} />
        </form>
    );

}

export default ProductForm;

function LeftForm({ errors, productPayload, updateProductPayload }: { errors: ProductFormErrors, productPayload: TypeProductPayload, updateProductPayload: (input: Partial<TypeProductPayload>) => void }) {
    function onPriceChange(input: React.ChangeEvent<HTMLInputElement>) {
        const rawValue = input.target.value.replace(/[^0-9]/g, '');
        updateProductPayload({ price: Number(rawValue) });
    }
    return (
        <div className={`${sectionCSS} flex flex-col gap-2`}>
            <p className="fontA3">Thông tin cơ bản</p>
            <Divider />

            <InputField
                label="Tên sản phẩm"
                value={productPayload.name}
                onChange={(input: React.ChangeEvent<HTMLInputElement>) => updateProductPayload({ name: input.target.value })}
                required={true}
                id="productName"
                placeholder="Nhập tên sản phẩm"
                error={errors.productName}
            />

            <InputField
                label="Giá sản phẩm"
                required={true}
                id="productPrice"
                type="text"
                min={0}
                value={Number(productPayload.price).toLocaleString('vi-VN') || ''}
                onChange={onPriceChange}
                placeholder={`Nhập giá sản phẩm`}
                error={errors.productPrice}
            />

            <div className="w-full flex-1">
                <TextArea
                    label="Mô tả"
                    value={productPayload.description}
                    onChange={(input: React.ChangeEvent<HTMLTextAreaElement>) => updateProductPayload({ description: input.target.value })}
                    bonusCSS="w-full h-full"
                    required={true}
                    id="productDescription"
                    placeholder="Nhập mô tả cho sản phẩm"
                    error={errors.productDescription}
                />
            </div>
        </div>
    )
}

function RightForm({ errors, productPayload, updateProductPayload }: { errors: ProductFormErrors, productPayload: TypeProductPayload, updateProductPayload: (input: Partial<TypeProductPayload>) => void }) {
    const { categoryList, supplierList } = useAdminUpdateProductContext();
    const [categoryItemsList, setCategoryItemsList] = useState<TypeInputSelect[]>([]);
    const [supplierItemsList, setSupplierItemsList] = useState<TypeInputSelect[]>([]);

    function updateImage(index: number, newImageFile: File | null) {
        const newImagesFiles = productPayload.product_images_files || new Map<number, File>();
        if (newImageFile === null) {
            updateProductPayload({ product_images_files: new Map<number, File>([...newImagesFiles].filter(([i, _]) => i !== index)) });
        } else {
            updateProductPayload({ product_images_files: new Map<number, File>([...newImagesFiles, [index, newImageFile]]) });
        }
    }

    useEffect(() => {
        setCategoryItemsList(
            categoryList
                .filter((item) => item.parent_id !== null)
                .map((item) => ({ label: item.name, content: item.id }))
        );
    }, [categoryList]);

    useEffect(() => {
        setSupplierItemsList(
            supplierList.map((item) => ({ label: item.name, content: item.id }))
        );
    }, [supplierList]);

    return (
        <div className={`${sectionCSS} flex flex-col gap-2`}>
            <p className="fontA3">Chi tiết sản phẩm</p>
            <Divider />

            {supplierItemsList.length > 0 ? (
                <ControllableInputSelect
                    label="Nhà cung cấp sản phẩm"
                    required={true}
                    id="productSupplier"
                    bonusCSS="block w-full px-4 py-2 rounded-md border-1 border-gray-300"
                    items={[{ label: "Chọn nhà cung cấp", content: "" }, ...supplierItemsList]}
                    currentValue={productPayload.supplier_id || ''}
                    onClick={(value: string) => { updateProductPayload({ supplier_id: value }) }}
                    hiddenItems={['']}
                />
            ) : (
                <BasicLoadingSkeleton />
            )}
            {categoryItemsList.length > 0 ? (
                <ControllableInputSelect
                    label="Danh mục sản phẩm"
                    required={true}
                    id="productCategory"
                    bonusCSS="block w-full px-4 py-2 rounded-md border-1 border-gray-300"
                    items={[{ label: "Chọn danh mục", content: "" }, ...categoryItemsList]}
                    currentValue={productPayload.category_id || ''}
                    onClick={(value: string) => { updateProductPayload({ category_id: value }) }}
                    hiddenItems={['']}
                />
            ) : (
                <BasicLoadingSkeleton />
            )}

            {/* <p>Ảnh sản phẩm</p> */}
            <div className="grid gap-2">
                <div>
                    <InputImage
                        type="main"
                        id="main"
                        onChange={(file) => updateImage(0, file)}
                        previewImg={productPayload.images?.[0]}
                    />
                    {errors.productImages?.main && (
                        <p className="text-red-500 text-sm mt-1">{errors.productImages.main}</p>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <InputImage
                            type="sub"
                            id="sub1"
                            onChange={(file) => updateImage(1, file)}
                            previewImg={productPayload.images?.[1]}
                        />
                        {errors.productImages?.sub1 && (
                            <p className="text-red-500 text-xs mt-1">{errors.productImages.sub1}</p>
                        )}
                    </div>

                    <div>
                        <InputImage
                            type="sub"
                            id="sub2"
                            onChange={(file) => updateImage(2, file)}
                            previewImg={productPayload.images?.[2]}
                        />
                        {errors.productImages?.sub2 && (
                            <p className="text-red-500 text-xs mt-1">{errors.productImages.sub2}</p>
                        )}
                    </div>

                    <div>
                        <InputImage
                            type="sub"
                            id="sub3"
                            onChange={(file) => updateImage(3, file)}
                            previewImg={productPayload.images?.[3]}
                        />
                        {errors.productImages?.sub3 && (
                            <p className="text-red-500 text-xs mt-1">{errors.productImages.sub3}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function InputImage({ type, id, previewImg, onChange }: { type: string; id: string; previewImg?: string, onChange?: (file: File | null) => void }) {
    const iconSize = type === "main" ? 48 : 24;
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const setNoti = useNotificateArea().setNotification;
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        let previewImgData: string | undefined;
        if (file && file.size > 5 * 1024 * 1024) {
            e.target.value = "";
            setNoti("Kích thước hình ảnh không được vượt quá 5MB!");
            return;
        }
        if (file != undefined) {
            previewImgData = setPreviewImageHelper(file, setPreviewImage);
        };
        if (onChange) { onChange(file || null); }
    }

    useEffect(() => {
        if (previewImg) {
            setPreviewImage(previewImg);
        }
    }, [previewImg]);

    return (
        <label htmlFor={`productImage-${id}`} className="cursor-pointer">
            <div className="preview relative overflow-hidden w-full aspect-[16/9] flex flex-col gap-1 items-center justify-center rounded-md border-2 border-gray-200 bg-stone-50 hover:bg-stone-100">
                {previewImage ? (
                    <Image src={previewImage} fill alt="preview" className="hover:opacity-80 object-cover" />
                ) : (
                    <>
                        <Image src="/icon/camera-up.svg" width={iconSize} height={iconSize} alt="preview" />
                        {type === "main" ? (
                            <p className="fontA5">Hình ảnh chính</p>
                        ) : (
                            <p className="fontA6">Hình ảnh phụ</p>
                        )}
                    </>
                )}
            </div>
            <input
                type="file"
                id={`productImage-${id}`}
                name={`productImage-${id}`}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
            />
        </label>
    );
}