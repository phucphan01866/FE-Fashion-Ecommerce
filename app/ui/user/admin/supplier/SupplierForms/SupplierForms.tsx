import { useAdminSupplierContext } from "@/context/AdminContexts/AdminSupplierContext";
import SupplierCreateForm from "@/app/ui/user/admin/supplier/SupplierCreateForm/SupplierCreateForm";
import SupplierEditForm from "@/app/ui/user/admin/supplier/SupplierEditForm/SupplierEditForm";

export default function SupplierForms() {
    const { isEditing } = useAdminSupplierContext();
    return (
        !isEditing ? (
            <SupplierCreateForm />
        ) : (
            <SupplierEditForm />
        )
    )
}