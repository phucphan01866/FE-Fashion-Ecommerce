'use client'

import { BaseUserPageLayout } from "@/app/ui/user/general/general";
import { AdminUpdateProductProvider } from "@/context/AdminContexts/AdminUpdateProductContext";
import { AdminCategoryProvider } from "@/context/AdminContexts/AdminCategoryContext";
import { AdminSupplierProvider } from "@/context/AdminContexts/AdminSupplierContext";
import Forms from "@/app/ui/user/admin/product/edit/Forms";

export default function Page() {

    return (
        <AdminUpdateProductProvider>
            <BaseUserPageLayout>
                <Forms />
            </BaseUserPageLayout>
        </AdminUpdateProductProvider>
    );
}       