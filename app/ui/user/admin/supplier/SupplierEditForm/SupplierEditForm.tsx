'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { InputField } from "@/app/ui/general/Input/Input";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import { sectionCSS, Divider } from "../../../general/general";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { useAdminSupplierContext } from "@/context/AdminContexts/AdminSupplierContext";
import { editSupplier } from "@/service/supplier.service";
import { useNotificateArea } from "@/context/NotificateAreaContext";

export default function SupplierEditForm() {
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const { fetchSuppliers, selectedSupplier, setIsEditing } = useAdminSupplierContext();
    const [previewImage, setPreviewImage] = useState<string | null>(selectedSupplier?.logo_url ?? "");
    const { setNotification } = useNotificateArea();
    const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        const formRef = e.currentTarget;

        const formData = new FormData(e.currentTarget);

        const brandNameValue = formData.get('brandName');
        const brandPhoneValue = formData.get('brandPhone');
        const brandMailValue = formData.get('brandMail');
        const brandLogoValue = formData.get('brandLogo');
        const name = typeof brandNameValue === 'string' ? brandNameValue.trim() : '';
        const phone = typeof brandPhoneValue === 'string' ? String(brandPhoneValue) : '';
        const contact_email = typeof brandMailValue === 'string' ? brandMailValue.trim() : '';

        let logo_url: string = "";
        if (selectedSupplier?.logo_url !== undefined) logo_url = selectedSupplier.logo_url;
        if (brandLogoValue instanceof File && brandLogoValue.size > 0) {
            const folder = `suppliers/${name}/logo`;
            const uploaded = await uploadToCloudinary(brandLogoValue, folder);
            logo_url = uploaded.imageUrl;
        }

        formRef.reset();
        setPreviewImage(null);

        const inputData = {
            id: selectedSupplier?.id ?? "-1",
            name,
            contact_email,
            phone,
            logo_url,
        }

        console.log("Input data for editing supplier:", inputData);
        const result = await editSupplier(inputData);
        await fetchSuppliers();
        setIsUploading(false);
        setNotification(result);
        setIsEditing(false);
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewImageHelper(file, setPreviewImage);
    }

    function turnBack() {
        setIsEditing(false);
    }
    useEffect(() => {
        setPreviewImage(selectedSupplier?.logo_url || null);
    }, [selectedSupplier]);
    return (
        <div key={selectedSupplier?.id} className={`BrandForm flex flex-col gap-4 ${sectionCSS}`}>
            <div className="flex gap-3 items-center">
                <button className="p-1 hover:bg-gray-100 rounded-full" onClick={turnBack}>
                    <Image src="/icon/arrow-left.svg" width={18} height={18} alt="Quay về" />
                </button>
                <p>Cập nhật nhà cung cấp</p>
            </div>
            <Divider />
            <form onSubmit={handleSubmitEdit} className="relative grid gap-2">
                <InputField
                    id="brandName"
                    placeholder="Nhập tên"
                    label="Tên nhà cung cấp"
                    defaultValue={selectedSupplier?.name} />
                <InputField
                    id="brandPhone"
                    placeholder="Nhập số điện thoại"
                    label="Số điện thoại"
                    type="tel"
                    defaultValue={selectedSupplier?.phone} />
                <InputField
                    id="brandMail"
                    label="E-mail nhà cung cấp"
                    placeholder="Nhập địa chỉ mail"
                    type="email"
                    defaultValue={selectedSupplier?.contact_email} />
                <InputField
                    id="brandLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    wrapperBonusCSS="hidden!" />
                <label htmlFor="brandLogo" className="w-full flex max-h-[160px]">
                    {previewImage ? (
                        <Image
                            src={previewImage}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="object-cover w-full h-auto rounded-md hover:opacity-80" />
                    ) : selectedSupplier?.logo_url ? (
                        <div className="w-full aspect-[16/9] flex flex-col gap-3 justify-center items-center rounded-md border-2 border-gray-200 bg-stone-50 hover:bg-stone-100">
                            <Image
                                src={selectedSupplier.logo_url}
                                alt="Preview"
                                width={64}
                                height={64}
                                className="object-cover rounded-md" />
                        </div>
                    ) : <div className="w-full aspect-[16/9] flex flex-col gap-3 justify-center items-center rounded-md border-2 border-gray-200 bg-stone-50 hover:bg-stone-100">
                        <Image
                            src={'/icon/camera-up.svg'}
                            alt="Preview"
                            width={64}
                            height={64}
                            className="object-cover rounded-md" />
                        <p className="fontA4">Tải logo của nhà cung cấp</p>
                    </div>}
                </label>
                <button
                    // disabled={isUploading}
                    type="submit"
                    className={`px-4 py-2 w-full bg-orange-500 hover:bg-orange-600 ${isUploading && "bg-amber-600"} text-white rounded-md`}>{isUploading ? "Đang cập nhật..." : "Cập nhật nhà cung cấp"}</button>
            </form>
        </div>
    )
}