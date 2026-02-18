import { useAdminCategoryContext } from "@/context/AdminContexts/AdminCategoryContext";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { createCategory } from "@/service/category.service";
import { useState } from "react";
import { sectionCSS, Divider } from "@/app/ui/user/general/general";
import { InputField, InputSelect } from "@/app/ui/general/Input/Input";
import Image from "next/image";
import { useNotificateArea } from "@/context/NotificateAreaContext";


export default function CategoryCreateFormArea() {
    const { setNotification } = useNotificateArea();
    const { categoryList, fetchCategories } = useAdminCategoryContext();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // ✅ Ngăn form submit mặc định
        setIsUploading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const nameValue = formData.get('categoryName');
        const parentValue = formData.get('parentCategory');
        const imageValue = formData.get('categoryImage');
        let image: string | null = null;
        // alert(parentValue);
        const name = typeof nameValue === 'string' ? nameValue.trim() : '';
        const parent_id = typeof parentValue === 'string' && parentValue !== '0' ? parentValue.trim() : null;

        if (imageValue instanceof File && imageValue.size > 0) {
            const folder = `categories/${name}/banner`;
            image = (await uploadToCloudinary(imageValue, folder)).imageUrl;
        }

        form.reset();
        setPreviewImage(null);

        const payload = {
            name,
            parent_id,
            image,
        }
        await createCategory(payload);
        await fetchCategories();
        setIsUploading(false);
        setNotification("Thêm phân loại thành công!");
    }

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file !== undefined) setPreviewImageHelper(file, setPreviewImage);
        else setNotification("Lỗi không load được ảnh !");
    }

    return (
        <div className={`CategoryForm flex flex-col gap-4 ${sectionCSS}`}>
            <p className="fontA3">Tạo danh mục mới</p>
            <Divider />
            <form onSubmit={handleSubmit} className="relative grid gap-4">
                <InputField label="Tên danh mục" id="categoryName" type="text" placeholder="VD: Áo Sơ Mi" />
                <InputSelect id="parentCategory" label="Danh mục cha" items={[{ label: "-- Không có danh mục cha --", content: "0" }, ...categoryList.filter(cat=>cat.parent_id===null).map(cat => ({ label: cat.name, content: cat.id }))]} />
                <input
                    type="file"
                    id="categoryImage"
                    name="categoryImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" />
                <label htmlFor="categoryImage" className="w-full flex max-h-[160px]">
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
                            <p className="fontA4">Tải hình ảnh lên</p>
                        </div>
                    )}
                </label>
                <button disabled={isUploading} type="submit" className={`px-4 py-2 w-full bg-orange-500 ${isUploading ? "bg-orange-600" : "hover:bg-orange-600"} hover:cursor-pointer text-white rounded-md`}>
                    {!isUploading ? "Tạo danh mục" : "Đang tạo..."}
                </button>
            </form>
        </div>
    )
}