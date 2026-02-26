
import { useAdminCategoryContext } from "@/context/AdminContexts/AdminCategoryContext";
import { sectionCSS } from "../../../general/general";
import { TypeCategory } from "@/service/category.service";
import Image from "next/image";
import { deleteCategory } from "@/service/category.service";
import { useState } from "react";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useAdminEditCategoryContext } from "@/context/AdminContexts/AdminEditCategoryContext";
import { ControllableInputSelect } from "@/app/ui/general/Input/Input";

export default function CategoryListArea() {
    const { categoryList } = useAdminCategoryContext();
    const [filterId, setFilterId] = useState<string>('');
    return (
        <div className={`CategoryTable ${sectionCSS} flex-1 flex flex-col gap-4`}>
            <FilterArea categoryList={categoryList} filterId={filterId} setFilterId={setFilterId} />
            <TableArea categoryList={
                filterId && filterId !== '' ? (
                    [categoryList.find(cat => cat.id === filterId)!,
                    ...categoryList.filter(cat => {
                        if (filterId === '') return true;
                        return (cat.parent_id === filterId);
                    }).sort((a, b) => a.name.localeCompare(b.name, 'vi'))]
                )
                    : categoryList
            } />
        </div>
    )
}
function FilterArea({ categoryList, filterId, setFilterId }: { categoryList: TypeCategory[], filterId: string, setFilterId: React.Dispatch<React.SetStateAction<string>> }) {
    return (
        <div className={`FilterArea`}>
            <ControllableInputSelect
                id=""
                label="Lọc theo danh mục cha"
                currentValue={filterId}
                items={
                    [{ content: '', label: 'Tất cả' },
                    ...categoryList.filter(cat => (cat.parent_id === '' || cat.parent_id === null)).map(cat => ({ content: cat.id, label: cat.name }))
                    ]
                }
                onClick={(value) => setFilterId(value)}
            />
        </div>
    )
}
function TableArea({ categoryList }: { categoryList: TypeCategory[] }) {

    return (
        <table className={`TableArea border-separate border-spacing-4`}>
            <thead className="">
                <tr>
                    <th>Tên danh mục</th>
                    <th>Danh mục cha</th>
                    <th>Đường dẫn ảnh</th>
                    <th>Lựa chọn</th>
                </tr>
            </thead>
            <tbody className="">
                {categoryList.map((category, index) => (
                    <CategoryItem index={index} key={category.id} category={category} />
                ))}
            </tbody>
        </table>
    )
}

function CategoryItem({ index, category }: { index: number, category: TypeCategory }) {
    const { setNotification } = useNotificateArea();
    const { categoryList, fetchCategories } = useAdminCategoryContext();
    const { selectedCategory, setSelectedCategory, isEditing, setIsEditing } = useAdminEditCategoryContext();

    const tdCSS = "py-4 px-2 text-center";
    async function deleteClickHandle(id: string, isCascade: boolean) {
        if (confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
            await deleteCategory(id, isCascade);
            setNotification("Xóa thành công!");
            await fetchCategories();
        }
    }
    function toggleEdit(category: TypeCategory) {
        if (selectedCategory === category) {
            setIsEditing(false);
            setSelectedCategory({ id: '', name: '', parent_id: '', image: '' });
        } else {
            setSelectedCategory(category);
            setIsEditing(true);
        }
    }
    return (
        <tr className="" key={category.id}>
            <td className={tdCSS}>{category.name}</td>
            <td className={tdCSS}>{categoryList.find(cat => cat.id === category.parent_id)?.name || "N/A"}</td>
            <td className="">
                {category.image &&
                    <Image className="mx-auto" src={category.image} alt={`${category.name}'s banner`} width={100} height={48} />
                }
            </td>
            <td className="">
                <div className="flex gap-3 justify-center">
                    <button onClick={() => toggleEdit(category)} className="py-4 hover:text-orange-500 hover:cursor-pointer">Sửa</button>
                    <button onClick={() => deleteClickHandle(category.id, category.parent_id !== '' ? true : false)} className="py-4 hover:text-orange-500 hover:cursor-pointer">Xóa</button>
                </div>
            </td>
        </tr>
    );
}