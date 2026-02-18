import { useAdminCategoryContext } from "@/context/AdminContexts/AdminCategoryContext";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { updateCategory } from "@/service/category.service";
import { useState, useEffect } from "react";
import { sectionCSS, Divider } from "@/app/ui/user/general/general";
import { InputField, InputSelect } from "@/app/ui/general/Input/Input";
import Image from "next/image";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useAdminEditCategoryContext } from "@/context/AdminContexts/AdminEditCategoryContext";

export default function CategoryEditFormArea() {
    const { setNotification } = useNotificateArea();
    const { categoryList, fetchCategories } = useAdminCategoryContext();
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const { selectedCategory, setIsEditing } = useAdminEditCategoryContext();
    const [selectedName, setSelectedName] = useState<string>('');
    const [selectedParentName, setSelectedParentName] = useState<string>('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        setSelectedName(selectedCategory.name);
        setSelectedParentName(categoryList.find(cat => cat.id === selectedCategory.parent_id)?.name ?? "-- Không có danh mục cha --");
        setPreviewImage(selectedCategory.image);
        return;
    }, [selectedCategory]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const nameValue = formData.get('categoryName');
        const parentValue = formData.get('parentCategory');
        const imageValue = formData.get('categoryImage');
        let image: string | null = null;
        const name = typeof nameValue === 'string' ? nameValue.trim() : '';
        const parent_id = selectedCategory.parent_id;

        if (imageValue instanceof File && imageValue.size > 0) {
            const folder = `categories/${name}/banner`;
            image = (await uploadToCloudinary(imageValue, folder)).imageUrl;
        } else image = selectedCategory.image;

        form.reset();
        setPreviewImage(null);

        const payload = {
            name,
            parent_id,
            image,
        }
        await updateCategory(selectedCategory.id, payload);
        await fetchCategories();
        setIsUploading(false);
        setIsEditing(false);
        setNotification("Cập nhật phân loại thành công!");
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file !== undefined) setPreviewImageHelper(file, setPreviewImage);
        else setNotification("Lỗi không load được ảnh !");
    }

    function turnBack() {
        setIsEditing(false);
    }

    return (
        <div className={`CategoryForm flex flex-col gap-4 ${sectionCSS}`}>
            <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded-full" onClick={turnBack}>
                    <Image src="/icon/arrow-left.svg" width={18} height={18} alt="Quay về" />
                </button>
                <p className="fontA3">Cập nhật danh mục</p>
            </div>
            <Divider />
            <form onSubmit={handleSubmit} className="relative grid gap-2">
                <InputField id="categoryName" label="Tên danh mục" type="text" placeholder="Tên danh mục" defaultValue={selectedName} />
                <InputSelect key={selectedCategory.id} id="parentCategory" label="Danh mục cha" name="parentCategory" items={[{ label: "-- Không có danh mục cha --", content: "-1" }, ...categoryList.map(cat => ({ label: cat.name, content: cat.id }))]} defaultItem={selectedCategory.parent_id || "-1"} disabled={true} />
                {/* <label htmlFor="parentCategory">Danh mục cha</label>
                <select
                    disabled={true}
                    id="parentCategory"
                    name="parentCategory"
                    className="block w-full px-4 py-2 rounded-md border-1 border-gray-300 bg-gray-200">
                    <option value={""}>{selectedParentName}</option>
                </select> */}
                <label
                    htmlFor="categoryImage"
                    className="block">Banner danh mục</label>
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
                    {!isUploading ? "Cập nhật danh mục" : "Đang cập nhật..."}
                </button>
            </form>
        </div>
    )
}