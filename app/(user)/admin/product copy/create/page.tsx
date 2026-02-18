'use client'

import { BaseUserPageLayout } from "@/app/ui/user/general/general";
import { AdminCreateProductProvider } from "@/context/AdminContexts/AdminCreateProductContext";
import { AdminCategoryProvider } from "@/context/AdminContexts/AdminCategoryContext";
import { AdminSupplierProvider } from "@/context/AdminContexts/AdminSupplierContext";
import Forms from "@/app/ui/user/admin/product/create/Forms";

export default function AdminProductPage() {

    return (
        <AdminCategoryProvider>
            <AdminSupplierProvider>
                <AdminCreateProductProvider>
                    <BaseUserPageLayout>
                        <Forms />
                    </BaseUserPageLayout>
                </AdminCreateProductProvider>
            </AdminSupplierProvider>
        </AdminCategoryProvider>
    );
}