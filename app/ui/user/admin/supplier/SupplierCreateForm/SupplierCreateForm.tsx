'use client'

import Image from "next/image";
import { useState } from "react";
import Input, { InputField } from "@/app/ui/general/Input/Input";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import { sectionCSS, Divider } from "../../../general/general";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { useAdminSupplierContext } from "@/context/AdminContexts/AdminSupplierContext";
import { createSupplier } from "@/service/supplier.service";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { th } from "framer-motion/client";

export default function SupplierCreateForm() {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const { fetchSuppliers, supplierList } = useAdminSupplierContext();
    const { setNotification } = useNotificateArea();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        const formRef = e.currentTarget;

        const formData = new FormData(e.currentTarget);

        const brandNameValue = formData.get('brandName');
        const brandPhoneValue = formData.get('brandPhone');
        const brandMailValue = formData.get('brandMail');
        const brandLogoValue = formData.get('brandLogo');

        try {
            const name = typeof brandNameValue === 'string' ? brandNameValue.trim() : '';
            if (name.length === 0) {
                throw new Error("Tên nhà cung cấp không được để trống.");
            } else if (supplierList.some(sup => sup.name.toLowerCase() === name.toLowerCase())) {
                throw new Error("Tên nhà cung cấp đã tồn tại. Vui lòng chọn tên khác.");
            }
            const phone = typeof brandPhoneValue === 'string' ? String(brandPhoneValue) : '';
            if (phone.length > 0 && !/^\+?[0-9\s\-()]{7,15}$/.test(phone)) {
                throw new Error("Số điện thoại không hợp lệ.");
            } else if (phone.length === 0) {
                throw new Error("Số điện thoại không được để trống.");
            }
            const contact_email = typeof brandMailValue === 'string' ? brandMailValue.trim() : '';
            if (contact_email.length === 0) {
                throw new Error("Địa chỉ email không được để trống.");
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
                throw new Error("Địa chỉ email không hợp lệ.");
            }
            let logo_url: string = "";
            if (brandLogoValue instanceof File && brandLogoValue.size > 0) {
                const folder = `suppliers/${name}/logo`;
                const uploaded = await uploadToCloudinary(brandLogoValue, folder);
                logo_url = uploaded.imageUrl;
            }

            formRef.reset();
            setPreviewImage(null);

            const inputData = {
                id: "-1",
                name,
                contact_email,
                phone,
                logo_url,
            }
            const result = await createSupplier(inputData);
            await fetchSuppliers();
            setIsUploading(false);
            setNotification(result || "Thêm nhà cung cấp thành công");
        } catch (error) {
            if (error instanceof Error) {
                setNotification(error.message || "Đã có lỗi xảy ra khi thêm nhà cung cấp.");
            }
        } finally {
            setIsUploading(false);
        }

    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewImageHelper(file, setPreviewImage);
    }

    return (
        <div className={`BrandForm flex flex-col gap-4 ${sectionCSS}`}>
            <p className="fontA3">Thêm nhà cung cấp mới</p>
            <Divider />
            <form onSubmit={handleSubmit} className="relative grid gap-2">
                <InputField id="brandName" placeholder="Nhập tên" label="Tên nhà cung cấp" />
                <InputField
                    id="brandPhone"
                    placeholder="Nhập số điện thoại"
                    label="Số điện thoại"
                    type="tel" />
                <InputField
                    id="brandMail"
                    label="E-mail nhà cung cấp"
                    placeholder="Nhập địa chỉ mail"
                    type="email" />
                {/* <div className="flex flex-col ">
                    <label
                        htmlFor="brandLogo"
                        className="block fontA4">Logo của thương hiệu</label>
                    <input
                        type="file"
                        id="brandLogo"
                        name="brandLogo"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden" />
                </div> */}
                <InputField
                    id="brandLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    wrapperBonusCSS="hidden"
                />
                <label htmlFor="brandLogo" className="relative w-full flex max-h-[200px]">
                    {previewImage ? (
                        <Image
                            src={previewImage}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="object-cover w-full h-auto rounded-md hover:opacity-80" />
                    ) : (
                        <div className="w-full aspect-[16/9] flex flex-col gap-3 justify-center items-center rounded-md border-2 border-gray-200 bg-stone-50 hover:bg-stone-100">
                            <Image
                                src={'/icon/camera-up.svg'}
                                alt="Preview"
                                width={64}
                                height={64}
                                className="object-cover rounded-md" />
                            <p className="fontA4">Tải logo của nhà cung cấp</p>
                        </div>
                    )}
                </label>
                <button
                    disabled={isUploading}
                    className={`px-4 py-2 w-full bg-orange-500 hover:bg-orange-600 ${isUploading && "bg-amber-600"} text-white rounded-md`}>{isUploading ? "Đang thêm..." : "Thêm nhà cung cấp"}</button>
            </form>
        </div>
    )
}