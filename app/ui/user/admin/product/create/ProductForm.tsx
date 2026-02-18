'use client'
import { Divider } from "@/app/ui/cart/General";
import { sectionCSS } from "../../../general/general";
import Input, { TextArea, InputField, InputSelect, TypeInputSelect } from "@/app/ui/general/Input/Input";
import Image from "next/image";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { useState, forwardRef, useEffect, useRef } from "react";
import { useAdminCreateProductContext } from "@/context/AdminContexts/AdminCreateProductContext";
import BasicLoadingSkeleton from "@/app/ui/general/skeletons/LoadingSkeleton";
import { ProductFormErrors } from "./Forms";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { formatVND } from "../../promotion/PromotionForm";


interface ProductFormProps {
    errors?: ProductFormErrors;
}


const ProductForm = forwardRef<HTMLFormElement, ProductFormProps>(({ errors = {} }, ref) => {

    return (
        <form ref={ref} className="grid grid-cols-[60%_1fr] gap-3">
            <LeftForm errors={errors} />
            <RightForm errors={errors} />
        </form>
    );
});
    
export default ProductForm;
function LeftForm({ errors }: { errors: ProductFormErrors }) {
    const [priceInput, setPriceInput] = useState<number>(0);

    return (
        <div className={`${sectionCSS} flex flex-col gap-2`}>
            <p className="fontA3">Thông tin cơ bản</p>
            <Divider />
            <InputField label="Tên sản phẩm"
                required={true}
                id="productName"
                placeholder="Nhập tên sản phẩm"
                error={errors.productName}
            />
            {/* <InputField label="Giá sản phẩm"
                required={true}
                id="productPrice"
                type="number"
                min={0}
                placeholder="Nhập giá sản phẩm"
                error={errors.productPrice}
            /> */}

            <InputField label="Giá sản phẩm"
                required={true}
                id="productPrice"
                type="text"
                min={0}
                placeholder="Nhập giá sản phẩm"
                value={Number(priceInput).toLocaleString('vi-VN')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { formatVND(e.target.value, setPriceInput) }}
                error={errors.productPrice}
            />

            <div className="w-full flex-1">
                <TextArea
                    label="Mô tả"
                    bonusCSS="w-full h-full"
                    required={true}
                    id="productDescription"
                    placeholder="Nhập mô tả cho sản phẩm"
                    error={errors.productDescription} />
            </div>
        </div>
    )
}

function RightForm({ errors }: { errors: ProductFormErrors }) {
    const { categoryList, supplierList } = useAdminCreateProductContext();
    const [categoryItemsList, setCategoryItemsList] = useState<TypeInputSelect[]>([]);
    const [supplierItemsList, setSupplierItemsList] = useState<TypeInputSelect[]>([]);

    useEffect(() => {
        setCategoryItemsList(categoryList.filter((item) => item.parent_id !== null).map((item) => ({ label: item.name, content: item.id })));
    }, [categoryList])
    useEffect(() => {
        setSupplierItemsList(supplierList.map((item) => ({ label: item.name, content: item.id })))
    }, [supplierList])
    const getFirstImageError = (
        errors?: {
            main?: string;
            sub1?: string;
            sub2?: string;
            sub3?: string;
        }
    ): string | undefined => {
        if (!errors) return undefined;

        return errors.main ?? errors.sub1 ?? errors.sub2 ?? errors.sub3 ?? undefined;
    };
    return (
        <div className={`${sectionCSS} flex flex-col gap-2`}>
            <p className="fontA3">Chi tiết sản phẩm</p>
            <Divider />
            {supplierItemsList.length > 0 ? (
                <InputSelect
                    label="Nhà cung cấp sản phẩm"
                    required={true}
                    id="productSupplier"
                    bonusCSS="block w-full px-4 py-2 rounded-md border-1 border-gray-300"
                    items={[{ label: "Chọn nhà cung cấp", content: "" }, ...supplierItemsList]}
                    error={errors.productSupplier}
                />
            ) : (<BasicLoadingSkeleton />)}
            {categoryItemsList.length > 0 ? (

                <InputSelect
                    label="Danh mục sản phẩm"
                    required={true}
                    id="productCategory"
                    bonusCSS="block w-full px-4 py-2 rounded-md border-1 border-gray-300"
                    items={[{ label: "Chọn danh mục", "content": "" }, ...categoryItemsList]}
                    error={errors.productCategory}
                />) : (<BasicLoadingSkeleton />)}

            <p className="fontA3 mt-3">Ảnh sản phẩm</p>
            <Divider />
            <div className="grid gap-2">
                <InputImage type="main" id="main" error={errors.productImages?.main} />
                <div className="grid grid-cols-3 gap-2">
                    <InputImage type="sub" id="sub1" error={errors.productImages?.sub1} />
                    <InputImage type="sub" id="sub2" error={errors.productImages?.sub2} />
                    <InputImage type="sub" id="sub3" error={errors.productImages?.sub3} />
                </div>
            </div>
        </div>
    )
}

function InputImage({ type, id, error }: { type: string, id: string, error?: string }) {
    const iconSize = type === "main" ? 48 : 24;
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { setNotification } = useNotificateArea();
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSize) {
            setNotification('Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn!');
            e.target.value = "";
            setPreviewImage(null);
            return;
        }

        setPreviewImageHelper(file, setPreviewImage); // Cập nhật preview
    }
    const inputRef = useRef<HTMLInputElement>(null);
    function removeImage(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.stopPropagation();
        e.preventDefault();
        setPreviewImage(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setNotification("Đã xóa ảnh sản phẩm chính")
    }
    return (
        <>
            <label htmlFor={`productImage-${id}`}>
                <div className="preview relative overflow-hidden w-full aspect-[16/9] flex flex-col gap-1 items-center justify-center rounded-md border-2 border-gray-200 bg-stone-50 hover:bg-stone-100">
                    {previewImage ? (
                        <>
                            <Image src={previewImage} fill alt="preview" className="hover:opacity-80 object-cover" />
                            <button onClick={removeImage}
                                type="button"
                                className={`absolute ${type === 'main' ? " top-3 right-5" : 'top-1 right-2'} p-1 rounded-xl bg-gray-900 bg-opacity-50 hover:shadow-white hover:shadow-2xl opacity-75 hover:opacity-90`}>
                                <Image className="" src="/icon/trash-x-filled-white.svg" width={iconSize / 1.5} height={iconSize / 1.5} alt="change" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Image src="/icon/camera-up.svg" width={iconSize} height={iconSize} alt="preview" />
                            {type === "main" ? (
                                <p className="fontA5 text-center">Hình ảnh chính (bắt buộc)
                                    <br />Tối đa 5MB</p>
                            ) : (
                                <p className="fontA6">Hình ảnh phụ</p>
                            )}
                        </>
                    )}

                </div>
                <input
                    ref={inputRef}
                    type="file"
                    id={`productImage-${id}`}
                    name={`productImage-${id}`}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" />

            </label>
            {error ? (
                <p className="fontA5 text-red-500">{error}</p>
            ) : null}
        </>
    );
}