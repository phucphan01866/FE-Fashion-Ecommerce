'use client'

import Link from "next/link";
import { Title, BaseUserPageLayout } from "@/app/ui/user/general/general";
import ProductList from "@/app/ui/user/admin/product/list/ProductList/ProductList";
import { AdminProductProvider } from "@/context/AdminContexts/AdminProductContext";
import { AdminSupplierProvider, useAdminSupplierContext } from "@/context/AdminContexts/AdminSupplierContext";
import { AdminCategoryProvider, useAdminCategoryContext } from "@/context/AdminContexts/AdminCategoryContext";
import { useParams } from "next/navigation";


export default function AdminProductPage() {

    return (
        <BaseUserPageLayout>
            <Title additionalCSS="flex items-center justify-between">
                <p>Quản lý sản phẩm</p>
                <Link className="cursor-default px-3 py-3 rounded-md bg-orange-500 hover:bg-orange-400 fontA4 text-white" href={`/admin/product/create`}>Thêm sản phẩm mới</Link>
            </Title>
            <div className={`AdminProductPage grid grid-cols-[1fr] gap-4`}>
                <ProductList />
            </div>
        </BaseUserPageLayout>

    );
}