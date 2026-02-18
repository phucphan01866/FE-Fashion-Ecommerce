'use client'
import { Divider } from "@/app/ui/cart/General";
import { sectionCSS } from "../../../general/general";
import Input, { TextArea, InputField, InputSelect } from "@/app/ui/general/Input/Input";
import Image from "next/image";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { useState, forwardRef } from "react";
import { useAdminCreateProductContext } from "@/context/AdminContexts/AdminCreateProductContext";

const ProductForm = forwardRef<HTMLFormElement, {}>((props, ref) => {
    return (
        <form ref={ref} className="grid grid-cols-[60%_1fr] gap-3">
            <LeftForm />
            <RightForm />
        </form>
    );
});

export default ProductForm;
function LeftForm() {
    return (
        <div className={`${sectionCSS} flex flex-col gap-2`}>
            <p className="fontA3">Thông tin cơ bản</p>
            <Divider />
            {/* <label htmlFor="productName">Tên sản phẩm</label>    */}
            <InputField label="Tên sản phẩm" required={true} id="productName" placeholder="Nhập tên sản phẩm" />
            {/* <label htmlFor="productPrice">Giá sản phẩm</label> */}
            <InputField label="Giá sản phẩm" required={true} id="productPrice" type="number" min={0} placeholder="Nhập giá sản phẩm" />

            <div className="w-full flex-1">
                <TextArea
                    label="Mô tả"
                    bonusCSS="w-full h-full"
                    required={true}
                    id="productDescription"
                    placeholder="Nhập mô tả cho sản phẩm" />
            </div>
        </div>
    )
}

function RightForm() {
    const { categoryList, supplierList } = useAdminCreateProductContext();
    const categoryItemsList: { label: string, content: string }[] = categoryList.filter((item) => item.parent_id !== null).map((item) => ({ label: item.name, content: item.id }));
    const supplierItemsList: { label: string, content: string }[] = supplierList.map((item) => ({ label: item.name, content: item.id }));
    return (
        <div className={`${sectionCSS} flex flex-col gap-2`}>
            <p className="fontA3">Chi tiết sản phẩm</p>
            <Divider />
            <InputSelect
                label="Danh mục sản phẩm"
                required={true}
                id="productCategory"
                name="productCategory"
                bonusCSS="block w-full px-4 py-2 rounded-md border-1 border-gray-300"
                items={categoryItemsList}
            />
            <label htmlFor="productSupplier">Nhà cung cấp sản phẩm</label>
            <select
                required={true}
                id="productSupplier"
                name="productSupplier"
                className="block w-full px-4 py-2 rounded-md border-1 border-gray-300">
                <option value={''}>-- Chọn nhà cung cấp --</option>
                {supplierList.map((supplier, index) => (
                    <option key={supplier.id} value={`${supplier.id}`}>{supplier.name}</option>
                ))}
            </select>
            <p>Ảnh sản phẩm</p>
            <div className="grid gap-2">
                <InputImage type="main" id="main" />
                <div className="grid grid-cols-3 gap-2">
                    <InputImage type="sub" id="sub1" />
                    <InputImage type="sub" id="sub2" />
                    <InputImage type="sub" id="sub3" />
                </div>
            </div>
        </div>
    )
}

function InputImage({ type, id }: { type: string, id: string }) {
    const iconSize = type === "main" ? 48 : 24;
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file != undefined) setPreviewImageHelper(file, setPreviewImage);
    }
    return (
        <label htmlFor={`productImage-${id}`}>
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
                className="hidden" />
        </label>
    );
}