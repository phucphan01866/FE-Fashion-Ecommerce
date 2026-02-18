'use client'

import { Title, BaseUserPageLayout, VoidGeneralButton } from "@/app/ui/user/general/general";
import { AdminCategoryProvider } from "@/context/AdminContexts/AdminCategoryContext";
import { AdminEditCategoryProvider } from "@/context/AdminContexts/AdminEditCategoryContext";
import CategoryListArea from "@/app/ui/user/admin/category/CategoryListArea/CategoryListArea";
import CategoryFormArea from "@/app/ui/user/admin/category/CategoryFormArea/CategoryFormArea";

export default function AdminCategoryPage() {
    return (
        <AdminCategoryProvider>
            <AdminEditCategoryProvider>
                <BaseUserPageLayout>
                    <Title>
                        <p>Quản lý danh mục</p>
                        <VoidGeneralButton />
                    </Title>
                    <div className={`AdminCategoryPageContent grid grid-cols-[67%_1fr] gap-4`}>
                        <CategoryListArea />
                        <CategoryFormArea />
                    </div>
                </BaseUserPageLayout>
            </AdminEditCategoryProvider>
        </AdminCategoryProvider>
    );
}