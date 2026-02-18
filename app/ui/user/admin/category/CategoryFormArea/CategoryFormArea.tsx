import { useAdminCategoryContext } from "@/context/AdminContexts/AdminCategoryContext";
import CategoryCreateFormArea from "../CategoryCreateFormArea/CategoryCreateFormArea";
import CategoryEditFormArea from "../CategoryEditFormArea/CategoryEditFormArea";
import { useAdminEditCategoryContext } from "@/context/AdminContexts/AdminEditCategoryContext";

export default function CategoryFormArea() {
    const { isEditing } = useAdminEditCategoryContext();
    return (
        isEditing ? (<CategoryEditFormArea />) : (<CategoryCreateFormArea />)
    )
}