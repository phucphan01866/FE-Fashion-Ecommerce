'use client'

import { Title, BaseUserPageLayout, GeneralButton } from "@/app/ui/user/general/general";
import ProductList from "@/app/ui/user/admin/product/list/ProductList/ProductList";
import { AdminProductProvider } from "@/context/AdminContexts/AdminProductContext";
import { AdminSupplierProvider, useAdminSupplierContext } from "@/context/AdminContexts/AdminSupplierContext";
import { AdminCategoryProvider, useAdminCategoryContext } from "@/context/AdminContexts/AdminCategoryContext";

export default function AdminProductPage() {

    return (
        <AdminSupplierProvider>
            <AdminCategoryProvider>
                <AdminProductProvider>
                    <BaseUserPageLayout>
                        <Title additionalCSS="flex items-center justify-between">
                            <p>Quản lý sản phẩm</p>
                            <GeneralButton href={`/admin/product/create`}>+ Thêm sản phẩm mới</GeneralButton>
                        </Title>
                        <div className={`AdminProductPage grid grid-cols-[1fr] gap-4`}>
                            <ProductList />
                        </div>
                    </BaseUserPageLayout>
                </AdminProductProvider>
            </AdminCategoryProvider>
        </AdminSupplierProvider>
    );
}