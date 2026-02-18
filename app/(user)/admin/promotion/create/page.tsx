'use client'

import { BaseUserPageLayout } from "@/app/ui/user/general/general";
import { AdminCreateProductProvider } from "@/context/AdminContexts/AdminCreateProductContext";
import { AdminCategoryProvider } from "@/context/AdminContexts/AdminCategoryContext";
import { AdminSupplierProvider } from "@/context/AdminContexts/AdminSupplierContext";
import { PromotionForm } from "@/app/ui/user/admin/promotion/PromotionForm";

export default function Page() {

    return (
        <AdminCategoryProvider>
            <AdminSupplierProvider>
                <BaseUserPageLayout>
                    <PromotionForm />
                </BaseUserPageLayout>
            </AdminSupplierProvider>
        </AdminCategoryProvider>
    );
}